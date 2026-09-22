<script setup lang="ts">
import type { AlertType } from '@/types'

const props = defineProps<{ message: string; type: AlertType }>()
</script>

<template>
  <div class="alert" role="alert" :class="`alert-${props.type}`">
    {{ props.message }}
  </div>
</template>
