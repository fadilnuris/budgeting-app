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

      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="glass-card p-8 rounded-3xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 flex flex-col items-start justify-between gap-6">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-1">Rencana Anggaran</h3>
            <p class="text-slate-500 text-sm">Buat rencana pengeluaran bulanan Anda agar keuangan tetap terkendali.</p>
          </div>
          <NuxtLink 
            to="/budgeting" 
            class="bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-amber-600 transition-all duration-300 shadow-lg shadow-amber-200 active:scale-95 flex items-center gap-2 whitespace-nowrap text-sm"
          >
            Buka Budgeting
            <Icon name="lucide:calculator" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="glass-card p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 flex flex-col items-start justify-between gap-6">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-1">Kelola Transaksi</h3>
            <p class="text-slate-500 text-sm">Lihat riwayat lengkap atau tambahkan transaksi baru secara real-time.</p>
          </div>
          <NuxtLink 
            to="/transactions" 
            class="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2 whitespace-nowrap text-sm"
          >
            Buka Transaksi
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
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
