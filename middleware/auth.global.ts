export default defineNuxtRouteMiddleware((to, from) => {
  const authToken = useCookie('auth_token')

  const publicPages = ['/login', '/register']

  if (to.path === '/') {
    return authToken.value ? navigateTo('/dashboard') : navigateTo('/login')
  }
  if (!authToken.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }

  if (authToken.value && publicPages.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
