<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { MangaService } from '@/api/MangaService'
import { useUpload } from '@/api'
import type { Manga } from '@/types'

const route = useRoute()
const manga = ref<Manga | null>(null)

onBeforeMount(async () => (manga.value = await MangaService.findById(route.params.id as string)))

const coverUrl = computed(() => (manga.value ? useUpload(manga.value.cover.url) : ''))
</script>

<template>
  <div v-if="manga" class="row">
    <div class="card shadow-sm col-md-4">
      <img :src="coverUrl" :alt="'Capa do manga' + manga.title" :title="manga.title" />
    </div>
    <div class="col-md-8">
      <div class="card-header">{{ manga.title }}</div>
      <div class="card-body"></div>
      <p class="card-title">
        {{ manga.summary }}
      </p>
      <p class="card-text fw-bold">
        Preço: <span class="text-danger">{{ manga.price }}</span>
      </p>
    </div>
  </div>
</template>
