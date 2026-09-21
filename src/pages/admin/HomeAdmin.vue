<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import { type Manga } from '@/types'
import { MangaService, type MetaInformation } from '@/api/MangaService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'
import { useUpload } from '@/api'

const mangas = ref<Manga[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const meta = ref<MetaInformation>({} as MetaInformation)
const page = ref<number>(1)

async function loadMangas(page: number) {
  try {
    const result = await MangaService.findAll(page || 1)
    mangas.value = mangas.value.concat(result.data)
    meta.value = result.meta
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

onBeforeMount(async () => await loadMangas(page.value))

const hasNextPage = computed(() => page.value < meta.value.pagination.pageCount)

async function goToNextPage() {
  if (hasNextPage.value) {
    page.value = page.value + 1
    loadingMore.value = true
    await loadMangas(page.value)
    loadingMore.value = false
  }
}
</script>

<template>
  <LoadingSpinner v-if="loading" label="Carregando mangás…" />
  <Alert v-else-if="error" :message="error"></Alert>
  <template v-else>
    <table class="col-12 table table-striped" aria-label="Todos os mangás disponíveis">
      <thead>
        <tr>
          <th>#</th>
          <th>Título</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td colspan="3" class="text-center">
            <LoadingSpinner v-if="loadingMore" label="Carregando mangás…" />
            <button v-else-if="hasNextPage" class="btn btn-secondary" @click="goToNextPage">
              Ver mais
            </button>
            <span v-else>Não há mais mangás</span>
          </td>
        </tr>
      </tfoot>
      <tbody>
        <tr v-for="manga in mangas" :key="manga.id">
          <td>{{ manga.number }}</td>
          <td><img :src="useUpload(manga.cover.url)" class="img-thumbnail" /> {{ manga.title }}</td>
          <td>
            <button class="btn btn-sm btn-warning mx-1" title="Editar manga">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-danger btn-sm" title="Remover manga">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </template>
</template>

<style scoped>
.img-thumbnail {
  max-height: 10vh;
  transition: max-height 0.15s ease-out;
  overflow: hidden;
}

.img-thumbnail:hover {
  position: relative;
  max-height: 40vh;
  transition: max-height 0.25s ease-in;
  transform: translate(-25%, 0%);
}
</style>
