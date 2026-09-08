<script setup lang="ts">
const props = defineProps<{ message: string }>()
</script>

<template>
  <div class="alert alert-danger" role="alert">
    {{ props.message }}
  </div>
</template>
