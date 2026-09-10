<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { type Manga } from '@/types'
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

async function loadMangas(page = 1) {
  try {
    const result = await MangaService.findAll(page)
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
  <Alert v-else-if="error" :message="error"></Alert>
  <template v-else>
    <nav
      class="btn-toolbar mb-3 d-flex justify-content-center"
      role="toolbar"
      aria-label="Toolbar with button groups"
    >
      <div class="btn-group me-2" role="group" aria-label="First group">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="meta.pagination.page == 1"
          @click="router.push('/?page=1')"
        >
          Primeira
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="meta.pagination.page == 1"
          @click="router.push(`/?page=${meta.pagination.page - 1}`)"
        >
          Anterior
        </button>
        <button
          v-for="i in meta.pagination?.pageCount"
          :key="i"
          type="button"
          class="btn btn-outline-secondary"
          @click="router.push(`/?page=${i}`)"
        >
          {{ i }}
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="meta.pagination.page == meta.pagination.pageCount"
          @click="router.push(`/?page=${meta.pagination.page + 1}`)"
        >
          Próximo
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="meta.pagination.page == meta.pagination.pageCount"
          @click="router.push(`/?page=${meta.pagination.pageCount}`)"
        >
          Última
        </button>
      </div>
    </nav>
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
</template>
