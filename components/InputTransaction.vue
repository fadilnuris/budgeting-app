<script setup>
const type = ref('expense')
const amount = ref('')
const note = ref('')

const submitForm = async () => {
  await $fetch('http://localhost:8080/transactions', {
    method: 'POST',
    body: {
      user_id: 1,
      type: type.value,
      amount: Number(amount.value),
      note: note.value
    }
  })

  // reset form
  amount.value = ''
  note.value = ''
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4 p-4 border rounded">
    
    <select v-model="type" class="border p-2 w-full">
      <option value="income">Income</option>
      <option value="expense">Expense</option>
    </select>

    <input
      v-model="amount"
      type="number"
      placeholder="Total Pengeluaran"
      class="border p-2 w-full"
    />

    <input
      v-model="note"
      type="text"
      placeholder="Catatan"
      class="border p-2 w-full"
    />

    <button class="bg-blue-500 text-white px-4 py-2 rounded">
      Save
    </button>
  </form>
</template>