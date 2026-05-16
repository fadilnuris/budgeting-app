<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      scrolled ? 'glass-strong shadow-sm' : 'bg-transparent py-2',
    ]"
  >
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <NuxtLink
        to="/dashboard"
        class="text-xl font-bold tracking-tight text-primary flex items-center gap-2"
      >
        <Icon name="lucide:wallet" class="w-6 h-6" />
        <span>Flowfund</span>
      </NuxtLink>

      <div class="hidden items-center gap-8 md:flex">
        <ul class="flex items-center gap-8">
          <li v-for="link in navLinks" :key="link.label">
            <NuxtLink
              :to="link.href"
              class="relative px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary transition-all duration-300 rounded-xl flex items-center justify-center group"
              active-class="text-primary bg-primary/10 shadow-sm shadow-primary/5"
              exact-active-class="text-primary bg-primary/10"
            >
              {{ link.label }}
              <span 
                class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full scale-0 transition-transform duration-300 group-[.router-link-active]:scale-100"
              ></span>
            </NuxtLink>
          </li>
        </ul>
        <button 
          @click="handleLogout"
          class="border-2 border-primary text-primary text-sm font-semibold px-5 py-2 rounded-xl hover:bg-primary transition-all duration-300 hover:text-white shadow-md shadow-primary/10 hover:shadow-lg active:scale-95"
        >
          Keluar
        </button>
      </div>

      <div class="flex items-center gap-4 md:hidden">
        <button
          type="button"
          @click="mobileOpen = !mobileOpen"
          class="flex flex-col gap-1.5"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        >
          <span
            :class="[
              'block h-px w-6 bg-slate-800 transition-all duration-300',
              mobileOpen ? 'translate-y-[3.5px] rotate-45' : '',
            ]"
          />
          <span
            :class="[
              'block h-px w-6 bg-slate-800 transition-all duration-300',
              mobileOpen ? '-translate-y-[3.5px] -rotate-45' : '',
            ]"
          />
        </button>
      </div>
    </nav>

    <div
      :class="[
        'overflow-hidden transition-all duration-300 md:hidden',
        mobileOpen ? 'glass-strong max-h-64 border-b border-slate-100' : 'max-h-0',
      ]"
    >
      <ul class="flex flex-col gap-4 px-6 py-6">
        <li v-for="link in navLinks" :key="link.label">
          <NuxtLink
            :to="link.href"
            @click="mobileOpen = false"
            class="relative px-4 py-3 text-sm font-semibold text-slate-600 hover:text-primary transition-all duration-300 rounded-xl flex items-center group"
            active-class="text-primary bg-primary/10"
          >
            {{ link.label }}
            <span 
              class="absolute left-0 w-1 h-6 bg-primary rounded-r-full scale-y-0 transition-transform duration-300 group-[.router-link-active]:scale-y-100"
            ></span>
          </NuxtLink>
        </li>
        <li>
          <button 
            @click="handleLogout"
            class="w-full text-left text-sm font-semibold text-rose-500 py-2"
          >
            Keluar
          </button>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Transaksi', href: '/transactions' },
  // { label: 'Analisis', href: '#' },
  // { label: 'Pengaturan', href: '#' },
]

const scrolled = ref(false)
const mobileOpen = ref(false)

const handleLogout = () => {
  const authToken = useCookie('auth_token')
  authToken.value = null
  router.push('/login')
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

