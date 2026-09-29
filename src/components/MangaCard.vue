<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useUpload } from '@/api'
import type { Manga } from '@/types'
const props = defineProps<Manga>()

const coverUrl = computed(() => useUpload(props.cover.url))
</script>

<template>
  <RouterLink :to="{ name: 'manga-detail', params: { id: props.id } }" class="card-link">
    <q-card>
      <q-img
        :src="coverUrl"
        :alt="`Capa do manga ${props.title}`"
        :title="props.title"
        :ratio="2 / 3"
      >
        <div class="absolute-bottom caption">
          <div class="text-subtitle2 ellipsis-2-lines">{{ props.title }}</div>
          <div class="text-weight-bold text-yellow-6">{{ props.price }}</div>
        </div>
      </q-img>
    </q-card>
  </RouterLink>
</template>

<style scoped>
.card-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.caption {
  padding: 8px 12px;
  transition: opacity 0.2s ease;
}

@media (hover: hover) and (min-width: 600px) {
  .caption {
    opacity: 0;
  }

  .card-link:hover .caption,
  .card-link:focus-visible .caption {
    opacity: 1;
  }
}
</style>
