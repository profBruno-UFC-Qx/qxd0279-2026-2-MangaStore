import type { ValidationRule } from 'quasar'

export const required: ValidationRule = (val) =>
  (val !== null && val !== undefined && val !== '') || 'Campo obrigatório'

export const minValue =
  (limit: number): ValidationRule =>
  (val) =>
    Number(val) >= limit || `Deve ser no mínimo ${limit}`

export const minLength =
  (limit: number): ValidationRule =>
  (val) =>
    (typeof val === 'string' && val.length >= limit) || `Deve ter no mínimo ${limit} caracteres`

export const email: ValidationRule = (val) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'E-mail inválido'
