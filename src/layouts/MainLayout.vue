<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar class="page-width">
        <q-btn
          flat
          no-caps
          icon="menu_book"
          label="MangaStore"
          class="text-weight-bold"
          :to="{ name: 'home' }"
        />

        <q-space />

        <q-btn
          flat
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          :aria-label="$q.dark.isActive ? 'Usar tema claro' : 'Usar tema escuro'"
          @click="$q.dark.toggle()"
        />

        <q-btn-dropdown
          v-if="authStore.isAuthenticated"
          flat
          no-caps
          icon="account_circle"
          :label="authStore.username ?? ''"
        >
          <q-list>
            <q-item v-if="authStore.isAdmin" clickable v-close-popup :to="{ name: 'admin' }">
              <q-item-section avatar><q-icon name="admin_panel_settings" /></q-item-section>
              <q-item-section>Administração</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar><q-icon name="logout" /></q-item-section>
              <q-item-section>Sair</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn v-else flat no-caps icon="login" label="Entrar" :to="{ name: 'login' }" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding>
        <div class="page-width">
          <RouterView />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.page-width {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
}
</style>
