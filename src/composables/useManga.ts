import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Manga } from '@/types'
import { MangaService } from '@/api/MangaService'
import { ApiError } from '@/api/ApiError'

export function useManga() {
  const router = useRouter()
  const manga = ref<Manga | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadManga(id: string) {
    loading.value = true
    error.value = null
    try {
      const { data } = await MangaService.findById(id)
      manga.value = data
      return data
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        await router.replace({ name: 'not-found' })
      } else {
        error.value = (e as Error).message
      }
    } finally {
      loading.value = false
    }
  }

  return { manga, loading, error, loadManga }
}
