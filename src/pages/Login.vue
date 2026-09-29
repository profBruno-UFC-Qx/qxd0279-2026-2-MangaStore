<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Alert from '@/components/Alert.vue'
import { required } from '@/utils/validation'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const identifier = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

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
  <div class="row justify-center q-py-lg">
    <q-card flat bordered class="auth-card">
      <q-card-section class="text-center">
        <q-icon name="lock" size="2.5em" color="primary" />
        <h1 class="text-h5 q-mt-sm q-mb-none">Entrar</h1>
      </q-card-section>

      <q-card-section>
        <Alert v-if="error" :message="error" class="q-mb-md" @dismiss="error = ''" />
        <q-form @submit="submit">
          <q-input
            v-model="identifier"
            outlined
            label="E-mail ou usuário"
            autocomplete="username"
            :rules="[required]"
            :disable="loading"
          >
            <template #prepend><q-icon name="person" /></template>
          </q-input>
          <q-input
            v-model="password"
            outlined
            :type="showPassword ? 'text' : 'password'"
            label="Senha"
            autocomplete="current-password"
            :rules="[required]"
            :disable="loading"
          >
            <template #prepend><q-icon name="key" /></template>
            <template #append>
              <q-btn
                flat
                round
                dense
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          <q-btn
            type="submit"
            color="primary"
            label="Entrar"
            class="full-width q-mt-sm"
            :loading="loading"
          >
            <template #loading>
              <q-spinner class="on-left" />
              Entrando…
            </template>
          </q-btn>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-section class="text-center">
        Não tem conta?
        <q-btn flat dense no-caps color="primary" label="Cadastre-se" :to="{ name: 'register' }" />
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
}
</style>
