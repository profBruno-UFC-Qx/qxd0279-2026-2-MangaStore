import { request } from '.'

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
