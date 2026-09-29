<script setup lang="ts">
import { ref } from 'vue'
import Alert from '@/components/Alert.vue'
import { required, minLength, email as validEmail } from '@/utils/validation'

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

const passwordsMatch = (val: string) => val === password.value || 'As senhas não coincidem'

function submit() {}
</script>

<template>
  <div class="row justify-center q-py-lg">
    <q-card flat bordered class="auth-card">
      <q-card-section class="text-center">
        <q-icon name="person_add" size="2.5em" color="primary" />
        <h1 class="text-h5 q-mt-sm q-mb-none">Criar conta</h1>
      </q-card-section>

      <q-card-section>
        <Alert v-if="error" :message="error" class="q-mb-md" @dismiss="error = ''" />
        <q-form @submit="submit">
          <q-input
            v-model="username"
            outlined
            label="Usuário"
            autocomplete="username"
            :rules="[required]"
            :disable="loading"
          >
            <template #prepend><q-icon name="person" /></template>
          </q-input>
          <q-input
            v-model="email"
            outlined
            type="email"
            label="E-mail"
            autocomplete="email"
            :rules="[required, validEmail]"
            :disable="loading"
          >
            <template #prepend><q-icon name="mail" /></template>
          </q-input>
          <q-input
            v-model="password"
            outlined
            :type="showPassword ? 'text' : 'password'"
            label="Senha"
            autocomplete="new-password"
            :rules="[required, minLength(6)]"
            :disable="loading"
          >
            <template #prepend><q-icon name="key" /></template>
            <template #append>
              <q-btn
                flat
                round
                dense
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                :aria-label="showPassword ? 'Ocultar senhas' : 'Mostrar senhas'"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          <q-input
            v-model="confirmPassword"
            outlined
            :type="showPassword ? 'text' : 'password'"
            label="Confirmar senha"
            autocomplete="new-password"
            :rules="[required, passwordsMatch]"
            :disable="loading"
          >
            <template #prepend><q-icon name="key" /></template>
          </q-input>
          <q-btn
            type="submit"
            color="primary"
            label="Criar conta"
            class="full-width q-mt-sm"
            :loading="loading"
          >
            <template #loading>
              <q-spinner class="on-left" />
              Criando conta…
            </template>
          </q-btn>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-section class="text-center">
        Já tem conta?
        <q-btn flat dense no-caps color="primary" label="Entrar" :to="{ name: 'login' }" />
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
