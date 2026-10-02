<script setup lang="ts">
import { refreshNuxtData } from '#app'

type TransactionItem = {
  ID?: number
  Type?: 'income' | 'expense'
  Amount?: number
  Note?: string
  Date?: string
  date?: string
  CreatedAt?: string
}

const apiBase = useRuntimeConfig().public.apiBase
const userIdCookie = useCookie('user_id')
const userId = userIdCookie.value || '0'
const search = ref('')
const selectedType = ref('all')
const transactionToDelete = ref<number | null>(null)

const { data, pending, error } = await useFetch<{ data: TransactionItem[] }>(`${apiBase}/transactions`, {
  key: 'transactions-list',
  params: { user_id: userId }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value || 0)
}

const getRawDate = (item: TransactionItem) => item.Date || item.date || item.CreatedAt || ''

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))
}

const formatGroupDate = (dateString: string) => {
  if (!dateString) return 'Tanpa tanggal'
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString))
}

const parseNote = (note?: string) => {
  const parts = (note || '').split(' - ').map(part => part.trim()).filter(Boolean)
  return {
    allocation: parts[0] || 'Tanpa sub-alokasi',
    description: parts[1] || parts[0] || 'Transaksi',
    bank: parts[2] || '-',
    memo: parts.slice(3).join(' - ')
  }
}

const filteredTransactions = computed(() => {
  const query = search.value.trim().toLowerCase()
  return [...(data.value?.data || [])]
    .filter(item => selectedType.value === 'all' || item.Type === selectedType.value)
    .filter(item => !query || (item.Note || '').toLowerCase().includes(query))
    .sort((a, b) => new Date(getRawDate(b)).getTime() - new Date(getRawDate(a)).getTime())
})

const groupedTransactions = computed(() => {
  return filteredTransactions.value.reduce((groups, item) => {
    const key = getRawDate(item).slice(0, 10) || 'unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {} as Record<string, TransactionItem[]>)
})

const dailyTotal = (items: TransactionItem[]) => {
  return items.reduce((sum, item) => {
    if (item.Type === 'expense') return sum + (item.Amount || 0)
    return sum
  }, 0)
}

const deleteTransaction = (id?: number) => {
  if (!id) return
  transactionToDelete.value = id
}

const handleConfirmDelete = async () => {
  if (!transactionToDelete.value) return

  try {
    await $fetch(`${apiBase}/transactions/${transactionToDelete.value}`, { method: 'DELETE' })
    await refreshNuxtData('transactions-list')
  } catch (err) {
    console.error('Failed to delete transaction:', err)
    alert('Gagal menghapus transaksi.')
  } finally {
    transactionToDelete.value = null
  }
}
</script>

<template>
  <div class="flex h-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-200 p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-[#202124]">Ledger Transaksi</h2>
          <p class="text-sm text-[#5F6368]">{{ filteredTransactions.length }} transaksi ditemukan</p>
        </div>
        <select v-model="selectedType" class="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#1A73E8]">
          <option value="all">Semua</option>
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
      </div>
      <div class="relative mt-4">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input v-model="search" class="min-h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10" placeholder="Cari deskripsi, sub-alokasi, atau bank" />
      </div>
    </div>

    <div class="flex-1 overflow-auto p-5">
      <div v-if="pending" class="flex flex-col items-center justify-center py-10">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
        <p class="mt-3 text-sm font-semibold text-slate-500">Memuat transaksi...</p>
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
        Gagal memuat transaksi.
      </div>

      <div v-else-if="filteredTransactions.length === 0" class="py-12 text-center">
        <Icon name="lucide:clipboard-list" class="mx-auto h-10 w-10 text-slate-300" />
        <p class="mt-3 text-sm font-semibold text-slate-500">Belum ada transaksi sesuai filter.</p>
      </div>

      <div v-else class="space-y-6">
        <section v-for="(items, dateKey) in groupedTransactions" :key="dateKey">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-sm font-bold text-[#202124]">{{ formatGroupDate(String(dateKey)) }}</h3>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#5F6368]">Total harian {{ formatCurrency(dailyTotal(items)) }}</span>
          </div>

          <div class="space-y-2">
            <article v-for="item in items" :key="item.ID" class="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <div class="flex min-w-0 gap-3">
                <div :class="['mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', item.Type === 'income' ? 'bg-[#34A853]/10 text-[#34A853]' : 'bg-[#EA4335]/10 text-[#EA4335]']">
                  <Icon :name="item.Type === 'income' ? 'lucide:trending-up' : 'lucide:trending-down'" class="h-5 w-5" />
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-[#202124]">{{ parseNote(item.Note).description }}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-[#5F6368]">
                    <span>{{ parseNote(item.Note).allocation }}</span>
                    <span>•</span>
                    <span>{{ parseNote(item.Note).bank }}</span>
                    <span>•</span>
                    <span>{{ formatDate(getRawDate(item)) }}</span>
                  </div>
                  <p v-if="parseNote(item.Note).memo" class="mt-1 text-xs text-slate-400">{{ parseNote(item.Note).memo }}</p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <p :class="['text-sm font-bold sm:text-base', item.Type === 'income' ? 'text-[#34A853]' : 'text-[#202124]']">
                  {{ item.Type === 'income' ? '+' : '-' }}{{ formatCurrency(item.Amount || 0) }}
                </p>
                <button class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#D32F2F] hover:bg-[#D32F2F]/10" title="Hapus transaksi" @click="deleteTransaction(item.ID)">
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="transactionToDelete" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
        <div class="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl">
          <h2 class="text-lg font-bold text-[#202124]">Hapus Transaksi?</h2>
          <p class="mt-2 text-sm text-[#5F6368]">Riwayat ini akan dihapus permanen dari ledger.</p>
          <div class="mt-6 flex justify-end gap-2">
            <button class="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50" @click="transactionToDelete = null">Batal</button>
            <button class="min-h-11 rounded-lg bg-[#D32F2F] px-4 text-sm font-bold text-white hover:bg-[#B3261E]" @click="handleConfirmDelete">Hapus</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
