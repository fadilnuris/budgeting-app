<script setup lang="ts">
import Navbar from '~/components/Navbar.vue';
import type { BudgetItem, BudgetCategory, BudgetPlan } from '~/types/budget'

const income = ref(0)
const items = ref<BudgetItem[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const currentMonth = ref(new Date().toISOString().slice(0, 7)) // YYYY-MM
const userIdCookie = useCookie('user_id')
const userId = parseInt(userIdCookie.value || '0', 10)

const categories = ref<BudgetCategory[]>([
  { name: 'Tabungan', color: 'blue' },
  { name: 'Kebutuhan', color: 'amber' },
  { name: 'Keinginan', color: 'pink' }
])

const formattedIncome = computed({
  get() {
    if (income.value === 0) return ''
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(income.value)
  },
  set(val: string) {
    const number = parseInt(val.replace(/[^0-9]/g, ''), 10)
    income.value = isNaN(number) ? 0 : number
  }
})

const isModalOpen = ref(false)
const isEditing = ref(false)
const isSavingItem = ref(false)
const modalItem = ref<BudgetItem>({
  name: '',
  nominal: 0,
  category: 'Kebutuhan'
})

const formattedNominal = computed({
  get() {
    if (!modalItem.value.nominal) return ''
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(modalItem.value.nominal)
  },
  set(val: string) {
    const number = parseInt(val.replace(/[^0-9]/g, ''), 10)
    modalItem.value.nominal = isNaN(number) ? 0 : number
  }
})

const isCategoryModalOpen = ref(false)
const categoryModalList = ref<BudgetCategory[]>([])
const availableColors = ['blue', 'amber', 'pink', 'purple', 'emerald', 'teal']

const totalAllocated = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.nominal || 0), 0)
})

const remainingMoney = computed(() => {
  return income.value - totalAllocated.value
})

const summaryByCategory = computed(() => {
  const summary = items.value.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.nominal || 0)
    return acc;
  }, {} as Record<string, number>);
  
  return categories.value.map(cat => ({
    name: cat.name,
    nominal: summary[cat.name] || 0,
    percentage: income.value > 0 ? ((summary[cat.name] || 0) / income.value) * 100 : 0,
    color: cat.color
  }))
})

const fetchBudget = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<{ data: BudgetPlan }>(`https://budgeting-api.up.railway.app/budget`, {
      params: { user_id: userId, month: currentMonth.value }
    })
    
    if (response.data) {
      income.value = response.data.income
      items.value = response.data.items || []
      categories.value = response.data.categories && response.data.categories.length > 0
        ? response.data.categories
        : [
            { name: 'Tabungan', color: 'blue' },
            { name: 'Kebutuhan', color: 'amber' },
            { name: 'Keinginan', color: 'pink' }
          ]
    } else {
      income.value = 0
      items.value = []
      categories.value = [
        { name: 'Tabungan', color: 'blue' },
        { name: 'Kebutuhan', color: 'amber' },
        { name: 'Keinginan', color: 'pink' }
      ]
    }
  } catch (e) {
    console.error('Failed to fetch budget:', e)
  } finally {
    isLoading.value = false
  }
}

const saveBudget = async () => {
  isSaving.value = true
  try {
    await $fetch('https://budgeting-api.up.railway.app/budget', {
      method: 'POST',
      body: {
        user_id: userId,
        month: currentMonth.value,
        income: income.value,
        items: items.value,
        categories: categories.value
      }
    })
    alert('Anggaran dan Kategori berhasil disimpan!')
    await fetchBudget()
  } catch (e) {
    console.error('Failed to save budget:', e)
    alert('Gagal menyimpan anggaran.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchBudget()
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val)
}

const getCategoryClass = (categoryName: string) => {
  const cat = categories.value.find(c => c.name === categoryName)
  const color = cat?.color || 'blue'
  switch (color) {
    case 'blue': return 'bg-blue-100 text-blue-700'
    case 'amber': return 'bg-amber-100 text-amber-700'
    case 'pink': return 'bg-pink-100 text-pink-700'
    case 'purple': return 'bg-purple-100 text-purple-700'
    case 'emerald': return 'bg-emerald-100 text-emerald-700'
    case 'teal': return 'bg-teal-100 text-teal-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const chartOptions = computed(() => ({
  labels: categories.value.map(c => c.name),
  colors: categories.value.map(c => {
    switch (c.color) {
      case 'blue': return '#93C5FD'
      case 'amber': return '#FCD34D'
      case 'pink': return '#F9A8D4'
      case 'purple': return '#C084FC'
      case 'emerald': return '#34D399'
      case 'teal': return '#2DD4BF'
      default: return '#CBD5E1'
    }
  }),
  legend: { position: 'bottom' },
  chart: { fontFamily: 'Inter, sans-serif' },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(1) + '%'
  },
  tooltip: {
    y: { formatter: (val: number) => formatCurrency(val) }
  }
}))

const chartSeries = computed(() => {
  return summaryByCategory.value.map(s => s.nominal)
})

const openAddModal = () => {
  isEditing.value = false
  const defaultCategory = categories.value[0]?.name || 'Kebutuhan'
  modalItem.value = { name: '', nominal: 0, category: defaultCategory }
  isModalOpen.value = true
}

const openEditModal = (item: BudgetItem) => {
  isEditing.value = true
  modalItem.value = { ...item }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveModalItem = async () => {
  if (!modalItem.value.name || modalItem.value.nominal <= 0) {
    alert('Mohon isi nama dan nominal dengan benar.')
    return
  }

  isSavingItem.value = true
  try {
    if (isEditing.value && modalItem.value.id) {
      await $fetch(`https://budgeting-api.up.railway.app/budget/items/${modalItem.value.id}`, {
        method: 'PUT',
        body: {
          name: modalItem.value.name,
          nominal: modalItem.value.nominal,
          category: modalItem.value.category
        }
      })
    } else {
      await $fetch('https://budgeting-api.up.railway.app/budget/items', {
        method: 'POST',
        body: {
          user_id: userId,
          month: currentMonth.value,
          name: modalItem.value.name,
          nominal: modalItem.value.nominal,
          category: modalItem.value.category
        }
      })
    }
    
    await fetchBudget()
    closeModal()
  } catch (e) {
    console.error('Failed to save item:', e)
    alert('Gagal menyimpan item.')
  } finally {
    isSavingItem.value = false
  }
}

const showDeleteModal = ref(false)
const itemToDelete = ref<number | null>(null)

const removeItem = (id?: number) => {
  if (!id) return
  itemToDelete.value = id
  showDeleteModal.value = true
}

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return
  
  try {
    await $fetch(`https://budgeting-api.up.railway.app/budget/items/${itemToDelete.value}`, {
      method: 'DELETE'
    })
    await fetchBudget()
  } catch (e) {
    console.error('Failed to delete item:', e)
    alert('Gagal menghapus item.')
  } finally {
    showDeleteModal.value = false
    itemToDelete.value = null
  }
}

const openCategoryModal = () => {
  categoryModalList.value = JSON.parse(JSON.stringify(categories.value))
  isCategoryModalOpen.value = true
}

const closeCategoryModal = () => {
  isCategoryModalOpen.value = false
}

const addCategoryInModal = () => {
  categoryModalList.value.push({
    name: 'Kategori Baru',
    color: 'blue'
  })
}

const removeCategoryInModal = (index: number) => {
  categoryModalList.value.splice(index, 1)
}

const saveCategories = async () => {
  const names = categoryModalList.value.map(c => c.name.trim())
  if (names.some(n => !n)) {
    alert('Nama kategori tidak boleh kosong.')
    return
  }

  categoryModalList.value.forEach((newCat, index) => {
    const oldCat = categories.value[index]
    if (oldCat && oldCat.name !== newCat.name) {
      items.value.forEach(item => {
        if (item.category === oldCat.name) {
          item.category = newCat.name
        }
      })
    }
  })

  categories.value = JSON.parse(JSON.stringify(categoryModalList.value))
  await saveBudget()
  closeCategoryModal()
}
</script>

<template>
  <div class="min-h-screen flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <Navbar />
    
    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-slate-500 font-medium">Memuat anggaran...</p>
    </div>

    <div v-else class="max-w-7xl mx-auto w-full flex-1 flex flex-col">
      <div class="flex flex-col md:flex-row justify-between items-start mb-10 gap-6 animate-fade-in-up">
        <div class="glass-card p-6 flex-1 w-full md:w-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold flex items-center gap-2">
              <Icon name="ph:calendar-bold" class="text-blue-500" />
              Budgeting Overview
            </h2>
            <button @click="saveBudget" :disabled="isSaving" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-100 disabled:opacity-50">
              <span v-if="isSaving">Menyimpan...</span>
              <span v-else class="flex items-center gap-2">
                <Icon name="ph:floppy-disk-bold" />
                Simpan
              </span>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-y-3 text-sm">
            <div class="text-slate-500">Bulan</div>
            <div class="text-right">
              <input 
                v-model="currentMonth" 
                type="month" 
                @change="fetchBudget"
                class="bg-transparent border-none text-right font-semibold text-slate-700 outline-none cursor-pointer"
              />
            </div>
            
            <div class="text-slate-500">Pemasukan</div>
            <div class="text-right">
              <input 
                v-model="formattedIncome" 
                type="text" 
                class="w-full text-right bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none font-semibold text-blue-600"
                placeholder="Rp0"
              />
            </div>
            
            <div class="text-slate-500">Uang Dialokasikan</div>
            <div class="font-semibold text-right">{{ formatCurrency(totalAllocated) }}</div>
            
            <div class="text-slate-500 pt-2 border-t border-slate-100">Sisa Uang</div>
            <div class="font-bold text-right pt-2 border-t border-slate-100" :class="remainingMoney < 0 ? 'text-red-500' : 'text-emerald-500'">
              {{ formatCurrency(remainingMoney) }}
            </div>
          </div>
        </div>

        <div class="glass-card p-6 flex-[1.5] w-full md:w-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold flex items-center gap-2">
              <Icon name="ph:chart-pie-slice-bold" class="text-amber-500" />
              Ringkasan Kategori
            </h2>
            <button @click="openCategoryModal" class="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-semibold">
              <Icon name="ph:gear-six-bold" />
              Kelola Kategori
            </button>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-slate-400 text-left border-b border-slate-100">
                <th class="pb-2 font-medium">Kategori</th>
                <th class="pb-2 font-medium text-right">Nominal</th>
                <th class="pb-2 font-medium text-right">Persentase</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.name" class="border-b border-slate-50/50 last:border-0">
                <td class="py-3">
                  <span :class="getCategoryClass(cat.name)" class="px-3 py-1 rounded-full text-xs font-semibold">
                    {{ cat.name }}
                  </span>
                </td>
                <td class="py-3 text-right font-medium">
                  {{ formatCurrency(summaryByCategory.find(s => s.name === cat.name)?.nominal || 0) }}
                </td>
                <td class="py-3 text-right text-slate-500">
                  {{ (summaryByCategory.find(s => s.name === cat.name)?.percentage || 0).toFixed(2) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="glass-card p-0 overflow-hidden mb-10 animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <Icon name="ph:list-checks-bold" class="text-pink-500" />
            Alokasi Pengeluaran
          </h2>
          <button @click="openAddModal" class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-200 text-sm font-semibold">
            <Icon name="ph:plus-bold" />
            Tambah Item
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50/80">
              <tr>
                <th class="px-6 py-4 text-left font-semibold text-slate-600">Nama Pengeluaran</th>
                <th class="px-6 py-4 text-right font-semibold text-slate-600 w-48">Nominal (Rp)</th>
                <th class="px-6 py-4 text-center font-semibold text-slate-600 w-48">Kategori</th>
                <th class="px-6 py-4 text-right font-semibold text-slate-600 w-32">Persentase</th>
                <th class="px-6 py-4 text-center font-semibold text-slate-600 w-28">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, index) in items" :key="index" class="hover:bg-blue-50/30 transition-colors group">
                <td class="px-6 py-4 font-medium text-slate-700">{{ item.name }}</td>
                <td class="px-6 py-4 text-right font-semibold text-slate-800">{{ formatCurrency(item.nominal) }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="getCategoryClass(item.category)" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {{ item.category }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-slate-500 font-medium">
                  {{ income > 0 ? ((item.nominal / income) * 100).toFixed(1) : 0 }}%
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-3">
                    <button @click="openEditModal(item)" class="text-blue-500 hover:scale-110 transition-transform">
                      <Icon name="ph:pencil-simple-bold" />
                    </button>
                    <button @click="removeItem(item.id)" class="text-red-500 hover:scale-110 transition-transform">
                      <Icon name="ph:trash-bold" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="5" class="px-6 py-10 text-center text-slate-400 italic">
                  Belum ada item anggaran. Klik "Tambah Item" untuk memulai.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="glass-card p-8">
          <h2 class="text-xl font-bold mb-8 text-center text-slate-700">Visualisasi Alokasi</h2>
          <ClientOnly>
            <div class="flex justify-center">
              <apexchart 
                v-if="items.length > 0"
                type="pie" 
                width="450" 
                :options="chartOptions" 
                :series="chartSeries"
              ></apexchart>
              <div v-else class="h-[300px] flex items-center justify-center text-slate-300 italic">
                Tambah data untuk melihat grafik
              </div>
            </div>
            <template #fallback>
              <div class="h-[300px] flex items-center justify-center text-slate-400">
                Loading Chart...
              </div>
            </template>
          </ClientOnly>
        </div>

        <div class="space-y-6">
          <div class="glass-card p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-xl shadow-blue-200">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Icon name="ph:piggy-bank-bold" size="32" />
              </div>
              <div>
                <p class="text-blue-100 text-sm font-medium">Saran Tabungan</p>
                <h3 class="text-2xl font-bold">Lanjutkan Menabung!</h3>
              </div>
            </div>
            <p class="mt-4 text-blue-50/80 text-sm leading-relaxed">
              Alokasi tabungan Anda saat ini mencapai <strong>{{ summaryByCategory.find(s => s.name === 'Tabungan')?.percentage.toFixed(1) || '0.0' }}%</strong>. 
              Ini adalah langkah yang sangat baik untuk masa depan finansial Anda.
            </p>
          </div>

          <div class="glass-card p-6 border-slate-100">
            <h3 class="font-bold text-slate-700 mb-4">Tips Budgeting</h3>
            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-sm text-slate-600">
                <Icon name="ph:check-circle-fill" class="text-emerald-500 mt-0.5 shrink-0" />
                Gunakan aturan 50/30/20 untuk keseimbangan yang ideal.
              </li>
              <li class="flex items-start gap-3 text-sm text-slate-600">
                <Icon name="ph:check-circle-fill" class="text-emerald-500 mt-0.5 shrink-0" />
                Prioritaskan Dana Darurat sebelum keinginan lain.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
        
        <div class="relative w-full max-w-md glass-card p-8 shadow-2xl animate-scale-up">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-slate-800">
              {{ isEditing ? 'Edit Item Anggaran' : 'Tambah Item Baru' }}
            </h3>
            <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Icon name="ph:x-bold" />
            </button>
          </div>

          <form @submit.prevent="saveModalItem" class="space-y-5">
            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-slate-700">Nama Pengeluaran</label>
              <input 
                v-model="modalItem.name"
                type="text"
                placeholder="Misal: Belanja Bulanan"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-slate-700">Nominal (Rp)</label>
              <input 
                v-model="formattedNominal"
                type="text"
                placeholder="Rp0"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold text-slate-800"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-slate-700">Kategori</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button 
                  v-for="cat in categories" 
                  :key="cat.name"
                  type="button"
                  @click="modalItem.category = cat.name"
                  :class="[
                    modalItem.category === cat.name 
                      ? getCategoryClass(cat.name) + ' ring-2 ring-offset-1 ring-slate-200' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  ]"
                  class="py-2 px-1 rounded-xl text-[10px] font-bold transition-all uppercase tracking-tight truncate"
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                type="button"
                @click="closeModal"
                class="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm"
              >
                Batal
              </button>
              <button 
                type="submit"
                :disabled="isSavingItem"
                class="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 text-sm disabled:opacity-50"
              >
                <span v-if="isSavingItem">Menyimpan...</span>
                <span v-else>{{ isEditing ? 'Simpan Perubahan' : 'Tambah Item' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="isCategoryModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeCategoryModal"></div>
        
        <div class="relative w-full max-w-lg glass-card p-8 shadow-2xl animate-scale-up">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-slate-800">
              Kelola Kategori Anggaran
            </h3>
            <button @click="closeCategoryModal" class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Icon name="ph:x-bold" />
            </button>
          </div>

          <div class="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            <div 
              v-for="(cat, index) in categoryModalList" 
              :key="index" 
              class="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100"
            >
              <input 
                v-model="cat.name"
                type="text"
                placeholder="Nama Kategori"
                class="flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold text-slate-700"
              />

              <div class="flex gap-1.5 items-center">
                <button 
                  v-for="color in availableColors"
                  :key="color"
                  type="button"
                  @click="cat.color = color"
                  :class="[
                    cat.color === color ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-60 hover:opacity-100',
                    color === 'blue' ? 'bg-blue-400' : '',
                    color === 'amber' ? 'bg-amber-400' : '',
                    color === 'pink' ? 'bg-pink-400' : '',
                    color === 'purple' ? 'bg-purple-400' : '',
                    color === 'emerald' ? 'bg-emerald-400' : '',
                    color === 'teal' ? 'bg-teal-400' : '',
                  ]"
                  class="w-5 h-5 rounded-full transition-all shrink-0"
                ></button>
              </div>

              <button 
                type="button" 
                @click="removeCategoryInModal(index)"
                class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all self-end sm:self-auto shrink-0"
              >
                <Icon name="ph:trash-bold" />
              </button>
            </div>

            <div v-if="categoryModalList.length === 0" class="text-center text-slate-400 italic py-6">
              Belum ada kategori. Silakan tambah kategori baru.
            </div>
          </div>

          <button 
            type="button"
            @click="addCategoryInModal"
            class="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-500 hover:text-blue-600 rounded-2xl transition-all text-sm font-bold"
          >
            <Icon name="ph:plus-bold" />
            Tambah Kategori Baru
          </button>

          <div class="flex gap-3 pt-6 border-t border-slate-100 mt-6">
            <button 
              type="button"
              @click="closeCategoryModal"
              class="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm"
            >
              Batal
            </button>
            <button 
              type="button"
              @click="saveCategories"
              class="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 text-sm"
            >
              Simpan & Terapkan
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
            <h3 class="text-2xl font-bold text-slate-800 mb-2">Hapus Item Anggaran?</h3>
            <p class="text-slate-500 mb-8 leading-relaxed">Apakah Anda yakin ingin menghapus item alokasi anggaran ini? Tindakan ini tidak dapat dibatalkan.</p>
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

<style scoped>
.glass-card {
  @apply bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-sm;
}

.overflow-x-auto::-webkit-scrollbar { display: none; }
.overflow-x-auto { -ms-overflow-style: none; scrollbar-width: none; }

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
