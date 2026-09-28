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

export type MangaInput = Omit<Manga, 'id' | 'cover'>

function toFormData(data: MangaInput, cover?: File) {
  const formData = new FormData()
  formData.append('data', JSON.stringify(data))
  if (cover) formData.append('files.cover', cover)
  return formData
}

export const MangaService = {
  findAll: (page: number | string = 1) =>
    request<StrapiResponse<Manga[]>>(
      `/mangas?populate=cover&pagination[page]=${page}&pagination[pageSize]=24`,
    ),

  findById: (id: number | string) => request<StrapiResponse<Manga>>(`/mangas/${id}?populate=cover`),

  create: (data: MangaInput, cover: File) =>
    request<StrapiResponse<Manga>>('/mangas', {
      method: 'POST',
      body: toFormData(data, cover),
      auth: true,
    }),

  update: (id: number | string, data: MangaInput, cover?: File) =>
    request<StrapiResponse<Manga>>(`/mangas/${id}`, {
      method: 'PUT',
      body: toFormData(data, cover),
      auth: true,
    }),

  deleteById: (id: number | string) =>
    request<StrapiResponse<Manga>>(`/mangas/${id}`, {
      method: 'DELETE',
      auth: true,
    }),
}
