<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import { AlertType, type Manga } from '@/types'
import { MangaService, type MetaInformation } from '@/api/MangaService'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'
import { useUpload } from '@/api'
import Modal from '@/components/Modal.vue'
import { useAlert } from '@/composables/useAlert'

const mangas = ref<Manga[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const { alertMessage, alertType, showAlert, showError } = useAlert()
const meta = ref<MetaInformation>({} as MetaInformation)
const page = ref<number>(1)
const selectedManga = ref<Manga | null>(null)
const showModal = computed(() => selectedManga.value != null)
const deleting = ref(false)

async function loadMangas(page: number) {
  try {
    const result = await MangaService.findAll(page || 1)
    mangas.value = mangas.value.concat(result.data)
    meta.value = result.meta
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
}

async function deleteManga(id: number) {
  try {
    deleting.value = true
    await MangaService.deleteById(id)
    mangas.value = mangas.value.filter((m) => m.id != id)
    showAlert('Manga deletado com sucesso', AlertType.Success)
  } catch (e) {
    showError(e)
  } finally {
    deleting.value = false
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

function openModal(manga: Manga) {
  selectedManga.value = manga
}

function closeModal() {
  selectedManga.value = null
}

async function deleteAndClose() {
  if (selectedManga.value) {
    await deleteManga(selectedManga.value?.id)
  }
  closeModal()
}
</script>

<template>
  <Alert v-if="alertMessage" :message="alertMessage" :type="alertType"></Alert>
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
          <td><img :src="useUpload(manga.cover.url)" class="img-thumbnail" /> {{ manga.title }}</td>
          <td>
            <button class="btn btn-sm btn-warning mx-1" title="Editar manga">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-danger btn-sm" title="Remover manga" @click="openModal(manga)">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <Modal
      title="Confirmação"
      :visible="showModal"
      :content="`Você realmente deseja deletar o Mangá  ${selectedManga?.title}`"
      confirm-label="Deletar"
      cancel-label="Cancelar"
      :confirming="deleting"
      @close="closeModal"
      @confirm="deleteAndClose"
    />
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
