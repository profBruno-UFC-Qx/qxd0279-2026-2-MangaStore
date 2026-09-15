import { useFetch } from '.'

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
      throw new Error(`${result.error?.message}`)
    }
    throw new Error(`Response status: ${response.status}`)
  }

  return result
}

export const AuthenticationService = {
  login: async (identifier: string, password: string) => {
    const result = await request<AuthResponse>('/auth/local', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    })

    const roleResult = await request<User>('/users/me?populate=role', {
      headers: {
        Authorization: `Bearer ${result.jwt}`,
      },
    })

    return { ...result, user: { ...roleResult } }
  },
}
