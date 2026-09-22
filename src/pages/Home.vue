<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import type { Manga } from '@/types'
import { MangaService, type MetaInformation } from '@/api/MangaService'
import MangaCard from '@/components/MangaCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'
import PaginationContainer from '@/components/PaginationContainer.vue'
import { useAlert } from '@/composables/useAlert'

const route = useRoute()
const mangas = ref<Manga[]>([])
const loading = ref(true)
const { alertMessage, alertType, showError } = useAlert()
const meta = ref<MetaInformation>({} as MetaInformation)

async function loadMangas(page: number) {
  try {
    const result = await MangaService.findAll(page || 1)
    mangas.value = result.data
    meta.value = result.meta
  } catch (e) {
    showError(e)
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
  <Alert v-else-if="alertMessage" :message="alertMessage" :type="alertType"></Alert>
  <template v-else>
    <PaginationContainer
      class="mb-3 d-flex justify-content-center"
      v-bind="meta"
    ></PaginationContainer>
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
    <PaginationContainer
      class="mt-3 d-flex justify-content-center"
      v-bind="meta"
    ></PaginationContainer>
  </template>
</template>
