import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthenticationService } from '@/api/AuthenticationService'

export const useAuthStore = defineStore('authStore', () => {
  const username = ref<string | undefined>()
  const jwt = ref<string | undefined>()
  const role = ref<string | undefined>()

  const isAdmin = computed(() => role.value == 'admin')

  async function authenticate(identifier: string, password: string) {
    const result = await AuthenticationService.login(identifier, password)

    username.value = result.user.username
    jwt.value = result.jwt
    role.value = result.user.role?.type
  }

  function logout() {}

  return { username, isAdmin, authenticate, logout }
})
