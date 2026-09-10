<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { MetaInformation } from '@/api/MangaService'

const router = useRouter()
const props = defineProps<MetaInformation>()
</script>

<template>
  <nav class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
    <div class="btn-group me-2" role="group" aria-label="First group">
      <button
        type="button"
        class="btn btn-outline-secondary"
        :disabled="props.pagination.page == 1"
        @click="router.push('/?page=1')"
      >
        Primeira
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        :disabled="props.pagination.page == 1"
        @click="router.push(`/?page=${props.pagination.page - 1}`)"
      >
        Anterior
      </button>
      <button
        v-for="i in props.pagination?.pageCount"
        :key="i"
        type="button"
        class="btn"
        :class="[i == props.pagination.page ? 'btn-secondary' : 'btn-outline-secondary']"
        @click="router.push(`/?page=${i}`)"
      >
        {{ i }}
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        :disabled="props.pagination.page == props.pagination.pageCount"
        @click="router.push(`/?page=${props.pagination.page + 1}`)"
      >
        Próximo
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        :disabled="props.pagination.page == props.pagination.pageCount"
        @click="router.push(`/?page=${props.pagination.pageCount}`)"
      >
        Última
      </button>
    </div>
  </nav>
</template>
