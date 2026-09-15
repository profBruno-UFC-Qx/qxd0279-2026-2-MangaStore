<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useUpload } from '@/api'
import type { Manga } from '@/types'
import { MangaService } from '@/api/MangaService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)
const manga = ref<Manga | null>(null)

onBeforeMount(async () => loadManga(route.params.id as string))

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    loadManga(to.params.id as string)
  }
})

async function loadManga(id: string) {
  try {
    const result = await MangaService.findById(id)
    manga.value = result.data
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

const coverUrl = computed(() => (manga.value ? useUpload(manga.value.cover.url) : ''))
const hasPrevious = computed(() => (manga.value ? manga.value.number <= 1 : false))
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
          <button
            class="btn btn-outline-secondary mx-1"
            :disabled="hasPrevious"
            @click="router.push(`/manga/${manga.id - 1}`)"
          >
            Anterior
          </button>
          <button class="btn btn-outline-secondary" @click="router.push(`/manga/${manga.id + 1}`)">
            Próximo
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
