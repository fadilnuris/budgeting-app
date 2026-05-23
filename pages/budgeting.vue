<script setup lang="ts">
import Navbar from '~/components/Navbar.vue';
import type { BudgetItem, BudgetCategory, BudgetPlan } from '~/types/budget'

type TransactionItem = {
  ID?: number
  Type: 'income' | 'expense'
  Amount: number
  Note?: string
  Date?: string
  date?: string
  CreatedAt?: string
}

const income = ref(0)
const items = ref<BudgetItem[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const isIncomeSaved = ref(false)
const isDirty = ref(false)
const savedIncomeAmount = ref(0)
const actualMonthlyIncome = ref(0)
const isLoadingTransactionIncome = ref(false)
const currentMonth = ref(new Date().toISOString().slice(0, 7)) // YYYY-MM
const userIdCookie = useCookie('user_id')
const userId = parseInt(userIdCookie.value || '0', 10)

const defaultCategories: BudgetCategory[] = [
  { name: 'Tabungan', color: 'blue' },
  { name: 'Kebutuhan', color: 'amber' },
  { name: 'Keinginan', color: 'pink' },
  { name: 'Pemborosan', color: 'purple' }
]

const ensureDefaultCategories = (incoming?: BudgetCategory[]) => {
  const source = incoming && incoming.length > 0 ? incoming : []
  const merged = [...source]

  defaultCategories.forEach(defaultCat => {
    if (!merged.some(cat => cat.name === defaultCat.name)) {
      merged.push({ ...defaultCat })
    }
  })

  return merged
}

const categories = ref<BudgetCategory[]>(ensureDefaultCategories())

const markIncomeChanged = () => {
  isDirty.value = true
  isIncomeSaved.value = false
}

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
    const nextIncome = isNaN(number) ? 0 : number
    if (nextIncome !== income.value) {
      income.value = nextIncome
      markIncomeChanged()
    }
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
  if (!canManageBudget.value) return 0
  return items.value.reduce((sum, item) => sum + (item.nominal || 0), 0)
})

const remainingMoney = computed(() => {
  return income.value - totalAllocated.value
})

const summaryByCategory = computed(() => {
  if (!canManageBudget.value) {
    return categories.value.map(cat => ({
      name: cat.name,
      nominal: 0,
      percentage: 0,
      color: cat.color
    }))
  }

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

const chartSummary = computed(() => {
  const base = summaryByCategory.value.filter(summary => summary.nominal > 0)

  if (income.value > totalAllocated.value) {
    return [
      ...base,
      {
        name: 'Belum Dialokasikan',
        nominal: income.value - totalAllocated.value,
        percentage: income.value > 0 ? ((income.value - totalAllocated.value) / income.value) * 100 : 0,
        color: 'slate'
      }
    ]
  }

  return base
})

const canManageBudget = computed(() => isIncomeSaved.value && income.value > 0)

const incomeStatusLabel = computed(() => {
  if (isSaving.value) return 'Menyimpan pemasukan...'
  if (isIncomeSaved.value) return 'Pemasukan tersimpan'
  if (savedIncomeAmount.value > 0 && income.value !== savedIncomeAmount.value) {
    return 'Pemasukan berubah, simpan ulang untuk melanjutkan'
  }
  return 'Simpan pemasukan terlebih dahulu'
})

const budgetStatusLabel = computed(() => {
  if (!canManageBudget.value) {
    return 'Simpan pemasukan terlebih dahulu untuk mulai membuat alokasi anggaran.'
  }
  return ''
})

const getTransactionMonth = (transaction: TransactionItem) => {
  const rawDate = transaction.Date || transaction.date || transaction.CreatedAt || ''
  if (!rawDate) return ''
  if (/^\d{4}-\d{2}/.test(rawDate)) return rawDate.slice(0, 7)

  const parsedDate = new Date(rawDate)
  if (Number.isNaN(parsedDate.getTime())) return ''
  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
}

const fetchMonthlyTransactionIncome = async () => {
  isLoadingTransactionIncome.value = true
  try {
    const response = await $fetch<{ data: TransactionItem[] }>('https://budgeting-api.up.railway.app/transactions', {
      params: { user_id: userId }
    })

    actualMonthlyIncome.value = (response.data || []).reduce((sum, transaction) => {
      const isCurrentMonth = getTransactionMonth(transaction) === currentMonth.value
      return transaction.Type === 'income' && isCurrentMonth ? sum + (transaction.Amount || 0) : sum
    }, 0)
  } catch (e) {
    console.error('Failed to fetch monthly transaction income:', e)
    actualMonthlyIncome.value = 0
  } finally {
    isLoadingTransactionIncome.value = false
  }
}

const useTransactionIncome = () => {
  if (actualMonthlyIncome.value <= 0) return

  if (income.value !== actualMonthlyIncome.value) {
    income.value = actualMonthlyIncome.value
    markIncomeChanged()
  }
}

const fetchBudget = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<{ data: BudgetPlan }>(`https://budgeting-api.up.railway.app/budget`, {
      params: { user_id: userId, month: currentMonth.value }
    })
    
    if (response.data) {
      income.value = response.data.income
      items.value = response.data.items || []
      categories.value = ensureDefaultCategories(response.data.categories)
      savedIncomeAmount.value = response.data.income || 0
      isIncomeSaved.value = (response.data.income || 0) > 0
      isDirty.value = false
    } else {
      income.value = 0
      items.value = []
      categories.value = ensureDefaultCategories()
      savedIncomeAmount.value = 0
      isIncomeSaved.value = false
      isDirty.value = false
    }
  } catch (e) {
    console.error('Failed to fetch budget:', e)
  } finally {
    isLoading.value = false
  }
}

const saveBudget = async (successMessage = 'Pemasukan berhasil disimpan!') => {
  if (income.value <= 0) {
    alert('Pemasukan wajib diisi dan harus lebih dari 0.')
    return
  }

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
    savedIncomeAmount.value = income.value
    isIncomeSaved.value = true
    isDirty.value = false
    alert(successMessage)
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
  fetchMonthlyTransactionIncome()
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
    case 'slate': return 'bg-slate-100 text-slate-500'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getCategoryHex = (color: string) => {
  switch (color) {
    case 'blue': return '#93C5FD'
    case 'amber': return '#FCD34D'
    case 'pink': return '#F9A8D4'
    case 'purple': return '#C084FC'
    case 'emerald': return '#34D399'
    case 'teal': return '#2DD4BF'
    case 'slate': return '#CBD5E1'
    default: return '#CBD5E1'
  }
}

const chartOptions = computed(() => ({
  labels: chartSummary.value.map(c => c.name),
  colors: chartSummary.value.map(c => getCategoryHex(c.color)),
  legend: { position: 'bottom' },
  chart: { fontFamily: 'Inter, sans-serif' },
  dataLabels: {
    enabled: true,
    formatter: (_val: number, opts: any) => {
      const nominal = opts.w.config.series[opts.seriesIndex] || 0
      return income.value > 0 ? `${((nominal / income.value) * 100).toFixed(1)}%` : '0.0%'
    }
  },
  tooltip: {
    y: { formatter: (val: number) => formatCurrency(val) }
  }
}))

const chartSeries = computed(() => {
  return chartSummary.value.map(s => s.nominal)
})

const openAddModal = () => {
  if (!canManageBudget.value) {
    alert('Simpan pemasukan terlebih dahulu sebelum menambahkan alokasi.')
    return
  }

  isEditing.value = false
  const defaultCategory = categories.value[0]?.name || 'Kebutuhan'
  modalItem.value = { name: '', nominal: 0, category: defaultCategory }
  isModalOpen.value = true
}

const openEditModal = (item: BudgetItem) => {
  if (!canManageBudget.value) {
    alert('Simpan pemasukan terlebih dahulu sebelum menambahkan alokasi.')
    return
  }

  isEditing.value = true
  modalItem.value = { ...item }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveModalItem = async () => {
  if (!canManageBudget.value) {
    alert('Simpan pemasukan terlebih dahulu sebelum menambahkan alokasi.')
    return
  }

  if (!modalItem.value.name || modalItem.value.nominal <= 0) {
    alert('Mohon isi nama dan nominal dengan benar.')
    return
  }

  const currentItemNominal = isEditing.value ? items.value.find(item => item.id === modalItem.value.id)?.nominal || 0 : 0
  const nextTotalAllocated = totalAllocated.value - currentItemNominal + modalItem.value.nominal
  if (nextTotalAllocated > income.value) {
    alert('Total alokasi tidak boleh melebihi total pemasukan.')
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
  if (!canManageBudget.value) {
    alert('Simpan pemasukan terlebih dahulu sebelum menambahkan alokasi.')
    return
  }

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
  if (!canManageBudget.value) {
    alert('Simpan pemasukan terlebih dahulu sebelum menambahkan alokasi.')
    return
  }

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
  await saveBudget('Kategori berhasil disimpan!')
  closeCategoryModal()
}

const formatMonthLabel = (monthStr: string) => {
  if (!monthStr) return ''
  const [yearStr, monthStr2] = monthStr.split('-')
  if (!yearStr || !monthStr2) return monthStr
  const date = new Date(parseInt(yearStr, 10), parseInt(monthStr2, 10) - 1)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

const handleMonthChange = async () => {
  await Promise.all([
    fetchBudget(),
    fetchMonthlyTransactionIncome()
  ])
}

const allocationPercentage = computed(() => {
  if (income.value <= 0) return 0
  return (totalAllocated.value / income.value) * 100
})

const isAllocationAlmostFull = computed(() => allocationPercentage.value >= 80 && allocationPercentage.value <= 100)

const dynamicOverviewTips = computed(() => {
  if (income.value <= 0) {
    return 'Silakan masukkan dan simpan pemasukan bulanan Anda terlebih dahulu untuk mengaktifkan analisis anggaran.'
  }

  const sisa = remainingMoney.value
  const sisaPersen = (sisa / income.value) * 100
  const totalAllocPct = allocationPercentage.value

  // Helper untuk mencari persentase kategori
  const getCatPct = (name: string) => summaryByCategory.value.find(s => s.name === name)?.percentage || 0

  const tabunganPct = getCatPct('Tabungan')
  const keinginanPct = getCatPct('Keinginan')
  const pemborosanPct = getCatPct('Pemborosan')

  // Kondisi 1: Defisit
  if (sisa < 0) {
    let advice = `<strong>Peringatan Defisit:</strong> Alokasi pengeluaran Anda melebihi pemasukan sebesar <strong>${formatCurrency(Math.abs(sisa))}</strong>.`
    if (pemborosanPct > 0) {
      advice += ` Coba kurangi atau hapus alokasi di kategori <strong>Pemborosan</strong> (saat ini ${pemborosanPct.toFixed(1)}%) untuk menyeimbangkan anggaran.`
    } else if (keinginanPct > 30) {
      advice += ` Pertimbangkan untuk membatasi pengeluaran di kategori <strong>Keinginan</strong> yang saat ini mencapai ${keinginanPct.toFixed(1)}% (ideal: max 30%).`
    } else {
      advice += ` Harap kurangkan nominal alokasi beberapa item belanja Anda.`
    }
    return advice
  }

  // Kondisi 2: Anggaran Pas (Zero-Based)
  if (sisa === 0) {
    if (tabunganPct < 20) {
      return `<strong>Anggaran Pas:</strong> Luar biasa! Seluruh pemasukan teralokasi habis (Zero-Based). Namun, alokasi <strong>Tabungan</strong> Anda baru ${tabunganPct.toFixed(1)}% (ideal: min 20%). Coba tingkatkan porsi tabungan di bulan berikutnya.`
    }
    return `<strong>Anggaran Pas:</strong> Sempurna! Seluruh pemasukan Anda telah teralokasi habis tanpa sisa. Setiap rupiah kini memiliki tugasnya masing-masing!`
  }

  // Kondisi 3: Alokasi Hampir Penuh (>= 80% s.d. 99%)
  if (totalAllocPct >= 80) {
    if (tabunganPct < 20) {
      return `<strong>Alokasi Padat:</strong> Anda menyisakan <strong>${formatCurrency(sisa)}</strong> (${sisaPersen.toFixed(1)}%). Karena alokasi <strong>Tabungan</strong> baru ${tabunganPct.toFixed(1)}%, sebaiknya sisa ini dipindahkan ke tabungan untuk memperkuat keamanan finansial.`
    }
    return `<strong>Alokasi Padat:</strong> Anda menyisakan <strong>${formatCurrency(sisa)}</strong> (${sisaPersen.toFixed(1)}%). Pastikan sisa dana ini dialokasikan untuk kebutuhan tak terduga (dana darurat).`
  }

  // Kondisi 4: Surplus Sehat & Aman (< 80%)
  if (tabunganPct < 20) {
    return `<strong>Tips Flowfund:</strong> Anggaran aman! Anda memiliki sisa <strong>${formatCurrency(sisa)}</strong> (${sisaPersen.toFixed(1)}%). Karena alokasi <strong>Tabungan</strong> Anda baru ${tabunganPct.toFixed(1)}%, sangat disarankan memindahkan sisa ini ke kategori <strong>Tabungan</strong> agar mencapai target minimal 20% (ideal).`
  }

  if (pemborosanPct > 5) {
    return `<strong>Tips Flowfund:</strong> Anggaran aman dengan sisa <strong>${formatCurrency(sisa)}</strong> (${sisaPersen.toFixed(1)}%). Namun, alokasi <strong>Pemborosan</strong> Anda cukup tinggi (${pemborosanPct.toFixed(1)}%). Batasi pemborosan agar sisa uang Anda bisa dialihkan ke investasi produktif.`
  }

  return `<strong>Tips Flowfund:</strong> Kerja bagus! Alokasi <strong>Tabungan</strong> Anda sudah sangat aman (${tabunganPct.toFixed(1)}%). Sisa uang sebesar <strong>${formatCurrency(sisa)}</strong> (${sisaPersen.toFixed(1)}%) ini bebas Anda investasikan atau gunakan untuk tujuan finansial jangka panjang!`
})

useHead({
  title: 'Budgeting'
})
</script>

<template>
  <div class="min-h-screen flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <Navbar />
    
    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-slate-500 font-medium">Memuat anggaran...</p>
    </div>

    <div v-else class="max-w-7xl mx-auto w-full flex-1 flex flex-col">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 animate-fade-in-up relative z-30">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Perencanaan Anggaran</h1>
           <p class="text-sm font-medium text-slate-400 mt-1">
            Alokasikan pemasukan bulanan Anda ke berbagai kebutuhan, keinginan, dan tabungan secara cerdas.
          </p>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-between md:justify-end">
          <MonthPicker 
            v-model="currentMonth" 
            @change="handleMonthChange" 
          />

          <button 
            v-if="!isIncomeSaved || isDirty"
            @click="() => saveBudget()" 
            :disabled="isSaving || income <= 0" 
            class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            <Icon v-if="isSaving" name="ph:circle-notch-bold" class="animate-spin w-4 h-4" />
            <Icon v-else name="ph:floppy-disk-bold" class="w-4 h-4" />
            <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Pemasukan' }}</span>
          </button>
          <div v-else class="px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold flex items-center gap-2">
            <Icon name="ph:check-circle-bold" class="w-4 h-4" />
            <span>Semua perubahan tersimpan</span>
          </div>
        </div>
      </div>

      <div class="mb-6 animate-fade-in-up rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <div class="mt-0.5 w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <Icon name="ph:arrows-left-right-bold" class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold uppercase tracking-wider text-emerald-700">Referensi dari transaksi bulan ini</p>
            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <p class="text-lg font-extrabold text-emerald-700">
                <span v-if="isLoadingTransactionIncome">Memuat...</span>
                <span v-else>{{ formatCurrency(actualMonthlyIncome) }}</span>
              </p>
              <span class="text-xs font-medium text-emerald-700/70">
                Bisa dipakai sebagai Pemasukan Rencana {{ formatMonthLabel(currentMonth) }}.
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="useTransactionIncome"
          :disabled="isLoadingTransactionIncome || actualMonthlyIncome <= 0"
          class="w-full sm:w-auto shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          Gunakan dari Transaksi
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10 items-stretch animate-fade-in-up">
        <div class="glass-card p-6 lg:col-span-3 flex flex-col justify-between w-full">
          <div>
            <div class="flex items-center justify-between gap-3 mb-6">
              <h2 class="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Icon name="ph:squares-four-bold" class="text-primary" />
                Budgeting Overview
                <div class="relative group/tooltip inline-block">
                  <Icon name="ph:info-bold" class="text-slate-300 hover:text-slate-500 w-4 h-4 transition-colors mt-0.5 cursor-pointer" />
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900/95 text-white text-[10px] rounded-lg shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-30 text-center font-medium leading-relaxed normal-case tracking-normal">
                    Rangkuman perencanaan anggaran bulanan Anda, memuat ringkasan pemasukan, alokasi, sisa uang, serta status kelayakan dana secara waktu nyata.
                    <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95"></div>
                  </div>
                </div>
              </h2>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="glass-card bg-white p-4 rounded-2xl border border-blue-100/90 flex flex-col justify-between shadow-md shadow-blue-100/40 relative group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/60 hover:scale-[1.01] sm:col-span-3 lg:col-span-1">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Icon name="ph:wallet-bold" class="text-blue-500 w-3.5 h-3.5" />
                      <span>Pemasukan</span>
                    </div>
                    <span 
                      :class="isIncomeSaved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'"
                      class="px-2 py-0.5 rounded-full border text-[9px] font-bold"
                    >
                      {{ isIncomeSaved ? 'Tersimpan' : 'Perlu disimpan' }}
                    </span>
                  </div>
                  
                  <div class="relative mt-2">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                    <input 
                      v-model="formattedIncome" 
                      type="text" 
                      class="w-full pl-8 pr-7 py-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl outline-none font-bold text-slate-800 text-sm transition-all"
                      placeholder="0"
                    />
                    <div class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors">
                      <Icon name="ph:pencil-simple-line-bold" class="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>
                
                <p 
                  :class="isIncomeSaved ? 'text-emerald-600' : 'text-slate-400'"
                  class="mt-3 text-[10px] flex items-center gap-1 font-medium"
                >
                  <Icon :name="isIncomeSaved ? 'ph:check-circle-bold' : 'ph:info-bold'" />
                  {{ incomeStatusLabel }}
                </p>
              </div>

              <div class="glass-card bg-white p-4 rounded-2xl border border-slate-100/80 flex flex-col justify-between shadow-sm relative group overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                <div>
                  <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Icon name="ph:hand-coins-bold" class="text-amber-500 w-3.5 h-3.5" />
                    <span>Uang Dialokasikan</span>
                  </div>
                  
                  <div class="mt-3.5 text-base font-extrabold text-slate-800 tracking-tight">
                    {{ formatCurrency(totalAllocated) }}
                  </div>
                </div>
                
                <p class="mt-3 text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <Icon name="ph:list-checks-bold" class="text-amber-500" />
                  Dari {{ items.length }} alokasi item
                </p>
              </div>

              <div class="glass-card bg-white p-4 rounded-2xl border border-slate-100/80 flex flex-col justify-between shadow-sm relative group overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                <div>
                  <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Icon 
                      :name="remainingMoney < 0 ? 'ph:warning-circle-bold' : 'ph:check-circle-bold'" 
                      :class="remainingMoney < 0 ? 'text-rose-500' : 'text-emerald-500'" 
                      class="w-3.5 h-3.5" 
                    />
                    <span>Sisa Pemasukan</span>
                  </div>
                  
                  <div 
                    :class="[
                      remainingMoney < 0 ? 'text-rose-600' : 'text-emerald-600'
                    ]"
                    class="mt-3.5 text-base font-extrabold tracking-tight"
                  >
                    {{ formatCurrency(remainingMoney) }}
                  </div>
                </div>
                
                <p class="mt-3 text-[10px] flex items-center gap-1 font-semibold truncate" :class="remainingMoney < 0 ? 'text-rose-500' : 'text-emerald-600'">
                  <Icon :name="remainingMoney < 0 ? 'ph:x-circle-bold' : 'ph:sparkles-bold'" />
                  <span v-if="remainingMoney > 0">Ada sisa, siap tabung! 🚀</span>
                  <span v-else-if="remainingMoney === 0">Anggaran pas 🎯</span>
                  <span v-else>Defisit! Kurangi alokasi ⚠️</span>
                </p>
              </div>
            </div>

            <div class="mt-6 pt-5 border-t border-slate-100/80">
              <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                <div class="flex items-center gap-1.5">
                  <Icon name="ph:chart-bar-horizontal-bold" class="text-primary w-4 h-4" />
                  <span>Persentase Alokasi Uang</span>
                </div>
                <span 
                  :class="[
                    allocationPercentage > 100 ? 'text-rose-500' : 
                    allocationPercentage >= 80 ? 'text-amber-500' : 
                    'text-primary'
                  ]"
                >
                  {{ allocationPercentage.toFixed(1) }}%
                </span>
              </div>
              
              <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                <div 
                  :style="{ width: `${Math.min(allocationPercentage, 100)}%` }"
                  :class="[
                    allocationPercentage > 100 ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 
                    allocationPercentage >= 80 ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 
                    'bg-gradient-to-r from-primary to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  ]"
                  class="h-full rounded-full transition-all duration-500 ease-out"
                ></div>
              </div>

              <div class="flex items-start gap-2 mt-3.5 text-[11px] leading-relaxed text-slate-400">
                <Icon name="ph:lightbulb-bold" class="text-amber-500 shrink-0 mt-0.5" />
                <span v-html="dynamicOverviewTips"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card p-6 lg:col-span-2 flex flex-col justify-between w-full">
          <div>
            <div class="flex items-center justify-between gap-3 mb-6">
              <h2 class="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Icon name="ph:chart-pie-slice-bold" class="text-amber-500" />
                Ringkasan Kategori
                <div class="relative group/tooltip inline-block">
                  <Icon name="ph:info-bold" class="text-slate-300 hover:text-slate-500 cursor-pointer w-4 h-4 transition-colors mt-0.5" />
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900/95 text-white text-[10px] rounded-lg shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-30 text-center font-medium leading-relaxed normal-case tracking-normal">
                    Rangkuman total alokasi nominal uang dan persentasenya berdasarkan kategori pengeluaran yang Anda kelompokkan.
                    <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95"></div>
                  </div>
                </div>
              </h2>
              <button 
                @click="openCategoryModal" 
                :disabled="!canManageBudget"
                class="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-semibold active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Icon name="ph:gear-six-bold" />
                Kelola Kategori
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-slate-400 text-left border-b border-slate-100">
                    <th class="pb-3 font-semibold text-xs tracking-wider">Kategori</th>
                    <th class="pb-3 font-semibold text-xs tracking-wider text-right">Nominal</th>
                    <th class="pb-3 font-semibold text-xs tracking-wider text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50/50">
                  <tr 
                    v-for="cat in categories" 
                    :key="cat.name" 
                    :class="(summaryByCategory.find(s => s.name === cat.name)?.nominal || 0) === 0 ? 'opacity-55' : ''"
                    class="border-b border-slate-50/50 last:border-0"
                  >
                    <td class="py-3">
                      <span :class="getCategoryClass(cat.name)" class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {{ cat.name }}
                      </span>
                    </td>
                    <td class="py-3 text-right font-semibold text-slate-700">
                      {{ formatCurrency(summaryByCategory.find(s => s.name === cat.name)?.nominal || 0) }}
                    </td>
                    <td class="py-3 text-right text-slate-500 font-medium">
                      {{ (summaryByCategory.find(s => s.name === cat.name)?.percentage || 0).toFixed(1) }}%
                    </td>
                  </tr>
                  <tr v-if="categories.length === 0">
                    <td colspan="3" class="py-6 text-center text-slate-400 italic text-xs">
                      Belum ada kategori yang dikonfigurasi.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-0 mb-10 animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <Icon name="ph:list-checks-bold" class="text-pink-500" />
            Daftar Alokasi Anggaran
            <div class="relative group/tooltip inline-block">
              <Icon name="ph:info-bold" class="text-slate-300 hover:text-slate-500 cursor-pointer w-4 h-4 transition-colors mt-0.5" />
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900/95 text-white text-[10px] rounded-lg shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-30 text-center font-medium leading-relaxed normal-case tracking-normal">
                Daftar rincian seluruh item alokasi pengeluaran Anda. Anda dapat menambah, mengubah, atau menghapus rencana alokasi di sini.
                <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95"></div>
              </div>
            </div>
          </h2>
          <button 
            @click="openAddModal" 
            :disabled="!canManageBudget"
            class="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-200 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
          <Icon name="ph:plus-bold" />
          Tambah Item
          </button>
        </div>
        <div v-if="!canManageBudget" class="px-6 py-4 bg-blue-50/60 border-b border-blue-100 text-blue-700 text-sm font-semibold flex items-start gap-2">
          <Icon name="ph:lock-key-bold" class="mt-0.5 shrink-0" />
          <span>Simpan pemasukan terlebih dahulu untuk mulai membuat alokasi anggaran.</span>
        </div>
        
        <div class="hidden md:block overflow-x-auto rounded-b-2xl sm:rounded-b-[2rem]">
          <table class="w-full text-sm">
            <thead class="bg-slate-50/80">
              <tr>
                <th class="px-6 py-4 text-left font-semibold text-slate-600">Nama Alokasi</th>
                <th class="px-6 py-4 text-right font-semibold text-slate-600 w-48">Nominal (Rp)</th>
                <th class="px-6 py-4 text-center font-semibold text-slate-600 w-48">Kategori</th>
                <th class="px-6 py-4 text-right font-semibold text-slate-600 w-32">Persentase</th>
                <th class="px-6 py-4 text-center font-semibold text-slate-600 w-28">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, index) in canManageBudget ? items : []" :key="index" class="hover:bg-blue-50/30 transition-colors group">
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
              <tr v-if="!canManageBudget || items.length === 0">
                <td colspan="5" class="px-6 py-10 text-center text-slate-400 italic">
                  {{ canManageBudget ? 'Belum ada item anggaran. Klik "Tambah Item" untuk memulai.' : 'Daftar alokasi terkunci sampai pemasukan disimpan.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="block md:hidden divide-y divide-slate-100 rounded-b-2xl sm:rounded-b-[2rem] overflow-hidden">
          <div v-for="(item, index) in canManageBudget ? items : []" :key="index" class="p-5 flex flex-col gap-3 hover:bg-blue-50/10 transition-colors">
            <div class="flex justify-between items-start">
              <div class="min-w-0">
                <h4 class="font-bold text-slate-800 text-sm truncate">{{ item.name }}</h4>
                <div class="flex items-center gap-2 mt-1">
                  <span :class="getCategoryClass(item.category)" class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                    {{ item.category }}
                  </span>
                  <span class="text-[10px] text-slate-300">•</span>
                  <span class="text-[10px] text-slate-500 font-medium">
                    {{ income > 0 ? ((item.nominal / income) * 100).toFixed(1) : 0 }}%
                  </span>
                </div>
              </div>
              <p class="font-extrabold text-slate-900 text-sm text-right shrink-0">
                {{ formatCurrency(item.nominal) }}
              </p>
            </div>
            
            <div class="flex justify-end gap-3 mt-1 pt-2 border-t border-slate-50">
              <button @click="openEditModal(item)" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Icon name="ph:pencil-simple-bold" />
                <span>Ubah</span>
              </button>
              <button @click="removeItem(item.id)" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <Icon name="ph:trash-bold" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
          <div v-if="!canManageBudget || items.length === 0" class="p-8 text-center text-slate-400 italic text-sm">
            {{ canManageBudget ? 'Belum ada item anggaran. Klik "Tambah Item" untuk memulai.' : 'Daftar alokasi terkunci sampai pemasukan disimpan.' }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="glass-card p-5 sm:p-8">
          <h2 class="text-xl font-bold mb-2 text-center text-slate-700 flex items-center justify-center gap-1.5">
            Visualisasi dari Total Pemasukan
            <div class="relative group/tooltip inline-block">
              <Icon name="ph:info-bold" class="text-slate-300 hover:text-slate-500 cursor-pointer w-4 h-4 transition-colors mt-0.5" />
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900/95 text-white text-[10px] rounded-lg shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-30 text-center font-medium leading-relaxed normal-case tracking-normal">
                Grafik lingkaran (pie chart) interaktif yang memvisualisasikan persentase sebaran alokasi kategori dari total pemasukan rencana.
                <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95"></div>
              </div>
            </div>
          </h2>
          <p class="text-xs text-slate-400 font-medium text-center mb-6">
            Persentase chart mengikuti total pemasukan, sama seperti Ringkasan Kategori.
          </p>
          <ClientOnly>
            <div class="flex justify-center max-w-[450px] mx-auto w-full">
              <apexchart 
                v-if="canManageBudget && chartSeries.length > 0"
                type="pie" 
                width="100%" 
                :options="chartOptions" 
                :series="chartSeries"
              ></apexchart>
              <div v-else class="h-[300px] flex items-center justify-center text-slate-300 italic">
                {{ canManageBudget ? 'Tambah data untuk melihat grafik' : 'Simpan pemasukan untuk membuka visualisasi' }}
              </div>
            </div>
            <template #fallback>
              <div class="h-[300px] flex items-center justify-center text-slate-400">
                Loading Chart...
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- <div class="space-y-6">
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
        </div> -->
        <div class="glass-card p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-xl shadow-blue-200">
          <h3 class="font-bold mb-4">Tips Budgeting</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-3 text-sm">
              <Icon name="ph:check-circle-fill" class="text-white mt-0.5 shrink-0" />
              Gunakan aturan 50/30/20 untuk keseimbangan yang ideal.
            </li>
            <li class="flex items-start gap-3 text-sm">
              <Icon name="ph:check-circle-fill" class="text-white mt-0.5 shrink-0" />
              Prioritaskan Dana Darurat sebelum keinginan lain.
            </li>
          </ul>
        </div>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
        
        <div class="relative w-full max-w-md glass-card p-6 sm:p-8 shadow-2xl animate-scale-up">
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
        
        <div class="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl animate-scale-up">
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

              <div class="flex gap-1.5 items-center flex-wrap">
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
  @apply bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-[2rem] shadow-sm;
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
