<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      scrolled || mobileOpen ? 'glass-strong shadow-sm' : 'bg-transparent py-2',
    ]"
  >
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <NuxtLink
        to="/dashboard"
        class="text-xl font-bold tracking-tight text-primary flex items-center gap-2 animate-fade-in"
      >
        <Icon name="lucide:wallet" class="w-6 h-6 text-primary" />
        <span class="font-outfit">Flowfund</span>
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

        <div class="relative">
          <button
            @click="dropdownOpen = !dropdownOpen"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300 active:scale-95 group"
          >
            <div class="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20 shadow-sm transition-all duration-300 group-hover:scale-105">
              {{ userInitial }}
            </div>
            <span class="text-sm font-semibold text-slate-700 group-hover:text-primary transition-all duration-300 max-w-[120px] truncate">
              {{ userName }}
            </span>
            <Icon
              name="lucide:chevron-down"
              :class="['w-4 h-4 text-slate-400 group-hover:text-primary transition-transform duration-300', dropdownOpen ? 'rotate-180' : '']"
            />
          </button>

          <div v-if="dropdownOpen" class="fixed inset-0 z-40" @click="dropdownOpen = false"></div>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-2 opacity-0 scale-95"
            enter-to-class="translate-y-0 opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100 scale-100"
            leave-to-class="translate-y-2 opacity-0 scale-95"
          >
            <div
              v-if="dropdownOpen"
              class="absolute right-0 mt-3 w-64 rounded-2xl glass-card bg-white/95 border border-slate-100/80 shadow-2xl shadow-slate-200/50 py-3 z-50 origin-top-right transform"
            >
              <div class="px-4 py-2 border-b border-slate-100/60 pb-3 mb-2 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-md border border-primary/20 shadow-inner">
                  {{ userInitial }}
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profil Saya</p>
                  <p class="text-sm font-bold text-slate-800 truncate">{{ userName }}</p>
                  <p class="text-xs font-medium text-slate-400 truncate">{{ userEmail }}</p>
                </div>
              </div>

              <div class="border-t border-slate-100/60 mt-3 pt-2 px-2">
                <button
                  @click="handleLogout"
                  class="w-full flex items-center justify-center gap-2.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  <Icon name="lucide:log-out" class="w-4.5 h-4.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="flex items-center gap-4 md:hidden">
        <button
          type="button"
          @click="mobileOpen = !mobileOpen"
          class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50/80 hover:bg-slate-100 border border-slate-100/60 text-slate-800 transition-all active:scale-95 shadow-sm"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        >
          <Icon 
            :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" 
            class="w-5 h-5 text-slate-600 transition-transform duration-300"
            :class="mobileOpen ? 'rotate-90' : ''"
          />
        </button>
      </div>
    </nav>

    <div
      :class="[
        'overflow-hidden transition-all duration-300 md:hidden',
        mobileOpen ? 'glass-strong max-h-[380px] border-b border-slate-100 shadow-lg shadow-slate-100/50' : 'max-h-0',
      ]"
    >
      <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
        <div class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-md border border-primary/20 shadow-sm">
          {{ userInitial }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-bold text-slate-800 truncate">{{ userName }}</p>
          <p class="text-xs font-semibold text-slate-400 truncate">{{ userEmail }}</p>
        </div>
      </div>

      <ul class="flex flex-col gap-1 px-4 py-4">
        <li v-for="link in navLinks" :key="link.label">
          <NuxtLink
            :to="link.href"
            @click="mobileOpen = false"
            class="relative px-4 py-3 text-sm font-semibold text-slate-600 hover:text-primary transition-all duration-300 rounded-xl flex items-center group"
            active-class="text-primary bg-primary/10 shadow-sm shadow-primary/5"
          >
            {{ link.label }}
            <span 
              class="absolute left-0 w-1 h-5 bg-primary rounded-r-full scale-y-0 transition-transform duration-300 group-[.router-link-active]:scale-y-100"
            ></span>
          </NuxtLink>
        </li>
        <li class="pt-2 mt-2 border-t border-slate-100">
          <button 
            @click="handleLogout"
            class="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
          >
            <Icon name="lucide:log-out" class="w-4.5 h-4.5" />
            <span>Keluar</span>
          </button>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Transaksi', href: '/transactions' },
  { label: 'Budgeting', href: '/budgeting' },
]

const scrolled = ref(false)
const mobileOpen = ref(false)
const dropdownOpen = ref(false)

const userNameCookie = useCookie('user_name')
const userEmailCookie = useCookie('user_email')
const userIdCookie = useCookie('user_id')

const profileName = ref('')
const profileEmail = ref('')

const userName = computed(() => profileName.value || userNameCookie.value || 'Pengguna Flowfund')
const userEmail = computed(() => profileEmail.value || userEmailCookie.value || 'pengguna@flowfund.com')

const userInitial = computed(() => {
  const name = userName.value
  return name ? name.trim().charAt(0).toUpperCase() : 'P'
})

const fetchProfile = async () => {
  const userId = userIdCookie.value
  if (!userId) return
  
  try {
    const response: any = await $fetch('https://budgeting-api.up.railway.app/profile', {
      params: { user_id: userId }
    })
    if (response?.data) {
      profileName.value = response.data.name || response.data.Name || ''
      profileEmail.value = response.data.email || response.data.Email || ''
      
      // Sync back to cookies to keep cached values up-to-date
      userNameCookie.value = profileName.value
      userEmailCookie.value = profileEmail.value
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  }
}

const handleLogout = () => {
  const authToken = useCookie('auth_token')
  authToken.value = null
  
  const userCookie = useCookie('user_id')
  userCookie.value = null
  
  const userNameCookieLocal = useCookie('user_name')
  userNameCookieLocal.value = null
  
  const userEmailCookieLocal = useCookie('user_email')
  userEmailCookieLocal.value = null

  dropdownOpen.value = false
  mobileOpen.value = false
  router.push('/login')
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  handleScroll()
  fetchProfile()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
