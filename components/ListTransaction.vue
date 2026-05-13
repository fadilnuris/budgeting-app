<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Daftar Transaksi</h1>

    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error...</div>

    <table v-else class="w-full border text-sm">
      <thead class="border-b bg-gray-100">
        <tr>
          <th class="p-2 text-left">Type</th>
          <th class="p-2 text-left">Amount</th>
          <th class="p-2 text-left">Note</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="item in data?.data"
          :key="item.ID"
          class="border-b"
        >
          <td class="p-2 capitalize">{{ item.Type }}</td>
          <td class="p-2">Rp {{ item.Amount.toLocaleString() }}</td>
          <td class="p-2">{{ item.Note }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const { data, pending, error } = await useFetch('http://localhost:8080/transactions')

// debug dulu
console.log(data.value)
</script>