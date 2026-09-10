import { useFetch } from '.'
import type { Manga } from '@/types'
import { router } from '@/router'

export type MetaInformation = {
  pagination: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}
type StrapiResponse<T> = { data: T; meta: MetaInformation }

async function request<T>(path: string, init?: RequestInit): Promise<StrapiResponse<T>> {
  const response = await useFetch(path, init)

  if (!response.ok) {
    if (response.status === 404) {
      await router.replace('/notFound')
    }
    throw new Error(`Response status: ${response.status}`)
  }

  return response.json()
}

export const MangaService = {
  findAll: (page: number | string = 1) =>
    request<Manga[]>(`/mangas?populate=cover&pagination[page]=${page}&pagination[pageSize]=24`),

  findById: (id: number | string) => request<Manga>(`/mangas/${id}?populate=cover`),
}
