<script setup lang="ts">
import Navbar from '~/components/Navbar.vue'
import MonthPicker from '~/components/MonthPicker.vue'
import type { BudgetCategory, BudgetItem, BudgetPlan } from '~/types/budget'

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
const userId = parseInt(userIdCookie.value || '0', 10)

const currentMonth = ref(new Date().toISOString().slice(0, 7))
const income = ref(0)
const items = ref<BudgetItem[]>([])
const categories = ref<BudgetCategory[]>([])
const transactions = ref<TransactionItem[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const isItemModalOpen = ref(false)
const isEditingItem = ref(false)
const itemDraft = ref<BudgetItem>({ name: '', nominal: 0, category: 'Kebutuhan' })
const itemToDelete = ref<number | null>(null)

const categoryBlueprint: BudgetCategory[] = [
  { name: 'Tabungan', color: 'savings', allocatedAmount: 0, bankName: 'Blu' },
  { name: 'Kebutuhan', color: 'needs', allocatedAmount: 0, bankName: 'Linebank' },
  { name: 'Keinginan', color: 'wants', allocatedAmount: 0, bankName: 'Seabank' }
]

const normalizeCategories = (incoming?: BudgetCategory[]) => {
  return categoryBlueprint.map(defaultCategory => {
    const found = incoming?.find(category => category.name === defaultCategory.name)
    return {
      ...defaultCategory,
      ...found,
      color: defaultCategory.color,
      allocatedAmount: found?.allocatedAmount ?? inferCategoryAllocation(defaultCategory.name, incoming)
    }
  })
}

const inferCategoryAllocation = (categoryName: string, incoming?: BudgetCategory[]) => {
  const category = incoming?.find(item => item.name === categoryName)
  return category?.allocatedAmount || 0
}

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

const formattedIncome = computed({
  get: () => income.value ? formatCurrency(income.value) : '',
  set: (value: string) => {
    income.value = parseCurrency(value)
  }
})

const formattedItemNominal = computed({
  get: () => itemDraft.value.nominal ? formatCurrency(itemDraft.value.nominal) : '',
  set: (value: string) => {
    itemDraft.value.nominal = parseCurrency(value)
  }
})

const totalCategoryAllocation = computed(() => {
  return categories.value.reduce((sum, category) => sum + (category.allocatedAmount || 0), 0)
})

const totalSubAllocation = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.nominal || 0), 0)
})

const unallocatedMoney = computed(() => income.value - totalSubAllocation.value)
const categoryRemaining = computed(() => income.value - totalCategoryAllocation.value)
const zbbReady = computed(() => income.value > 0 && totalSubAllocation.value === income.value && totalCategoryAllocation.value === income.value)

const getMonthFromTransaction = (transaction: TransactionItem) => {
  const rawDate = transaction.Date || transaction.date || transaction.CreatedAt || ''
  if (/^\d{4}-\d{2}/.test(rawDate)) return rawDate.slice(0, 7)

  const parsedDate = new Date(rawDate)
  if (Number.isNaN(parsedDate.getTime())) return ''
  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
}

const monthlyTransactions = computed(() => {
  return transactions.value.filter(transaction => getMonthFromTransaction(transaction) === currentMonth.value)
})

const getActualSpent = (item: BudgetItem) => {
  const itemName = item.name.toLowerCase()
  return monthlyTransactions.value.reduce((sum, transaction) => {
    if (transaction.Type !== 'expense') return sum
    const note = (transaction.Note || '').toLowerCase()
    return note.includes(itemName) ? sum + (transaction.Amount || 0) : sum
  }, 0)
}

const allocationRows = computed(() => {
  return [...items.value].map(item => {
    const actualSpent = getActualSpent(item)
    const usage = item.nominal > 0 ? (actualSpent / item.nominal) * 100 : 0
    const remaining = item.nominal - actualSpent
    return { ...item, actualSpent, usage, remaining }
  }).sort((a, b) => b.usage - a.usage)
})

const categoryRows = computed(() => {
  return categories.value.map(category => {
    const subAllocated = items.value
      .filter(item => item.category === category.name)
      .reduce((sum, item) => sum + (item.nominal || 0), 0)
    const actualSpent = allocationRows.value
      .filter(item => item.category === category.name)
      .reduce((sum, item) => sum + item.actualSpent, 0)
    const percentage = income.value > 0 ? ((category.allocatedAmount || 0) / income.value) * 100 : 0
    return { ...category, subAllocated, actualSpent, percentage, remaining: (category.allocatedAmount || 0) - subAllocated }
  })
})

const chartSeries = computed(() => categories.value.map(category => category.allocatedAmount || 0))
const chartOptions = computed(() => ({
  labels: categories.value.map(category => category.name),
  colors: ['#34A853', '#FBBC04', '#EA4335'],
  legend: { position: 'bottom' },
  chart: { fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
  dataLabels: {
    formatter: (_: number, opts: any) => {
      const value = opts.w.config.series[opts.seriesIndex] || 0
      return income.value > 0 ? `${((value / income.value) * 100).toFixed(1)}%` : '0%'
    }
  },
  tooltip: { y: { formatter: (value: number) => formatCurrency(value) } }
}))

const categoryClass = (name: string) => {
  if (name === 'Tabungan') return 'bg-[#34A853]/10 text-[#1E7E34] border-[#34A853]/20'
  if (name === 'Kebutuhan') return 'bg-[#FBBC04]/15 text-[#8A6500] border-[#FBBC04]/30'
  return 'bg-[#EA4335]/10 text-[#B3261E] border-[#EA4335]/20'
}

const progressClass = (usage: number) => {
  if (usage > 90) return 'bg-[#D32F2F]'
  if (usage > 70) return 'bg-[#FF8F00]'
  return 'bg-[#00C853]'
}

const updateCategoryByAmount = (index: number, value: string) => {
  categories.value[index].allocatedAmount = parseCurrency(value)
}

const updateCategoryByPercent = (index: number, value: string) => {
  const parsed = parseFloat(value)
  categories.value[index].allocatedAmount = Number.isNaN(parsed) ? 0 : Math.round((parsed / 100) * income.value)
}

const fetchBudget = async () => {
  const response = await $fetch<{ data?: BudgetPlan }>(`${apiBase}/budget`, {
    params: { user_id: userId, month: currentMonth.value }
  })

  income.value = response.data?.income || 0
  items.value = response.data?.items || []
  categories.value = normalizeCategories(response.data?.categories)
}

const fetchTransactions = async () => {
  const response = await $fetch<{ data?: TransactionItem[] }>(`${apiBase}/transactions`, {
    params: { user_id: userId }
  })
  transactions.value = response.data || []
}

const loadPage = async () => {
  isLoading.value = true
  try {
    await Promise.all([fetchBudget(), fetchTransactions()])
  } catch (error) {
    console.error('Failed to load budget page:', error)
    categories.value = normalizeCategories()
  } finally {
    isLoading.value = false
  }
}

const saveBudget = async () => {
  if (income.value <= 0) {
    alert('Total pemasukan wajib lebih dari Rp0.')
    return
  }
  if (totalCategoryAllocation.value > income.value) {
    alert('Total kategori utama tidak boleh melebihi total pemasukan.')
    return
  }
  if (totalSubAllocation.value > income.value) {
    alert('Total sub-alokasi tidak boleh melebihi total pemasukan.')
    return
  }

  isSaving.value = true
  try {
    await $fetch(`${apiBase}/budget`, {
      method: 'POST',
      body: {
        user_id: userId,
        month: currentMonth.value,
        income: income.value,
        items: items.value,
        categories: categories.value
      }
    })
    await fetchBudget()
    alert(zbbReady.value ? 'Budget bulan ini tersimpan dan ZBB tercapai.' : 'Budget tersimpan. Masih ada alokasi yang perlu diselesaikan.')
  } catch (error) {
    console.error('Failed to save budget:', error)
    alert('Gagal menyimpan budget.')
  } finally {
    isSaving.value = false
  }
}

const openAddItem = () => {
  isEditingItem.value = false
  itemDraft.value = { name: '', nominal: 0, category: 'Kebutuhan' }
  isItemModalOpen.value = true
}

const openEditItem = (item: BudgetItem) => {
  isEditingItem.value = true
  itemDraft.value = { ...item }
  isItemModalOpen.value = true
}

const saveItem = async () => {
  if (!itemDraft.value.name.trim() || itemDraft.value.nominal <= 0) {
    alert('Nama dan nominal sub-alokasi wajib diisi.')
    return
  }

  const currentNominal = isEditingItem.value ? (items.value.find(item => item.id === itemDraft.value.id)?.nominal || 0) : 0
  const nextTotal = totalSubAllocation.value - currentNominal + itemDraft.value.nominal
  const categoryBudget = categories.value.find(category => category.name === itemDraft.value.category)?.allocatedAmount || 0
  const categoryCurrent = items.value
    .filter(item => item.category === itemDraft.value.category && item.id !== itemDraft.value.id)
    .reduce((sum, item) => sum + (item.nominal || 0), 0)

  if (nextTotal > income.value) {
    alert('Total sub-alokasi tidak boleh melebihi pemasukan.')
    return
  }
  if (categoryCurrent + itemDraft.value.nominal > categoryBudget) {
    alert(`Sub-alokasi kategori ${itemDraft.value.category} melebihi budget kategori utama.`)
    return
  }

  try {
    if (isEditingItem.value && itemDraft.value.id) {
      await $fetch(`${apiBase}/budget/items/${itemDraft.value.id}`, {
        method: 'PUT',
        body: {
          name: itemDraft.value.name,
          nominal: itemDraft.value.nominal,
          category: itemDraft.value.category
        }
      })
    } else {
      await $fetch(`${apiBase}/budget/items`, {
        method: 'POST',
        body: {
          user_id: userId,
          month: currentMonth.value,
          name: itemDraft.value.name,
          nominal: itemDraft.value.nominal,
          category: itemDraft.value.category
        }
      })
    }
    isItemModalOpen.value = false
    await fetchBudget()
  } catch (error) {
    console.error('Failed to save allocation:', error)
    alert('Gagal menyimpan sub-alokasi.')
  }
}

const confirmDelete = (id?: number) => {
  if (!id) return
  itemToDelete.value = id
}

const deleteItem = async () => {
  if (!itemToDelete.value) return

  try {
    await $fetch(`${apiBase}/budget/items/${itemToDelete.value}`, { method: 'DELETE' })
    await fetchBudget()
  } catch (error) {
    console.error('Failed to delete allocation:', error)
    alert('Gagal menghapus sub-alokasi.')
  } finally {
    itemToDelete.value = null
  }
}

const handleMonthChange = async () => {
  await loadPage()
}

onMounted(loadPage)

useHead({ title: 'MoneyPlan Budgeting' })
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FA] px-4 pb-24 pt-24 sm:px-6 lg:px-8">
    <Navbar />

    <div v-if="isLoading" class="flex min-h-[60vh] flex-col items-center justify-center">
      <div class="h-11 w-11 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
      <p class="mt-4 text-sm font-semibold text-slate-500">Memuat budget MoneyPlan...</p>
    </div>

    <main v-else class="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Zero-Based Budgeting</p>
          <h1 class="mt-2 text-2xl font-bold tracking-tight text-[#202124]">MoneyPlan Budget Bulanan</h1>
          <p class="mt-1 max-w-2xl text-sm text-[#5F6368]">Atur pemasukan, tiga pilar finansial, dan sub-alokasi sampai setiap rupiah punya tugas.</p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <MonthPicker v-model="currentMonth" @change="handleMonthChange" />
          <button
            type="button"
            :disabled="isSaving"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A73E8] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#1558B0] disabled:opacity-60"
            @click="saveBudget"
          >
            <Icon :name="isSaving ? 'lucide:loader-2' : 'lucide:save'" :class="['h-4 w-4', isSaving ? 'animate-spin' : '']" />
            {{ isSaving ? 'Menyimpan' : 'Simpan Budget' }}
          </button>
        </div>
      </header>

      <section class="grid gap-4 lg:grid-cols-4">
        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label class="text-xs font-bold uppercase tracking-wide text-[#5F6368]">Total Pemasukan</label>
          <div class="relative mt-3">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
            <input
              v-model="formattedIncome"
              inputmode="numeric"
              class="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-lg font-bold text-[#202124] outline-none transition focus:border-[#1A73E8] focus:bg-white focus:ring-2 focus:ring-[#1A73E8]/10"
              placeholder="0"
            />
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wide text-[#5F6368]">Kategori Utama</p>
          <p class="mt-3 text-xl font-bold text-[#202124]">{{ formatCurrency(totalCategoryAllocation) }}</p>
          <p :class="['mt-2 text-xs font-semibold', categoryRemaining === 0 ? 'text-[#34A853]' : categoryRemaining < 0 ? 'text-[#D32F2F]' : 'text-[#5F6368]']">
            {{ categoryRemaining === 0 ? 'ZBB kategori tercapai' : `${formatCurrency(Math.abs(categoryRemaining))} ${categoryRemaining > 0 ? 'belum dialokasikan' : 'melebihi pemasukan'}` }}
          </p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wide text-[#5F6368]">Sub-Alokasi</p>
          <p class="mt-3 text-xl font-bold text-[#202124]">{{ formatCurrency(totalSubAllocation) }}</p>
          <p :class="['mt-2 text-xs font-semibold', unallocatedMoney === 0 ? 'text-[#34A853]' : unallocatedMoney < 0 ? 'text-[#D32F2F]' : 'text-[#5F6368]']">
            {{ unallocatedMoney === 0 ? 'Semua rupiah sudah bertugas' : `${formatCurrency(Math.abs(unallocatedMoney))} ${unallocatedMoney > 0 ? 'belum dialokasikan' : 'defisit'}` }}
          </p>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wide text-[#5F6368]">Status</p>
          <div :class="['mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold', zbbReady ? 'border-[#34A853]/30 bg-[#34A853]/10 text-[#1E7E34]' : 'border-[#FF8F00]/30 bg-[#FF8F00]/10 text-[#8A6500]']">
            <Icon :name="zbbReady ? 'lucide:check-circle-2' : 'lucide:alert-circle'" class="h-4 w-4" />
            {{ zbbReady ? 'ZBB Tercapai' : 'Perlu Review' }}
          </div>
          <p class="mt-3 text-xs text-[#5F6368]">Target PRD: Total Pemasukan - Total Alokasi = Rp0.</p>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-[#202124]">3 Pilar Finansial</h2>
              <p class="text-sm text-[#5F6368]">Masukkan nominal atau persentase dan rekening tujuan tiap kategori.</p>
            </div>
          </div>

          <div class="space-y-3">
            <div v-for="(category, index) in categories" :key="category.name" class="rounded-lg border border-slate-200 p-4">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <span :class="['inline-flex rounded-full border px-2.5 py-1 text-xs font-bold', categoryClass(category.name)]">{{ category.name }}</span>
                  <p class="mt-2 text-xs text-[#5F6368]">Dialokasikan {{ formatCurrency(categoryRows[index]?.subAllocated || 0) }} dari {{ formatCurrency(category.allocatedAmount || 0) }}</p>
                </div>
                <div class="grid flex-1 gap-3 sm:grid-cols-3">
                  <input
                    :value="category.allocatedAmount ? formatCurrency(category.allocatedAmount) : ''"
                    inputmode="numeric"
                    class="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10"
                    placeholder="Nominal"
                    @input="updateCategoryByAmount(index, ($event.target as HTMLInputElement).value)"
                  />
                  <input
                    :value="income > 0 ? (((category.allocatedAmount || 0) / income) * 100).toFixed(1) : ''"
                    inputmode="decimal"
                    class="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10"
                    placeholder="%"
                    @input="updateCategoryByPercent(index, ($event.target as HTMLInputElement).value)"
                  />
                  <input
                    v-model="category.bankName"
                    class="min-h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10"
                    placeholder="Bank/Rekening"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="text-lg font-bold text-[#202124]">Distribusi Budget</h2>
          <ClientOnly>
            <apexchart v-if="chartSeries.some(Boolean)" type="donut" height="280" :options="chartOptions" :series="chartSeries" />
            <div v-else class="flex h-[280px] items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-slate-400">Isi kategori untuk melihat chart</div>
          </ClientOnly>
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-bold text-[#202124]">Sub-Alokasi Pengeluaran</h2>
            <p class="text-sm text-[#5F6368]">Pos detail yang dipakai transaksi harian dan progress budget.</p>
          </div>
          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A73E8] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1558B0]"
            @click="openAddItem"
          >
            <Icon name="lucide:plus" class="h-4 w-4" />
            Tambah Sub-Alokasi
          </button>
        </div>

        <div v-if="allocationRows.length === 0" class="p-10 text-center">
          <Icon name="lucide:list-plus" class="mx-auto h-10 w-10 text-slate-300" />
          <p class="mt-3 text-sm font-semibold text-slate-500">Belum ada sub-alokasi.</p>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <article v-for="item in allocationRows" :key="item.id || item.name" class="p-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-bold text-[#202124]">{{ item.name }}</h3>
                  <span :class="['rounded-full border px-2 py-0.5 text-xs font-bold', categoryClass(item.category)]">{{ item.category }}</span>
                  <span v-if="item.remaining < 0" class="rounded-full bg-[#D32F2F]/10 px-2 py-0.5 text-xs font-bold text-[#D32F2F]">OVER {{ formatCurrency(Math.abs(item.remaining)) }}</span>
                </div>
                <p class="mt-1 text-sm text-[#5F6368]">Terpakai {{ formatCurrency(item.actualSpent) }} dari {{ formatCurrency(item.nominal) }} - Sisa {{ formatCurrency(item.remaining) }}</p>
              </div>
              <div class="flex gap-2">
                <button class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Edit" @click="openEditItem(item)">
                  <Icon name="lucide:pencil" class="h-4 w-4" />
                </button>
                <button class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50" title="Hapus" @click="confirmDelete(item.id)">
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </button>
              </div>
            </div>
            <div class="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div :class="['h-full rounded-full transition-all', progressClass(item.usage)]" :style="{ width: `${Math.min(item.usage, 100)}%` }"></div>
            </div>
            <div class="mt-2 flex justify-between text-xs font-semibold text-slate-500">
              <span>{{ item.usage.toFixed(1) }}% terpakai</span>
              <span>{{ income > 0 ? ((item.nominal / income) * 100).toFixed(1) : '0.0' }}% dari income</span>
            </div>
          </article>
        </div>
      </section>
    </main>

    <Teleport to="body">
      <div v-if="isItemModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
        <div class="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl">
          <h2 class="text-lg font-bold text-[#202124]">{{ isEditingItem ? 'Edit Sub-Alokasi' : 'Tambah Sub-Alokasi' }}</h2>
          <div class="mt-5 space-y-4">
            <label class="block">
              <span class="text-sm font-semibold text-[#5F6368]">Nama</span>
              <input v-model="itemDraft.name" class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10" placeholder="Contoh: Makan" />
            </label>
            <label class="block">
              <span class="text-sm font-semibold text-[#5F6368]">Nominal Budget</span>
              <input v-model="formattedItemNominal" inputmode="numeric" class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 font-semibold outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10" placeholder="Rp0" />
            </label>
            <label class="block">
              <span class="text-sm font-semibold text-[#5F6368]">Kategori</span>
              <select v-model="itemDraft.category" class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10">
                <option v-for="category in categories" :key="category.name" :value="category.name">{{ category.name }}</option>
              </select>
            </label>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button class="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50" @click="isItemModalOpen = false">Batal</button>
            <button class="min-h-11 rounded-lg bg-[#1A73E8] px-4 text-sm font-bold text-white hover:bg-[#1558B0]" @click="saveItem">Simpan</button>
          </div>
        </div>
      </div>

      <div v-if="itemToDelete" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
        <div class="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl">
          <h2 class="text-lg font-bold text-[#202124]">Hapus Sub-Alokasi?</h2>
          <p class="mt-2 text-sm text-[#5F6368]">Jika sudah ada transaksi terkait, pastikan datanya masih bisa dilacak dari riwayat transaksi.</p>
          <div class="mt-6 flex justify-end gap-2">
            <button class="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50" @click="itemToDelete = null">Batal</button>
            <button class="min-h-11 rounded-lg bg-[#D32F2F] px-4 text-sm font-bold text-white hover:bg-[#B3261E]" @click="deleteItem">Hapus</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
