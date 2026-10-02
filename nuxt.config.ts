// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // Override in production with NUXT_PUBLIC_API_BASE
      apiBase: 'http://localhost:8080'
    }
  },
  app: {
    head: {
      title: 'MoneyPlan',
      titleTemplate: '%s | MoneyPlan',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      meta: [
        { name: 'description', content: 'Kelola budget zero-based bulanan dengan MoneyPlan' }
      ]
    }
  }
})
