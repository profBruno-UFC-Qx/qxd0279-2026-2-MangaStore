export type Manga = {
  id: number
  cover: {
    url: string
  }
  number: number
  price: number
  summary: string
  title: string
}

export type Role = {
  id: number
  type: string
}

export type User = {
  username: string
  email: string
  role?: Role
}

export enum AlertType {
  Danger = 'danger',
  Warning = 'warning',
  Success = 'success',
}
