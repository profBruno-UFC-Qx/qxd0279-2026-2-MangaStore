<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Alert from '@/components/Alert.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const identifier = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function destination(): RouteLocationRaw {
  const redirect = route.query.redirect

  if (typeof redirect === 'string' && /^\/(?![/\\])/.test(redirect)) {
    const { meta } = router.resolve(redirect)
    if (!meta.requiresAuth || authStore.isAdmin) {
      return redirect
    }
  }

  return { name: authStore.isAdmin ? 'admin' : 'home' }
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.authenticate(identifier.value, password.value)
    router.push(destination())
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-4">
      <h1 class="h3 mb-3">Entrar</h1>
      <Alert v-if="error" :message="error" class="mb-3" />
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label for="identifier" class="form-label">E-mail ou usuário</label>
          <input
            id="identifier"
            v-model="identifier"
            type="text"
            class="form-control"
            autocomplete="username"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            autocomplete="current-password"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
      <p class="mt-3 text-center">
        Não tem conta? <router-link :to="{ name: 'register' }">Cadastre-se</router-link>
      </p>
    </div>
  </div>
</template>
