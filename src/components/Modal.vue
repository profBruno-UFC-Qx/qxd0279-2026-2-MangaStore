<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    content: string
    visible: boolean
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  {
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <div v-if="visible" class="modal-backdrop show"></div>
  <div class="modal" :class="{ 'd-block': visible }" @click.self="emit('close')">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <p>
            {{ content }}
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="emit('close')">
            {{ cancelLabel }}
          </button>
          <button type="button" class="btn btn-primary" @click="emit('confirm')">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
