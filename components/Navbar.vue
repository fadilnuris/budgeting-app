<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      scrolled ? 'glass-strong shadow-sm' : 'bg-transparent',
    ]"
  >
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <a
        href="#"
        class="text-lg font-medium tracking-tight text-foreground transition-opacity hover:opacity-70"
      >
        Budgeting
      </a>

      <div class="hidden items-center gap-8 md:flex">
        <ul class="flex items-center gap-8">
          <li v-for="link in navLinks" :key="link.label">
            <a
              :href="link.href"
              class="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
        <ThemeToggle />
      </div>

      <div class="flex items-center gap-4 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          @click="mobileOpen = !mobileOpen"
          class="flex flex-col gap-1.5"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        >
          <span
            :class="[
              'block h-px w-6 bg-foreground transition-all duration-300',
              mobileOpen ? 'translate-y-[3.5px] rotate-45' : '',
            ]"
          />
          <span
            :class="[
              'block h-px w-6 bg-foreground transition-all duration-300',
              mobileOpen ? '-translate-y-[3.5px] -rotate-45' : '',
            ]"
          />
        </button>
      </div>
    </nav>

    <div
      :class="[
        'overflow-hidden transition-all duration-300 md:hidden',
        mobileOpen ? 'glass-strong max-h-64 border-b border-border' : 'max-h-0',
      ]"
    >
      <ul class="flex flex-col gap-4 px-6 py-6">
        <li v-for="link in navLinks" :key="link.label">
          <a
            :href="link.href"
            @click="mobileOpen = false"
            class="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const navLinks = [
  { label: 'Dashbard', href: '#about' },
  { label: 'Budgeting', href: '#experience' },
  { label: 'Savings', href: '#skills' },
  { label: 'Goals', href: '#projects' },
]

const scrolled = ref(false)
const mobileOpen = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
