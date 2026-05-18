<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-60"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-60"></div>
    </div>

    <div class="max-w-md w-full space-y-8 glass-card bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl relative z-10 border border-white/50 animate-fade-in">
      <div class="text-center">
        <div class="mx-auto h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
          <Icon name="lucide:wallet" class="h-7 w-7 text-white" />
        </div>
        <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">
          Login
        </h2>
        <p class="mt-1 text-slate-500 font-medium">
          Masuk ke akun Flowfund Anda
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email-address" class="block text-sm font-semibold text-slate-700 mb-1 ml-1">Email</label>
            <input 
              id="email-address" 
              name="email" 
              type="email" 
              autocomplete="email" 
              required 
              class="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white/50" 
              placeholder="Masukkan Email" 
              v-model="email" 
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-semibold text-slate-700 mb-1 ml-1">Password</label>
            <div class="relative">
              <input 
                id="password" 
                name="password" 
                :type="showPassword ? 'text' : 'password'" 
                autocomplete="current-password" 
                required 
                class="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white/50 pr-12" 
                placeholder="Masukkan Password" 
                v-model="password" 
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors duration-200"
              >
                <Icon v-if="!showPassword" name="lucide:eye" class="h-5 w-5" />
                <Icon v-else name="lucide:eye-off" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- <div class="flex items-center justify-end">
          <div class="text-sm">
            <a href="#" class="font-semibold text-primary hover:text-primary/90 transition-colors duration-200">
              Lupa kata sandi?
            </a>
          </div>
        </div> -->

        <div v-if="errorMessage" class="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm border border-rose-100 flex items-center space-x-2 animate-shake">
          <Icon name="lucide:alert-circle" class="w-5 h-5 flex-shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="isLoading" 
            class="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-md font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary/20"
          >
            Masuk ke Akun
          </button>
        </div>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500">
          Belum punya akun? 
          <NuxtLink to="/register" class="font-bold text-primary hover:text-primary/90 transition-colors duration-200 ml-1">
            Daftar sekarang
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const response: any = await $fetch('https://budgeting-api.up.railway.app/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })
    
    const authToken = useCookie('auth_token', {
      maxAge: 60 * 60 * 24 * 3,
      path: '/'
    })
    authToken.value = response.token || 'logged-in'

    const userCookie = useCookie('user_id', {
      maxAge: 60 * 60 * 24 * 3,
      path: '/'
    })
    const userIdVal = response.data?.ID || response.data?.id
    userCookie.value = userIdVal ? userIdVal.toString() : ''

    const userNameCookie = useCookie('user_name', {
      maxAge: 60 * 60 * 24 * 3,
      path: '/'
    })
    userNameCookie.value = response.data?.name || response.data?.Name || 'Pengguna Flowfund'

    const userEmailCookie = useCookie('user_email', {
      maxAge: 60 * 60 * 24 * 3,
      path: '/'
    })
    userEmailCookie.value = response.data?.email || response.data?.Email || 'pengguna@flowfund.com'
    
    router.push('/dashboard')
  } catch (error: any) {
    errorMessage.value = error.data?.error || 'Email atau kata sandi salah.'
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Masuk',
  meta: [
    { name: 'description', content: 'Masuk ke akun Flowfund Anda untuk mulai mengelola keuangan.' }
  ]
})
</script>

<style scoped>
.glass-card {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
