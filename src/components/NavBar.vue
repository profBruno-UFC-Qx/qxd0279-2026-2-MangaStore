<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
function logout() {
  authStore.logout()

  router.push({ name: 'home' })
}
</script>

<template>
  <header data-bs-theme="dark">
    <div class="collapse text-bg-dark" id="navbarHeader">
      <div class="container">
        <div class="row">
          <div class="col-sm-8 col-md-7 py-4">
            <h4>About</h4>
            <p class="text-body-secondary">
              Add some information about the album below, the author, or any other background
              context. Make it a few sentences long so folks can pick up some informative tidbits.
              Then, link them off to some social networking sites or contact information.
            </p>
          </div>
          <div class="col-sm-4 offset-md-1 py-4">
            <h4 v-if="authStore.username">{{ authStore.username }}</h4>
            <ul class="list-unstyled">
              <li v-if="authStore.isAdmin">
                <router-link :to="{ name: 'admin' }" class="text-white">Administração</router-link>
              </li>
              <li v-if="!authStore.isAuthenticated">
                <router-link :to="{ name: 'login' }" class="text-white">Login</router-link>
              </li>
              <li v-else>
                <button class="btn btn-link text-white" @click="logout">Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="navbar navbar-dark bg-dark shadow-sm">
      <div class="container">
        <RouterLink :to="{ name: 'home' }" class="navbar-brand d-flex align-items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            aria-hidden="true"
            class="me-2"
            viewBox="0 0 24 24"
          >
            <path
              d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            ></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          <strong>MangaStore</strong>
        </RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarHeader"
          aria-controls="navbarHeader"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
    </div>
  </header>
</template>
