<template>
  <div ref="monthDropdownRef" class="relative z-30">
    <div 
      @click="triggerMonthPicker"
      class="flex items-center gap-2 bg-white/80 hover:bg-white border border-slate-200 hover:border-primary rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 cursor-pointer group active:scale-95 select-none"
    >
      <Icon name="ph:calendar-bold" class="text-primary w-5 h-5" />
      <span>{{ formatMonthLabel(modelValue) }}</span>
      <Icon name="ph:caret-down-bold" class="text-slate-400 w-3.5 h-3.5 group-hover:text-primary transition-colors" />
    </div>

    <!-- Custom Dropdown Month Picker -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div 
        v-if="isMonthDropdownOpen" 
        class="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl z-30 p-4 animate-scale-up"
      >
        <!-- Year selector header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <button 
            type="button" 
            @click.stop="prevPickerYear" 
            class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors animate-fade-in"
          >
            <Icon name="ph:caret-left-bold" class="w-4 h-4" />
          </button>
          <span class="font-extrabold text-slate-800 text-sm tracking-wide">{{ pickerYear }}</span>
          <button 
            type="button" 
            @click.stop="nextPickerYear" 
            class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors animate-fade-in"
          >
            <Icon name="ph:caret-right-bold" class="w-4 h-4" />
          </button>
        </div>

        <!-- 3x4 month grid -->
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="(name, index) in monthNames"
            :key="index"
            type="button"
            @click.stop="selectMonth(index)"
            :class="[
              isSelected(index)
                ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90'
                : 'hover:bg-slate-50 text-slate-600 hover:text-primary font-bold'
            ]"
            class="py-2.5 px-2 text-xs rounded-xl font-bold transition-all text-center"
          >
            {{ name }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string // YYYY-MM
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change'): void
}>()

const isMonthDropdownOpen = ref(false)
const monthDropdownRef = ref<HTMLElement | null>(null)
const pickerYear = ref(parseInt(props.modelValue.split('-')[0] || new Date().getFullYear().toString(), 10))

const triggerMonthPicker = () => {
  isMonthDropdownOpen.value = !isMonthDropdownOpen.value
  if (isMonthDropdownOpen.value) {
    const yearStr = props.modelValue.split('-')[0]
    if (yearStr) {
      const year = parseInt(yearStr, 10)
      if (!isNaN(year)) {
        pickerYear.value = year
      }
    }
  }
}

const selectMonth = (monthIndex: number) => {
  const formattedMonth = String(monthIndex + 1).padStart(2, '0')
  const newValue = `${pickerYear.value}-${formattedMonth}`
  emit('update:modelValue', newValue)
  emit('change')
  isMonthDropdownOpen.value = false
}

const prevPickerYear = () => {
  pickerYear.value--
}

const nextPickerYear = () => {
  pickerYear.value++
}

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
]

const isSelected = (index: number) => {
  const parts = props.modelValue.split('-')
  const currentYear = parts[0]
  const currentMonthStr = parts[1]
  if (!currentYear || !currentMonthStr) return false
  const currentMonthIdx = parseInt(currentMonthStr, 10) - 1
  return pickerYear.value === parseInt(currentYear, 10) && index === currentMonthIdx
}

const formatMonthLabel = (monthStr: string) => {
  if (!monthStr) return ''
  const parts = monthStr.split('-')
  const yearStr = parts[0]
  const monthStr2 = parts[1]
  if (!yearStr || !monthStr2) return monthStr
  const date = new Date(parseInt(yearStr, 10), parseInt(monthStr2, 10) - 1)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

const handleClickOutside = (event: MouseEvent) => {
  if (monthDropdownRef.value && !monthDropdownRef.value.contains(event.target as Node)) {
    isMonthDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.animate-scale-up {
  animation: scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
