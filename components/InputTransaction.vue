<script setup>
import { ref } from 'vue'
import { refreshNuxtData } from '#app'

const type = ref('expense')
const amount = ref('')
const note = ref('')
const date = ref(new Date().toISOString().substr(0, 10))
const isSubmitting = ref(false)

const submitForm = async () => {
  isSubmitting.value = true
  try {
    await $fetch('https://budgeting-api.up.railway.app/transactions', {
      method: 'POST',
      body: {
        user_id: 1,
        type: type.value,
        amount: Number(amount.value),
        note: note.value,
        date: date.value
      }
    })
    amount.value = ''
    note.value = ''
    await refreshNuxtData('transactions-list')
  } catch (e) {
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="glass-card p-6 rounded-2xl">
    <h2 class="text-xl font-bold text-slate-800 mb-6">Tambah Transaksi</h2>
    <form @submit.prevent="submitForm" class="space-y-5">
      
      <div class="space-y-1.5">
        <label class="text-sm font-medium text-slate-700">Jenis</label>
        <div class="relative">
          <select v-model="type" class="w-full appearance-none bg-white/50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none transition-all shadow-sm">
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
            <Icon name="lucide:chevron-down" class="w-4 h-4" />
          </div>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium text-slate-700">Tanggal</label>
        <input
          v-model="date"
          type="date"
          required
          class="w-full bg-white/50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none transition-all shadow-sm"
        />
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium text-slate-700">Nominal</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 font-medium">
            Rp
          </div>
          <input
            v-model="amount"
            type="number"
            required
            placeholder="0"
            class="w-full pl-10 bg-white/50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium text-slate-700">Keterangan</label>
        <input
          v-model="note"
          type="text"
          required
          placeholder="Misal: Belanja Bulanan"
          class="w-full bg-white/50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none transition-all shadow-sm"
        />
      </div>

      <button :disabled="isSubmitting" class="w-full text-white bg-primary hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 font-medium rounded-xl text-sm px-5 py-3 text-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2">
        <span v-if="isSubmitting">Menyimpan...</span>
        <span v-else>Simpan Transaksi</span>
      </button>
    </form>
  </div>
</template>