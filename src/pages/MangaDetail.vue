<script setup lang="ts">
import { computed } from 'vue'
import type { Manga } from '@/types'
const props = defineProps<Manga>()

const coverUrl = computed(() => `http://localhost:1337${props.cover.url}`)
</script>

<template>
  <div class="row">
    <div class="card shadow-sm col-md-4">
      <img :src="coverUrl" :alt="'Capa do manga' + props.title" :title="props.title" />
    </div>
    <div class="col-md-8">
      <div class="card-header">{{ props.title }}</div>
      <div class="card-body"></div>
      <p class="card-title">
        {{ props.summary }}
      </p>
      <p class="card-text fw-bold">
        Preço: <span class="text-danger">{{ props.price }}</span>
      </p>
    </div>
  </div>
</template>
