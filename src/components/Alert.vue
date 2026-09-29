<script setup lang="ts">
import { computed } from 'vue'
import { AlertType } from '@/types'

const props = withDefaults(defineProps<{ message: string; type?: AlertType }>(), {
  type: AlertType.Danger,
})

const emit = defineEmits<{ (e: 'dismiss'): void }>()

const icons: Record<AlertType, string> = {
  [AlertType.Danger]: 'error',
  [AlertType.Warning]: 'warning',
  [AlertType.Success]: 'check_circle',
}
const icon = computed(() => icons[props.type])
</script>

<template>
  <q-banner
    rounded
    role="alert"
    class="relative-position q-pr-xl"
    :class="`bg-${props.type} text-white`"
  >
    <template #avatar>
      <q-icon :name="icon" />
    </template>
    {{ props.message }}
    <q-btn
      flat
      round
      dense
      size="sm"
      icon="close"
      aria-label="Fechar"
      class="absolute-top-right q-ma-xs"
      @click="emit('dismiss')"
    />
  </q-banner>
</template>
