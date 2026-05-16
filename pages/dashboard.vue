<template>
  <div class="min-h-screen flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <Navbar />
    
    <div class="max-w-6xl mx-auto w-full flex-1 flex flex-col">
      <header class="mb-10 animate-fade-in-up">
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Financial Overview</h1>
        <p class="text-slate-500 text-lg">Track your income and expenses seamlessly.</p>
      </header>

      <div class="animate-fade-in-up" style="animation-delay: 0.1s">
        <SummaryStats />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1 animate-fade-in-up" style="animation-delay: 0.2s">
          <InputTransaction />
        </div>
        <div class="lg:col-span-2 animate-fade-in-up" style="animation-delay: 0.3s">
          <ListTransaction />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '~/components/Navbar.vue';
import InputTransaction from '~/components/InputTransaction.vue';
import ListTransaction from '~/components/ListTransaction.vue';
import SummaryStats from '~/components/SummaryStats.vue';
</script>
