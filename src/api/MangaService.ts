import { useFetch } from '.'
import type { Manga } from '@/types'

// A API (Strapi) devolve os recursos dentro de um envelope { data, meta }.
type StrapiResponse<T> = { data: T }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await useFetch(path, init)

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }

  const result: StrapiResponse<T> = await response.json()
  return result.data
}

export const MangaService = {
  findAll: () => request<Manga[]>('/mangas?populate=cover'),

  findById: (id: number | string) => request<Manga>(`/mangas/${id}?populate=cover`),
}
