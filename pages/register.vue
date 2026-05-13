<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Buat Akun Baru
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Atau
          <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            masuk ke akun yang sudah ada
          </NuxtLink>
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div class="mb-4">
            <label for="name" class="sr-only">Nama Lengkap</label>
            <input id="name" name="name" type="text" autocomplete="name" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Nama Lengkap" v-model="name" />
          </div>
          <div class="mb-4">
            <label for="email-address" class="sr-only">Alamat Email</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Alamat Email" v-model="email" />
          </div>
          <div class="mb-4">
            <label for="password" class="sr-only">Kata Sandi</label>
            <input id="password" name="password" type="password" autocomplete="new-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Kata Sandi" v-model="password" />
          </div>
          <div>
            <label for="password-confirm" class="sr-only">Konfirmasi Kata Sandi</label>
            <input id="password-confirm" name="password-confirm" type="password" autocomplete="new-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Konfirmasi Kata Sandi" v-model="passwordConfirm" />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="terms" name="terms" type="checkbox" required class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" v-model="acceptTerms" />
            <label for="terms" class="ml-2 block text-sm text-gray-900">
              Saya setuju dengan syarat dan ketentuan
            </label>
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>

        <div>
          <button type="submit" :disabled="isLoading" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </span>
            {{ isLoading ? 'Memproses...' : 'Daftar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'

// Menggunakan shallowRef sesuai permintaan untuk optimasi performa
const name = shallowRef('')
const email = shallowRef('')
const password = shallowRef('')
const passwordConfirm = shallowRef('')
const acceptTerms = shallowRef(false)

const isLoading = shallowRef(false)
const errorMessage = shallowRef('')

const handleRegister = async () => {
  errorMessage.value = ''
  
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Kata sandi tidak cocok!'
    return
  }

  try {
    isLoading.value = true
    // Simulasi request API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Data Register:', {
      name: name.value,
      email: email.value,
      password: password.value,
      acceptTerms: acceptTerms.value
    })
    
    // Berhasil, bisa diarahkan ke halaman login atau dashboard
    alert('Registrasi berhasil!')
  } catch (error) {
    errorMessage.value = 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>
