import { useFetch } from '.'
import { ApiError } from './ApiError'

type User = {
  username: string
  email: string
  role?: Role
}

type Role = {
  id: number
  type: string
}

type AuthResponse = {
  jwt: string
  user: User
  error?: {
    message: string
    status: string
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await useFetch(path, init)
  const result = await response.json()

  if (!response.ok) {
    if (response.status == 400) {
      throw new ApiError(response.status, `${result.error?.message}`)
    }
    throw new ApiError(response.status, `Response status: ${response.status}`)
  }

  return result
}

const me = (jwt: string) =>
  request<User>('/users/me?populate=role', {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })

export const AuthenticationService = {
  login: async (identifier: string, password: string) => {
    const result = await request<AuthResponse>('/auth/local', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    })

    return { ...result, user: await me(result.jwt) }
  },

  me,
}
