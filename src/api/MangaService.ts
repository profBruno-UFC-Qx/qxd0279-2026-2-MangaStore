import { request } from '.'
import type { Manga } from '@/types'

export type MetaInformation = {
  pagination: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}
type StrapiResponse<T> = { data: T; meta: MetaInformation }

export const MangaService = {
  findAll: (page: number | string = 1) =>
    request<StrapiResponse<Manga[]>>(
      `/mangas?populate=cover&pagination[page]=${page}&pagination[pageSize]=24`,
    ),

  findById: (id: number | string) => request<StrapiResponse<Manga>>(`/mangas/${id}?populate=cover`),

  deleteById: (id: number | string) =>
    request<StrapiResponse<Manga>>(`/mangas/${id}`, {
      method: 'DELETE',
      auth: true,
    }),
}
