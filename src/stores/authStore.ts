import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthenticationService } from '@/api/AuthenticationService'
import { ApiError } from '@/api/ApiError'
import { TOKEN_KEY } from '@/api'

export const useAuthStore = defineStore('authStore', () => {
  const username = ref<string | null>(localStorage.getItem('username'))
  const jwt = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const role = ref<string | null>(localStorage.getItem('role'))

  const isAdmin = computed(() => role.value == 'admin')

  async function authenticate(identifier: string, password: string) {
    const result = await AuthenticationService.login(identifier, password)

    username.value = result.user.username
    jwt.value = result.jwt
    role.value = result.user.role?.type || null

    persistState()
  }

  async function fetchMe() {
    if (!jwt.value) return

    try {
      const user = await AuthenticationService.me(jwt.value)
      username.value = user.username
      role.value = user.role?.type || null
      persistState()
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        logout()
      }
    }
  }

  function save(key: string, value: string | null) {
    if (value) {
      localStorage.setItem(key, value)
    } else {
      localStorage.removeItem(key)
    }
  }

  function persistState() {
    save('username', username.value)
    save(TOKEN_KEY, jwt.value)
    save('role', role.value)
  }

  function logout() {
    username.value = null
    jwt.value = null
    role.value = null

    localStorage.removeItem('username')
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('role')
  }

  return { username, isAdmin, authenticate, fetchMe, logout }
})
