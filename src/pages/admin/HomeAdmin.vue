<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import { useQuasar, type QTableColumn } from 'quasar'
import type { Manga } from '@/types'
import { MangaService, type MetaInformation } from '@/api/MangaService'
import Alert from '@/components/Alert.vue'
import { useUpload } from '@/api'

const $q = useQuasar()
const mangas = ref<Manga[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const meta = ref<MetaInformation | null>(null)
const page = ref<number>(1)

const columns: QTableColumn<Manga>[] = [
  { name: 'cover', label: 'Capa', field: (row) => row.cover.url, align: 'left' },
  { name: 'title', label: 'Título', field: 'title', align: 'left', sortable: true },
  { name: 'number', label: 'Volume', field: 'number', align: 'center', sortable: true },
  {
    name: 'price',
    label: 'Preço',
    field: 'price',
    align: 'right',
    sortable: true,
    format: (price: number) =>
      price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  },
  { name: 'actions', label: 'Ações', field: 'id', align: 'right' },
]

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
  <div class="row items-center justify-between q-mb-md">
    <h1 class="text-h5 q-my-none">Mangás</h1>
    <q-btn color="positive" icon="add" label="Adicionar" :to="{ name: 'manga-new' }" />
  </div>

  <Alert v-if="error" :message="error" class="q-mb-md" @dismiss="error = null" />

  <q-table
    flat
    bordered
    row-key="id"
    :rows="mangas"
    :columns="columns"
    :loading="loading"
    :pagination="{ rowsPerPage: 0 }"
    hide-pagination
    no-data-label="Nenhum mangá cadastrado"
    loading-label="Carregando mangás…"
    aria-label="Todos os mangás disponíveis"
  >
    <template #body-cell-cover="props">
      <q-td :props="props">
        <div class="thumbnail">
          <q-img
            :src="useUpload(props.row.cover.url)"
            :alt="`Capa do manga ${props.row.title}`"
            :ratio="2 / 3"
            class="rounded-borders"
          />
          <q-tooltip class="bg-transparent q-pa-none" anchor="center right" self="center left">
            <q-img
              :src="useUpload(props.row.cover.url)"
              :ratio="2 / 3"
              width="200px"
              class="rounded-borders shadow-10"
            />
          </q-tooltip>
        </div>
      </q-td>
    </template>

    <template #body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          unelevated
          round
          dense
          color="warning"
          text-color="dark"
          icon="edit"
          aria-label="Editar manga"
          :to="{ name: 'manga-edit', params: { id: props.row.id } }"
        >
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          color="negative"
          icon="delete"
          aria-label="Remover manga"
          @click="confirmDelete(props.row)"
        >
          <q-tooltip>Remover</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>

  <div v-if="!loading" class="flex flex-center q-mt-md">
    <q-btn
      v-if="hasNextPage"
      outline
      color="secondary"
      label="Ver mais"
      :loading="loadingMore"
      @click="goToNextPage"
    />
    <span v-else class="text-grey">Não há mais mangás</span>
  </div>
</template>

<style scoped>
.thumbnail {
  width: 48px;
}
</style>
