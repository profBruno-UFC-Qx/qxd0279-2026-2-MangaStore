<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
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
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">{{ manga.title }}</h5>
          <h6 class="card-subtitle mb-2 text-body-secondary">Volume {{ manga.number }}</h6>
          <p class="card-text">{{ manga.summary }}</p>
          <p class="card-text fw-bold">
            Preço: <span class="text-danger">{{ manga.price }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
