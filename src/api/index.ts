import { ApiError } from './ApiError'

const BASE_URL = 'http://localhost:1337/api'
const UPLOAD_URL = 'http://localhost:1337'

export const TOKEN_KEY = 'token'

export const useUpload = (path: string) => `${UPLOAD_URL}${path}`

type RequestOptions = RequestInit & { auth?: boolean }

export async function request<T>(
  path: string,
  { auth = false, ...init }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  const token = localStorage.getItem(TOKEN_KEY)

  if (auth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const fallback = `Response status: ${response.status}`
    const message = response.status === 400 ? (body?.error?.message ?? fallback) : fallback
    throw new ApiError(response.status, message)
  }

  return body
}
