<script setup lang="ts">
defineProps<{
  title: string
  content: string
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <div class="modal" :class="{ 'd-block': visible }">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
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
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
            @click="emit('close')"
          >
            Close
          </button>
          <button type="button" class="btn btn-primary" @click="emit('confirm')">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
