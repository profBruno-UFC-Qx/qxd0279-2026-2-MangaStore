<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useUpload } from '@/api'
import type { Manga } from '@/types'
const props = defineProps<Manga>()

const coverUrl = computed(() => useUpload(props.cover.url))
</script>

<template>
  <div class="col">
    <RouterLink
      :to="{ name: 'manga-detail', params: { id: props.id } }"
      class="card shadow-sm text-decoration-none"
    >
      <img :src="coverUrl" :alt="'Capa do manga' + props.title" :title="props.title" />
      <div class="card-body">
        <p class="card-title">
          {{ props.title }}
        </p>
        <p class="card-text fw-bold">
          Preço: <span class="text-danger">{{ props.price }}</span>
        </p>
      </div>
    </RouterLink>
  </div>
</template>

<style scoped>
img:hover {
  filter: grayscale(90%);
}
</style>
