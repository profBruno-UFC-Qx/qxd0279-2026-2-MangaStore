<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<template>
  <div class="d-flex justify-content-center py-5">
    <div class="spinner-grow text-secondary" role="status">
      <span class="visually-hidden">{{ label ?? 'Carregando…' }}</span>
    </div>
  </div>
</template>
