<template>
  <main class="min-h-screen">
    <!-- <Navbar /> -->
    <section>
      <ListTransaction />
      <InputTransaction />
    </section>
  </main>
</template>

<script setup lang="ts">
import InputTransaction from '~/components/InputTransaction.vue';
import ListTransaction from '~/components/ListTransaction.vue';
</script>
