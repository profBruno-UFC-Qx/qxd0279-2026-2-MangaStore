<script setup lang="ts">
import { computed } from 'vue'
import type { Manga } from '@/types'
const props = defineProps<Manga>()

const coverUrl = computed(() => `http://localhost:1337${props.cover.url}`)
</script>

<template>
  <div class="col">
    <div class="card shadow-sm">
      <img :src="coverUrl" :alt="'Capa do manga' + props.title" :title="props.title" />
      <div class="card-body">
        <p class="card-title">
          {{ props.title }}
        </p>
        <p class="card-text fw-bold">
          Preço: <span class="text-danger">{{ props.price }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
