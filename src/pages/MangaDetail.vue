<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useUpload } from '@/api'
import type { Manga } from '@/types'
import { MangaService } from '@/api/MangaService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'

const route = useRoute()
const manga = ref<Manga | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onBeforeMount(async () => {
  try {
    manga.value = await MangaService.findById(route.params.id as string)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    {
      try {
        manga.value = await MangaService.findById(to.params.id as string)
      } catch (e) {
        error.value = (e as Error).message
      } finally {
        loading.value = false
      }
    }
  }
})

const coverUrl = computed(() => (manga.value ? useUpload(manga.value.cover.url) : ''))
</script>

<template>
  <LoadingSpinner v-if="loading" label="Carregando detalhes do mangá…" />
  <Alert v-else-if="error" :message="error"></Alert>
  <div v-else-if="manga" class="card shadow-sm mb-3">
    <div class="row g-0">
      <div class="col-md-4">
        <img
          :src="coverUrl"
          :alt="'Capa do manga ' + manga.title"
          :title="manga.title"
          class="rounded-start w-100 h-100 object-fit-cover"
        />
      </div>
      <div class="col-md-8 position-relative">
        <div class="card-body">
          <h5 class="card-title">{{ manga.title }}</h5>
          <h6 class="card-subtitle mb-2 text-body-secondary">Volume {{ manga.number }}</h6>
          <p class="card-text">{{ manga.summary }}</p>
          <p class="card-text fw-bold">
            Preço: <span class="text-danger">{{ manga.price }}</span>
          </p>
        </div>
        <nav class="position-absolute bottom-0 end-0 m-2">
          <button class="btn btn-outline-secondary mx-1">
            <router-link :to="`/manga/${manga.id - 1}`">Anterior</router-link>
          </button>
          <button class="btn btn-outline-secondary">
            <router-link :to="`/manga/${manga.id + 1}`">Próximo</router-link>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<style>
nav a {
  text-decoration: none;
  color: inherit;
}
</style>
