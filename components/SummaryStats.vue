<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
      <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Icon name="lucide:circle-dollar-sign" class="w-16 h-16 text-primary" />
      </div>
      <p class="text-sm font-medium text-slate-500 mb-1">Saldo Aktual</p>
      <div class="flex items-baseline space-x-1">
        <h3 class="text-xl sm:text-2xl font-bold text-slate-800">Rp {{ balance.toLocaleString() }}</h3>
      </div>
      <div class="mt-4 flex items-center text-xs font-medium" :class="balance >= 0 ? 'text-emerald-600' : 'text-rose-600'">
        <Icon v-if="balance >= 0" name="lucide:trending-up" class="w-3 h-3 mr-1" />
        <Icon v-else name="lucide:trending-down" class="w-3 h-3 mr-1" />
        <span>{{ balance >= 0 ? 'Surplus aktual' : 'Defisit aktual' }}</span>
      </div>
    </div>

    <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
      <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 text-emerald-500">
        <Icon name="lucide:arrow-up-circle" class="w-16 h-16" />
      </div>
      <p class="text-sm font-medium text-slate-500 mb-1">Pemasukan Aktual</p>
      <div class="flex items-baseline space-x-1">
        <h3 class="text-xl sm:text-2xl font-bold text-emerald-600">Rp {{ totalIncome.toLocaleString() }}</h3>
      </div>
      <div class="mt-4 flex items-center text-xs font-medium text-slate-400">
        <span>Dari data transaksi</span>
      </div>
    </div>

    <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
      <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 text-rose-500">
        <Icon name="lucide:arrow-down-circle" class="w-16 h-16" />
      </div>
      <p class="text-sm font-medium text-slate-500 mb-1">Pengeluaran Aktual</p>
      <div class="flex items-baseline space-x-1">
        <h3 class="text-xl sm:text-2xl font-bold text-rose-600">Rp {{ totalExpense.toLocaleString() }}</h3>
      </div>
      <div class="mt-4 flex items-center text-xs font-medium text-slate-400">
        <span>Dari data transaksi</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const userIdCookie = useCookie('user_id')
const userId = userIdCookie.value || '0'

const { data } = await useFetch('https://budgeting-api.up.railway.app/transactions', {
  key: 'transactions-list',
  params: { user_id: userId }
})

const totalIncome = computed(() => {
  return data.value?.data?.reduce((acc, item) => {
    return item.Type === 'income' ? acc + item.Amount : acc
  }, 0) || 0
})

const totalExpense = computed(() => {
  return data.value?.data?.reduce((acc, item) => {
    return item.Type === 'expense' ? acc + item.Amount : acc
  }, 0) || 0
})

const balance = computed(() => totalIncome.value - totalExpense.value)
</script>
