<script setup lang="ts">
import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue'
import { useUpload } from '@/api'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { MangaService, type MangaInput } from '@/api/MangaService'
import { useManga } from '@/composables/useManga'
import Alert from '@/components/Alert.vue'

const $q = useQuasar()
const saveError = ref<string | null>(null)
const { manga, loading, error: loadError, loadManga } = useManga()
const router = useRouter()
const route = useRoute()
const form = ref<MangaInput>({ title: '', summary: '', number: 0, price: 0 })
const cover = ref<File>()
const coverUrl = computed(() => manga.value?.cover.url ?? '')
const saving = ref(false)

const mangaId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!mangaId.value)
const canSubmit = computed(() => isEditing.value || !!cover.value)
const coverPreview = ref('')
const formTitle = computed(() => (isEditing.value ? 'Editar Manga' : 'Adicionar Manga'))
const buttonLabel = computed(() => (isEditing.value ? 'Editar Manga' : 'Criar Manga'))
const errorMessage = computed(() => loadError.value ?? saveError.value)
function dismissError() {
  loadError.value = null
  saveError.value = null
}
const buttonLabelInAction = computed(() =>
  isEditing.value ? 'Editando o Manga' : 'Criando o Manga',
)

onBeforeMount(async () => {
  if (mangaId.value) {
    const data = await loadManga(mangaId.value)
    if (data) {
      const { title, summary, number, price } = data
      form.value = { title, summary, number, price }
    }
  }
})

onBeforeUnmount(() => URL.revokeObjectURL(coverPreview.value))

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  cover.value = target.files?.[0]

  URL.revokeObjectURL(coverPreview.value)
  coverPreview.value = cover.value ? URL.createObjectURL(cover.value) : ''
}

async function submit() {
  if (canSubmit.value) {
    saving.value = true
    saveError.value = null
    try {
      if (mangaId.value) {
        await MangaService.update(mangaId.value, form.value, cover.value)
      } else {
        await MangaService.create(form.value, cover.value!)
      }
      const message = isEditing.value
        ? 'Manga atualizado com sucesso'
        : 'Manga adicionado com sucesso'
      $q.notify({ type: 'positive', message })
      await router.push({ name: 'admin' })
    } catch (e) {
      saveError.value = (e as Error).message
    } finally {
      saving.value = false
    }
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-8">
      <h1 class="h3 mb-3">{{ formTitle }}</h1>
      <Alert v-if="errorMessage" :message="errorMessage" class="q-mb-md" @dismiss="dismissError" />
      <form @submit.prevent="submit">
        <fieldset :disabled="loading || saving">
          <div class="mb-3" v-if="coverPreview || coverUrl">
            <img
              :src="coverPreview || useUpload(coverUrl)"
              :alt="`Capa de ${form.title}`"
              class="img-thumbnail"
            />
          </div>
          <div class="mb-3">
            <label for="formFile" class="form-label">Capa do Manga</label>
            <input
              class="form-control"
              type="file"
              id="formFile"
              accept="image/*"
              @change="handleFileUpload"
            />
          </div>
          <div class="mb-3">
            <label for="title" class="form-label">Título</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              class="form-control"
              autocomplete="off"
              required
            />
          </div>
          <div class="mb-3">
            <label for="summary" class="form-label">Sumário</label>
            <textarea
              id="summary"
              v-model="form.summary"
              class="form-control"
              rows="4"
              required
            ></textarea>
          </div>
          <div class="mb-3">
            <label for="number" class="form-label">Número</label>
            <input
              id="number"
              v-model.number="form.number"
              type="number"
              min="1"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label for="price" class="form-label">Preço</label>
            <input
              id="price"
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              class="form-control"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="!canSubmit">
            {{ saving ? buttonLabelInAction : buttonLabel }}
          </button>
        </fieldset>
      </form>
    </div>
  </div>
</template>
