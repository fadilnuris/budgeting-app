<template>
  <div class="min-h-screen flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <Navbar />
    
    <div class="max-w-6xl mx-auto w-full flex-1 flex flex-col">
      <header class="mb-10 animate-fade-in-up">
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Ringkasan Keuangan</h1>
        <p class="text-slate-500 text-lg">Pantau kondisi keuangan Anda dalam satu tempat.</p>
      </header>

      <div class="animate-fade-in-up" style="animation-delay: 0.1s">
        <SummaryStats />
      </div>

      <div class="mt-8 animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="glass-card p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-1">Kelola Transaksi Anda</h3>
            <p class="text-slate-500">Lihat riwayat lengkap atau tambahkan transaksi baru di menu Transaksi.</p>
          </div>
          <NuxtLink 
            to="/transactions" 
            class="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            Buka Transaksi
            <Icon name="lucide:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '~/components/Navbar.vue';
import SummaryStats from '~/components/SummaryStats.vue';

useHead({
  title: 'Dashboard'
})
</script>
