<template>
  <div class="min-h-screen flex flex-col bg-[#F9FAFB] text-slate-700 font-sans relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[120px] mix-blend-multiply animate-pulse" style="animation-duration: 8s;"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100/40 blur-[120px] mix-blend-multiply animate-pulse" style="animation-duration: 10s;"></div>
    
    <main class="flex-1 relative z-10">
      <slot />
    </main>
  </div>
</template>
