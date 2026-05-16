export default defineNuxtRouteMiddleware((to, from) => {
  const authToken = useCookie('auth_token')

  // List of public pages that don't require authentication
  const publicPages = ['/login', '/register']

  // If the user is on the root path, redirect to dashboard if logged in, otherwise login
  if (to.path === '/') {
    return authToken.value ? navigateTo('/dashboard') : navigateTo('/login')
  }

  // If the user is not logged in and is trying to access a protected page
  if (!authToken.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }

  // If the user is already logged in and is trying to access login/register
  if (authToken.value && publicPages.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
