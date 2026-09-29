<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuasar } from 'quasar'
import type { Manga } from '@/types'
import { MangaService, type MetaInformation } from '@/api/MangaService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'
import { useUpload } from '@/api'

const $q = useQuasar()
const mangas = ref<Manga[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const meta = ref<MetaInformation | null>(null)
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

async function deleteManga(id: number) {
  $q.loading.show({ message: 'Deletando…' })
  try {
    await MangaService.deleteById(id)
    mangas.value = mangas.value.filter((m) => m.id != id)
    $q.notify({ type: 'positive', message: 'Manga deletado com sucesso', position: 'top-right' })
  } catch (e) {
    $q.notify({ type: 'negative', message: (e as Error).message, position: 'top-right' })
  } finally {
    $q.loading.hide()
  }
}

onBeforeMount(async () => await loadMangas(page.value))

const hasNextPage = computed(() => page.value < (meta.value?.pagination.pageCount ?? 0))

async function goToNextPage() {
  if (hasNextPage.value) {
    page.value = page.value + 1
    loadingMore.value = true
    await loadMangas(page.value)
    loadingMore.value = false
  }
}

function confirmDelete(manga: Manga) {
  $q.dialog({
    title: 'Confirmação',
    message: `Você realmente deseja deletar o Mangá ${manga.title}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Deletar', color: 'negative' },
    persistent: true,
  }).onOk(() => deleteManga(manga.id))
}
</script>

<template>
  <div class="row">
    <Alert v-if="error" :message="error" class="col-12 q-mb-md" @dismiss="error = null" />
    <RouterLink :to="{ name: 'manga-new' }" class="btn btn-success col-md-2 mb-3">
      <i class="bi bi-plus"></i>Adicionar
    </RouterLink>

    <LoadingSpinner v-if="loading" label="Carregando mangás…" />
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
            <td>
              <img :src="useUpload(manga.cover.url)" class="img-thumbnail" /> {{ manga.title }}
            </td>
            <td>
              <RouterLink
                :to="{ name: 'manga-edit', params: { id: manga.id } }"
                class="btn btn-sm btn-warning mx-1"
                title="Editar manga"
              >
                <i class="bi bi-pencil"></i>
              </RouterLink>
              <button
                class="btn btn-danger btn-sm"
                title="Remover manga"
                @click="confirmDelete(manga)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
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
