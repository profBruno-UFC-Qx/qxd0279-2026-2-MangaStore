<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { MangaService } from '@/api/MangaService'
import { type Manga } from '@/types'
import MangaCard from '@/components/MangaCard.vue'

const mangas = ref<Manga[]>([])

onBeforeMount(async () => (mangas.value = await MangaService.findAll()))
</script>

<template>
  <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
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
