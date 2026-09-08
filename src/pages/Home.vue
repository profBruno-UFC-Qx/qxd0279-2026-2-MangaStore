<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { MangaService } from '@/api/MangaService'
import { type Manga } from '@/types'
import MangaCard from '@/components/MangaCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const mangas = ref<Manga[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onBeforeMount(async () => {
  try {
    mangas.value = await MangaService.findAll()
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <LoadingSpinner v-if="loading" label="Carregando mangás…" />
  <Alert v-else-if="error" :message="error"></Alert>
  <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
    <MangaCard
      v-for="manga of mangas"
      :key="manga.id"
      :id="manga.id"
      :cover="manga.cover"
      :title="manga.title"
      :summary="manga.summary"
      :price="manga.price"
      :number="manga.number"
    />
  </div>
</template>
