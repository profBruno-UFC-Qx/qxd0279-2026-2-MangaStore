<script setup lang="ts">
import { ref, computed, watch, onBeforeMount, onBeforeUnmount } from 'vue'
import { useUpload } from '@/api'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { MangaService, type MangaInput } from '@/api/MangaService'
import { useManga } from '@/composables/useManga'
import Alert from '@/components/Alert.vue'
import { required, minValue } from '@/utils/validation'

const $q = useQuasar()
const saveError = ref<string | null>(null)
const { manga, loading, error: loadError, loadManga } = useManga()
const router = useRouter()
const route = useRoute()
const form = ref<MangaInput>({ title: '', summary: '', number: 0, price: 0 })
const cover = ref<File | null>(null)
const coverUrl = computed(() => manga.value?.cover.url ?? '')
const saving = ref(false)

const mangaId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!mangaId.value)
const busy = computed(() => loading.value || saving.value)
const coverPreview = ref('')
const previewSrc = computed(
  () => coverPreview.value || (coverUrl.value ? useUpload(coverUrl.value) : ''),
)
const coverRules = [(file: File | null) => isEditing.value || !!file || 'Selecione uma capa']
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

watch(cover, (file) => {
  URL.revokeObjectURL(coverPreview.value)
  coverPreview.value = file ? URL.createObjectURL(file) : ''
})

async function submit() {
  saving.value = true
  saveError.value = null
  try {
    if (mangaId.value) {
      await MangaService.update(mangaId.value, form.value, cover.value ?? undefined)
    } else {
      await MangaService.create(form.value, cover.value!)
    }
    const message = isEditing.value
      ? 'Manga atualizado com sucesso'
      : 'Manga adicionado com sucesso'
    $q.notify({ type: 'positive', message, position: 'top-right' })
    await router.push({ name: 'admin' })
  } catch (e) {
    saveError.value = (e as Error).message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="row justify-center">
    <div class="col-12 col-md-10 col-lg-8">
      <h1 class="text-h5 q-mt-none q-mb-md">{{ formTitle }}</h1>
      <Alert v-if="errorMessage" :message="errorMessage" class="q-mb-md" @dismiss="dismissError" />
      <q-card flat bordered>
        <q-form @submit="submit">
          <q-card-section class="row q-col-gutter-lg">
            <div class="col-12 col-sm-4">
              <div class="cover-preview">
                <q-img
                  v-if="previewSrc"
                  :src="previewSrc"
                  :alt="`Capa de ${form.title}`"
                  :ratio="2 / 3"
                  class="rounded-borders shadow-4"
                />
                <div v-else class="cover-placeholder column flex-center text-grey rounded-borders">
                  <q-icon name="image" size="3em" />
                  <span>Nenhuma capa</span>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-8">
              <q-file
                v-model="cover"
                outlined
                clearable
                accept="image/*"
                label="Capa do mangá"
                :hint="isEditing ? 'Deixe vazio para manter a capa atual' : undefined"
                :rules="coverRules"
                :disable="busy"
              >
                <template #prepend><q-icon name="attach_file" /></template>
              </q-file>
              <q-input
                v-model="form.title"
                outlined
                label="Título"
                autocomplete="off"
                :rules="[required]"
                :disable="busy"
              />
              <q-input
                v-model="form.summary"
                outlined
                autogrow
                type="textarea"
                label="Sumário"
                :rules="[required]"
                :disable="busy"
              />
              <div class="row q-col-gutter-md">
                <q-input
                  v-model.number="form.number"
                  outlined
                  type="number"
                  label="Número"
                  class="col-6"
                  :rules="[required, minValue(1)]"
                  :disable="busy"
                />
                <q-input
                  v-model.number="form.price"
                  outlined
                  type="number"
                  step="0.01"
                  prefix="R$"
                  label="Preço"
                  class="col-6"
                  :rules="[required, minValue(0)]"
                  :disable="busy"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" :to="{ name: 'admin' }" :disable="saving" />
            <q-btn
              type="submit"
              color="primary"
              :label="buttonLabel"
              :loading="saving"
              :disable="loading"
            >
              <template #loading>
                <q-spinner class="on-left" />
                {{ buttonLabelInAction }}
              </template>
            </q-btn>
          </q-card-actions>
        </q-form>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.cover-preview {
  max-width: 240px;
  margin: 0 auto;
}

.cover-placeholder {
  aspect-ratio: 2 / 3;
  border: 2px dashed currentColor;
  gap: 8px;
}
</style>
