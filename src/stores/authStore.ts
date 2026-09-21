import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthenticationService } from '@/api/AuthenticationService'

export const useAuthStore = defineStore('authStore', () => {
  const username = ref<string | null>(localStorage.getItem('username'))
  const jwt = ref<string | null>(localStorage.getItem('token'))
  const role = ref<string | null>(localStorage.getItem('role'))

  const isAdmin = computed(() => role.value == 'admin')

  async function authenticate(identifier: string, password: string) {
    const result = await AuthenticationService.login(identifier, password)

    username.value = result.user.username
    jwt.value = result.jwt
    role.value = result.user.role?.type || null

    persistState()
  }

  function persistState() {
    localStorage.setItem('username', username.value!!)
    localStorage.setItem('token', jwt.value!!)
    localStorage.setItem('role', role.value!!)
  }

  function logout() {
    username.value = null
    jwt.value = null
    role.value = null

    localStorage.clear()
  }

  return { username, isAdmin, authenticate, logout }
})
