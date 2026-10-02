<script setup lang="ts">
import type { BudgetPlan } from '~/types/budget'

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
const userId = userIdCookie.value || '0'
const currentMonth = new Date().toISOString().slice(0, 7)
const today = new Date().toISOString().slice(0, 10)

const { data: budgetData } = await useFetch<{ data?: BudgetPlan }>(`${apiBase}/budget`, {
  key: `dashboard-budget-${currentMonth}`,
  params: { user_id: userId, month: currentMonth }
})

const { data: transactionData } = await useFetch<{ data?: TransactionItem[] }>(`${apiBase}/transactions`, {
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

const getRawDate = (transaction: TransactionItem) => transaction.Date || transaction.date || transaction.CreatedAt || ''

const isCurrentMonth = (transaction: TransactionItem) => getRawDate(transaction).slice(0, 7) === currentMonth

const budget = computed(() => budgetData.value?.data)
const totalIncome = computed(() => budget.value?.income || 0)
const totalAllocated = computed(() => budget.value?.items?.reduce((sum, item) => sum + (item.nominal || 0), 0) || 0)
const unallocated = computed(() => totalIncome.value - totalAllocated.value)

const monthlyExpense = computed(() => {
  return (transactionData.value?.data || []).reduce((sum, transaction) => {
    if (transaction.Type === 'expense' && isCurrentMonth(transaction)) return sum + (transaction.Amount || 0)
    return sum
  }, 0)
})

const todayExpense = computed(() => {
  return (transactionData.value?.data || []).reduce((sum, transaction) => {
    if (transaction.Type === 'expense' && getRawDate(transaction).slice(0, 10) === today) return sum + (transaction.Amount || 0)
    return sum
  }, 0)
})

const usedPercentage = computed(() => {
  if (totalAllocated.value <= 0) return 0
  return Math.min((monthlyExpense.value / totalAllocated.value) * 100, 999)
})

const cards = computed(() => [
  {
    label: 'Total Pemasukan',
    value: formatCurrency(totalIncome.value),
    icon: 'lucide:wallet',
    tone: 'text-[#1A73E8]',
    helper: 'Budget bulan aktif'
  },
  {
    label: 'Uang Dialokasikan',
    value: formatCurrency(totalAllocated.value),
    icon: 'lucide:pie-chart',
    tone: 'text-[#34A853]',
    helper: `${budget.value?.items?.length || 0} sub-alokasi`
  },
  {
    label: 'Sisa / Unallocated',
    value: formatCurrency(unallocated.value),
    icon: unallocated.value === 0 ? 'lucide:check-circle-2' : 'lucide:alert-circle',
    tone: unallocated.value === 0 ? 'text-[#34A853]' : unallocated.value < 0 ? 'text-[#D32F2F]' : 'text-[#FF8F00]',
    helper: unallocated.value === 0 ? 'ZBB tercapai' : 'Perlu dialokasikan'
  },
  {
    label: 'Pengeluaran Hari Ini',
    value: formatCurrency(todayExpense.value),
    icon: 'lucide:receipt',
    tone: 'text-[#EA4335]',
    helper: `${usedPercentage.value.toFixed(1)}% budget bulan ini terpakai`
  }
])
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article v-for="card in cards" :key="card.label" class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-wide text-[#5F6368]">{{ card.label }}</p>
          <h3 class="mt-3 text-xl font-bold text-[#202124]">{{ card.value }}</h3>
        </div>
        <div :class="['flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50', card.tone]">
          <Icon :name="card.icon" class="h-5 w-5" />
        </div>
      </div>
      <p :class="['mt-4 text-xs font-semibold', card.tone]">{{ card.helper }}</p>
    </article>
  </div>
</template>
