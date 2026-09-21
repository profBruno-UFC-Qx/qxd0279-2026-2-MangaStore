<script setup lang="ts">
import { ref, computed } from 'vue'
import Alert from '@/components/Alert.vue'

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const passwordsMatch = computed(() => password.value == confirmPassword.value)

function submit() {}
</script>
<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-4">
      <h1 class="h3 mb-3">Criar conta</h1>
      <Alert v-if="error" :message="error" class="mb-3" />
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label for="username" class="form-label">Usuário</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-control"
            autocomplete="username"
            required
          />
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-control"
            autocomplete="email"
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
            autocomplete="new-password"
            minlength="6"
            required
          />
        </div>
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">Confirmar senha</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': !passwordsMatch }"
            autocomplete="new-password"
            required
          />
          <div v-if="!passwordsMatch" class="invalid-feedback">As senhas não coincidem.</div>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          {{ loading ? 'Criando conta…' : 'Criar conta' }}
        </button>
      </form>
      <p class="mt-3 text-center">Já tem conta? <router-link :to="{ name: 'login' }">Entrar</router-link></p>
    </div>
  </div>
</template>
