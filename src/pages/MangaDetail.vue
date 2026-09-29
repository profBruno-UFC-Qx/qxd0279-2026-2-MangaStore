<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useUpload } from '@/api'
import { useManga } from '@/composables/useManga'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Alert from '@/components/Alert.vue'

const route = useRoute()
const { manga, loading, error, loadManga } = useManga()

onBeforeMount(async () => loadManga(route.params.id as string))

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    loadManga(to.params.id as string)
  }
})

const coverUrl = computed(() => (manga.value ? useUpload(manga.value.cover.url) : ''))
const isFirst = computed(() => (manga.value ? manga.value.number <= 1 : false))
const price = computed(() =>
  manga.value
    ? manga.value.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '',
)
</script>

<template>
  <LoadingSpinner v-if="loading" label="Carregando detalhes do mangá…" />
  <Alert v-else-if="error" :message="error" @dismiss="error = null" />
  <div v-else-if="manga">
    <q-btn
      flat
      no-caps
      icon="arrow_back"
      label="Voltar para a loja"
      :to="{ name: 'home' }"
      class="q-mb-md"
    />
    <q-card flat bordered class="detail">
      <div class="backdrop" :style="{ backgroundImage: `url(${coverUrl})` }" />
      <q-card-section class="row q-col-gutter-xl relative-position">
        <div class="col-12 col-sm-5 col-md-4">
          <q-img
            :src="coverUrl"
            :alt="`Capa do manga ${manga.title}`"
            :title="manga.title"
            :ratio="2 / 3"
            class="cover rounded-borders shadow-10"
          />
        </div>
        <div class="col-12 col-sm-7 col-md-8 column">
          <q-chip
            color="secondary"
            text-color="white"
            icon="menu_book"
            :label="`Volume ${manga.number}`"
            class="self-start q-ml-none"
          />
          <h1 class="text-h4 text-weight-bold q-my-sm">{{ manga.title }}</h1>
          <div class="text-h5 text-primary text-weight-bold q-mb-lg">{{ price }}</div>
          <div class="text-overline text-grey">Sinopse</div>
          <p class="text-body1 summary">{{ manga.summary }}</p>
          <q-space />
          <q-separator class="q-my-md" />
          <div class="row justify-between">
            <q-btn
              flat
              no-caps
              color="secondary"
              icon="chevron_left"
              label="Anterior"
              :disable="isFirst"
              :to="{ name: 'manga-detail', params: { id: manga.id - 1 } }"
            />
            <q-btn
              flat
              no-caps
              color="secondary"
              icon-right="chevron_right"
              label="Próximo"
              :to="{ name: 'manga-detail', params: { id: manga.id + 1 } }"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.detail {
  position: relative;
  overflow: hidden;
}

.backdrop {
  position: absolute;
  inset: 0 0 auto 0;
  height: 240px;
  background-size: cover;
  background-position: center;
  filter: blur(24px);
  transform: scale(1.2);
  opacity: 0.35;
  mask-image: linear-gradient(to bottom, black, transparent);
}

.cover {
  max-width: 320px;
  margin: 0 auto;
}

.summary {
  line-height: 1.7;
  white-space: pre-line;
}
</style>
