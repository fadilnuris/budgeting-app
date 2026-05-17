<template>
  <div class="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
    <div class="p-6 border-b border-slate-100 bg-white/40 flex justify-between items-center">
      <h2 class="text-xl font-bold text-slate-800">Transaksi Terakhir</h2>
      <span class="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{{ data?.data?.length || 0 }} transaksi</span>
    </div>

    <div class="p-6 flex-1 overflow-auto">
      <div v-if="pending" class="flex flex-col items-center justify-center py-10 space-y-4">
        <div class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p class="text-slate-500 font-medium animate-pulse">Memuat data...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center space-x-3">
        <Icon name="lucide:alert-circle" class="w-5 h-5 flex-shrink-0" />
        <span class="font-medium">Gagal memuat transaksi.</span>
      </div>

      <div v-else-if="!data?.data || data.data.length === 0" class="text-center py-12">
        <div class="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:clipboard-list" class="w-8 h-8 text-slate-400" />
        </div>
        <p class="text-slate-500 font-medium">Belum ada transaksi.</p>
        <p class="text-slate-400 text-sm mt-1">Mulai dengan menambahkan transaksi pertama Anda.</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in data.data"
          :key="item.ID"
          class="group flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white/60 hover:bg-white hover:shadow-sm transition-all duration-300"
        >
          <div class="flex items-center space-x-4">
            <div :class="[
              'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
              item.Type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            ]">
              <Icon v-if="item.Type === 'income'" name="lucide:trending-up" class="w-6 h-6" />
              <Icon v-else name="lucide:trending-down" class="w-6 h-6" />
            </div>
            <div>
              <p class="font-semibold text-slate-800">{{ item.Note || 'Tanpa kategori' }}</p>
              <div class="flex items-center space-x-2 mt-0.5">
                <p class="text-xs font-medium text-slate-500 capitalize">{{ item.Type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}</p>
                <span class="text-[10px] text-slate-300">•</span>
                <p class="text-xs text-slate-400">{{ formatDate(item.CreatedAt) }}</p>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end space-y-2">
            <p :class="[
              'font-bold text-lg',
              item.Type === 'income' ? 'text-emerald-600' : 'text-slate-800'
            ]">
              <span v-if="item.Type === 'income'">+</span><span v-else>-</span>Rp {{ item.Amount.toLocaleString() }}
            </p>
            <button 
              @click="deleteTransaction(item.ID)"
              class="p-2 text-rose-500 bg-rose-50 rounded-lg"
              title="Hapus transaksi"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showDeleteModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[2px]">
          <div class="glass-card bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
            <div class="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500">
              <Icon name="lucide:trash-2" class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold text-slate-800 mb-2">Hapus Transaksi?</h3>
            <p class="text-slate-500 mb-8 leading-relaxed">Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div class="flex space-x-3">
              <button 
                @click="showDeleteModal = false" 
                class="flex-1 px-4 py-3 rounded-xl bg-slate-50 text-slate-600 font-semibold transition-all duration-200"
              >
                Batal
              </button>
              <button 
                @click="handleConfirmDelete" 
                class="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all duration-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { refreshNuxtData } from '#app'

const userIdCookie = useCookie('user_id')
const userId = userIdCookie.value || '0'

const { data, pending, error } = await useFetch('https://budgeting-api.up.railway.app/transactions', {
  key: 'transactions-list',
  params: { user_id: userId }
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const showDeleteModal = ref(false)
const transactionToDelete = ref(null)

const deleteTransaction = (id) => {
  transactionToDelete.value = id
  showDeleteModal.value = true
}

const handleConfirmDelete = async () => {
  if (!transactionToDelete.value) return

  try {
    await $fetch(`https://budgeting-api.up.railway.app/transactions/${transactionToDelete.value}`, {
      method: 'DELETE'
    })
    
    // Refresh the list
    refreshNuxtData('transactions-list')
  } catch (err) {
    console.error('Failed to delete transaction:', err)
  } finally {
    showDeleteModal.value = false
    transactionToDelete.value = null
  }
}
</script>