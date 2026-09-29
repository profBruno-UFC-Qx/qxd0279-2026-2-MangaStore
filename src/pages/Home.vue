<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import type { Manga } from '@/types'
import { MangaService, type MetaInformation } from '@/api/MangaService'
import MangaCard from '@/components/MangaCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'

const route = useRoute()
const router = useRouter()
const mangas = ref<Manga[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const meta = ref<MetaInformation>({} as MetaInformation)

const currentPage = computed({
  get: () => meta.value.pagination?.page ?? 1,
  set: (page: number) => router.push({ name: 'home', query: { page } }),
})

async function loadMangas(page: number) {
  error.value = null
  try {
    const result = await MangaService.findAll(page || 1)
    mangas.value = result.data
    meta.value = result.meta
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

onBeforeMount(async () => await loadMangas(Number(route.query.page)))
onBeforeRouteUpdate(async (to, from) => {
  if (to.query.page != from.query.page) {
    await loadMangas(Number(to.query.page))
  }
})
</script>

<template>
  <LoadingSpinner v-if="loading" label="Carregando mangás…" />
  <Alert v-else-if="error" :message="error" @dismiss="error = null" />
  <template v-else>
    <div class="flex flex-center q-mb-md">
      <q-pagination
        color="secondary"
        v-model="currentPage"
        :max="meta.pagination?.pageCount ?? 1"
        :max-pages="7"
        direction-links
        boundary-links
      />
    </div>
    <div class="shelf">
      <div v-for="manga of mangas" :key="manga.id" class="shelf-item">
        <MangaCard
          :id="manga.id"
          :cover="manga.cover"
          :title="manga.title"
          :summary="manga.summary"
          :price="manga.price"
          :number="manga.number"
        />
      </div>
    </div>
    <div class="flex flex-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        color="secondary"
        :max="meta.pagination?.pageCount ?? 1"
        :max-pages="7"
        direction-links
        boundary-links
      />
    </div>
  </template>
</template>

<style scoped>
.shelf {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.shelf-item {
  position: relative;
  width: calc(50% - 8px);
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

@media (hover: hover) and (min-width: 600px) {
  .shelf {
    gap: 32px 0;
    padding: 12px 110px 0 0;
  }

  .shelf-item {
    width: max(180px, 20%);
    margin-right: -110px;
  }

  .shelf-item:hover,
  .shelf-item:focus-within {
    z-index: 1;
    transform: translateY(-12px) scale(1.05);
  }

  .shelf:hover .shelf-item:not(:hover) {
    filter: grayscale(90%);
  }
}
</style>
