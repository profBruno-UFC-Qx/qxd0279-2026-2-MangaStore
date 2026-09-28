<script setup lang="ts">
import { AlertType } from '@/types'

const props = withDefaults(defineProps<{ message: string; type?: AlertType }>(), {
  type: AlertType.Danger,
})
</script>

<template>
  <div class="alert" role="alert" :class="`alert-${props.type}`">
    {{ props.message }}
  </div>
</template>
