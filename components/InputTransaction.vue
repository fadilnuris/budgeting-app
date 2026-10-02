<script setup lang="ts">
import { refreshNuxtData } from '#app'
import type { BudgetItem, BudgetPlan } from '~/types/budget'

type TransactionItem = {
  Type?: 'income' | 'expense'
  Amount?: number
  Note?: string
  Date?: string
  date?: string
  CreatedAt?: string
}

const apiBase = useRuntimeConfig().public.apiBase
const userIdCookie = useCookie('user_id')
const userId = parseInt(userIdCookie.value || '0', 10)
const currentMonth = new Date().toISOString().slice(0, 7)

const date = ref(new Date().toISOString().slice(0, 10))
const description = ref('')
const amount = ref(0)
const selectedAllocation = ref('')
const paymentMethod = ref('')
const notes = ref('')
const isSubmitting = ref(false)
const budgetItems = ref<BudgetItem[]>([])
const transactions = ref<TransactionItem[]>([])

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value || 0)
}

const parseCurrency = (value: string) => {
  const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

const formattedAmount = computed({
  get: () => amount.value ? formatCurrency(amount.value) : '',
  set: (value: string) => {
    amount.value = parseCurrency(value)
  }
})

const getMonthFromTransaction = (transaction: TransactionItem) => {
  const rawDate = transaction.Date || transaction.date || transaction.CreatedAt || ''
  if (/^\d{4}-\d{2}/.test(rawDate)) return rawDate.slice(0, 7)

  const parsedDate = new Date(rawDate)
  if (Number.isNaN(parsedDate.getTime())) return ''
  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
}

const getActualSpent = (item: BudgetItem) => {
  const itemName = item.name.toLowerCase()
  return transactions.value.reduce((sum, transaction) => {
    if (transaction.Type !== 'expense' || getMonthFromTransaction(transaction) !== currentMonth) return sum
    const note = (transaction.Note || '').toLowerCase()
    return note.includes(itemName) ? sum + (transaction.Amount || 0) : sum
  }, 0)
}

const allocationOptions = computed(() => {
  return budgetItems.value.map(item => {
    const spent = getActualSpent(item)
    return {
      ...item,
      spent,
      remaining: (item.nominal || 0) - spent
    }
  })
})

const selectedAllocationDetail = computed(() => {
  return allocationOptions.value.find(item => item.name === selectedAllocation.value)
})

const isOverBudget = computed(() => {
  const allocation = selectedAllocationDetail.value
  return Boolean(allocation && amount.value > allocation.remaining)
})

const loadBudgetContext = async () => {
  try {
    const [budgetResponse, transactionResponse] = await Promise.all([
      $fetch<{ data?: BudgetPlan }>(`${apiBase}/budget`, { params: { user_id: userId, month: currentMonth } }),
      $fetch<{ data?: TransactionItem[] }>(`${apiBase}/transactions`, { params: { user_id: userId } })
    ])
    budgetItems.value = budgetResponse.data?.items || []
    transactions.value = transactionResponse.data || []
    selectedAllocation.value = budgetItems.value[0]?.name || ''
  } catch (error) {
    console.error('Failed to load transaction context:', error)
  }
}

const submitForm = async () => {
  if (!description.value.trim() || amount.value <= 0 || !selectedAllocation.value || !paymentMethod.value.trim()) {
    alert('Tanggal, deskripsi, nominal, sub-alokasi, dan bank wajib diisi.')
    return
  }

  if (isOverBudget.value) {
    const proceed = confirm('Transaksi ini akan membuat sub-alokasi over budget. Tetap simpan?')
    if (!proceed) return
  }

  isSubmitting.value = true
  try {
    const notePayload = [
      selectedAllocation.value,
      description.value.trim(),
      paymentMethod.value.trim(),
      notes.value.trim()
    ].filter(Boolean).join(' - ')

    await $fetch(`${apiBase}/transactions`, {
      method: 'POST',
      body: {
        user_id: userId,
        type: 'expense',
        amount: amount.value,
        note: notePayload,
        date: date.value
      }
    })

    description.value = ''
    amount.value = 0
    notes.value = ''
    await Promise.all([loadBudgetContext(), refreshNuxtData('transactions-list')])
  } catch (error) {
    console.error('Failed to save transaction:', error)
    alert('Gagal menyimpan transaksi.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(loadBudgetContext)
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="text-lg font-bold text-[#202124]">Catat Pengeluaran</h2>
    <form class="mt-5 space-y-4" @submit.prevent="submitForm">
      <label class="block">
        <span class="text-sm font-semibold text-[#5F6368]">Tanggal</span>
        <input v-model="date" type="date" required class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10" />
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-[#5F6368]">Deskripsi</span>
        <input v-model="description" type="text" required placeholder="Contoh: Makan siang" class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10" />
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-[#5F6368]">Nominal</span>
        <input v-model="formattedAmount" inputmode="numeric" required placeholder="Rp0" class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 font-bold outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10" />
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-[#5F6368]">Dari Sub-Alokasi</span>
        <select v-model="selectedAllocation" required class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10">
          <option value="" disabled>Pilih pos budget</option>
          <option v-for="allocation in allocationOptions" :key="allocation.id || allocation.name" :value="allocation.name">
            {{ allocation.name }} - sisa {{ formatCurrency(allocation.remaining) }}
          </option>
        </select>
        <p v-if="selectedAllocationDetail" :class="['mt-1 text-xs font-semibold', isOverBudget ? 'text-[#D32F2F]' : 'text-[#34A853]']">
          Sisa budget: {{ formatCurrency(selectedAllocationDetail.remaining) }}
        </p>
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-[#5F6368]">Metode/Bank</span>
        <input v-model="paymentMethod" type="text" required placeholder="Contoh: Seabank" class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10" />
      </label>

      <label class="block">
        <span class="text-sm font-semibold text-[#5F6368]">Catatan</span>
        <input v-model="notes" type="text" placeholder="Opsional" class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10" />
      </label>

      <div v-if="isOverBudget" class="rounded-lg border border-[#D32F2F]/20 bg-[#D32F2F]/10 p-3 text-sm font-semibold text-[#D32F2F]">
        Transaksi akan melewati batas sub-alokasi.
      </div>

      <button :disabled="isSubmitting || allocationOptions.length === 0" class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1A73E8] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1558B0] disabled:opacity-60">
        <Icon :name="isSubmitting ? 'lucide:loader-2' : 'lucide:plus-circle'" :class="['h-4 w-4', isSubmitting ? 'animate-spin' : '']" />
        {{ isSubmitting ? 'Menyimpan' : 'Simpan Pengeluaran' }}
      </button>
    </form>
  </div>
</template>
