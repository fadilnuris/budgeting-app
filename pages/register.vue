<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-60"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-60"></div>
    </div>

    <div class="max-w-md w-full space-y-8 glass-card bg-white/70 backdrop-blur-xl p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl relative z-10 border border-white/50 animate-fade-in">
      <div class="text-center">
        <div class="mx-auto h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
          <Icon name="lucide:user-plus" class="h-7 w-7 text-white" />
        </div>
        <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">
          Register
        </h2>
        <p class="mt-1 text-slate-500 font-medium">
          Mulai kelola keuangan Anda
        </p>
      </div>

      <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-semibold text-slate-700 mb-1 ml-1">Nama Lengkap</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              required 
              class="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white/50" 
              placeholder="Masukkan Nama" 
              v-model="name" 
            />
          </div>
          <div>
            <label for="email-address" class="block text-sm font-semibold text-slate-700 mb-1 ml-1">Email</label>
            <input 
              id="email-address" 
              name="email" 
              type="email" 
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
                required 
                class="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white/50 pr-10" 
                placeholder="Masukkan Password" 
                v-model="password" 
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors duration-200"
              >
                <Icon v-if="!showPassword" name="lucide:eye" class="h-4 w-4" />
                <Icon v-else name="lucide:eye-off" class="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label for="password-confirm" class="block text-sm font-semibold text-slate-700 mb-1 ml-1">Konfirmasi Password</label>
            <div class="relative">
              <input 
                id="password-confirm" 
                name="password-confirm" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                required 
                class="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white/50 pr-10" 
                placeholder="Masukkan Password Konfirmasi" 
                v-model="passwordConfirm" 
              />
              <button 
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors duration-200"
              >
                <Icon v-if="!showConfirmPassword" name="lucide:eye" class="h-4 w-4" />
                <Icon v-else name="lucide:eye-off" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

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
            Daftar Sekarang
          </button>
        </div>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500">
          Sudah punya akun? 
          <NuxtLink to="/login" class="font-bold text-primary hover:text-primary/90 transition-colors duration-200 ml-1">
            Masuk di sini
          </NuxtLink>
        </p>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" @click="goToLogin"></div>
      
      <!-- Modal Box -->
      <div class="max-w-md w-full bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 text-center transform scale-100 transition-all duration-300 animate-fade-in-up">
        <!-- Beautiful Success Icon -->
        <div class="mx-auto h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
          <div class="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Icon name="lucide:check" class="h-8 w-8 text-white stroke-[3px]" />
          </div>
        </div>
        
        <h3 class="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Pendaftaran Berhasil!
        </h3>
        
        <p class="text-slate-500 font-medium mb-8 px-2">
          Akun Anda telah berhasil dibuat. Silakan masuk untuk mulai mengelola keuangan Anda dengan Flowfund.
        </p>
        
        <button 
          @click="goToLogin"
          class="w-full flex justify-center items-center space-x-2 py-3.5 px-6 rounded-2xl text-md font-bold text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0 animate-pulse-subtle"
        >
          <span>Masuk ke Akun</span>
          <Icon name="lucide:arrow-right" class="h-5 w-5" />
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showSuccessModal = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const goToLogin = () => {
  router.push('/login')
}

const handleRegister = async () => {
  errorMessage.value = ''
  
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Kata sandi tidak cocok!'
    return
  }

  isLoading.value = true
  
  try {
    await $fetch('https://budgeting-api.up.railway.app/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
        confirmation_password: passwordConfirm.value
      }
    })

    showSuccessModal.value = true
  } catch (error: any) {
    errorMessage.value = error.data?.error || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Daftar',
  meta: [
    { name: 'description', content: 'Buat akun Flowfund Anda untuk mulai mengelola keuangan dengan lebih cerdas.' }
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
