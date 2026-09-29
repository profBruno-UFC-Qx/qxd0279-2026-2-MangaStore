<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<template>
  <div class="flex flex-center q-py-xl" role="status" :aria-label="label ?? 'Carregando…'">
    <q-spinner-ball size="3em" color="grey" />
  </div>
</template>
