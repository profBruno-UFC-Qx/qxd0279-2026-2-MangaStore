<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { type Manga } from '../types'
import MangaCard from '../components/MangaCard.vue'

const mangas = ref<Manga[]>([])

onBeforeMount(async () => loadMangas())

async function loadMangas() {
  try {
    const response = await fetch('http://localhost:1337/api/mangas?populate=cover')
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }

    const result = await response.json()
    mangas.value = result.data
    console.log(result)
  } catch (error) {
    console.error(error.message)
  }
}
</script>

<template>
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
</template>
