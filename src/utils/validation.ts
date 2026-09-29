import type { ValidationRule } from 'quasar'

export const required: ValidationRule = (val) =>
  (val !== null && val !== undefined && val !== '') || 'Campo obrigatório'

export const minValue =
  (limit: number): ValidationRule =>
  (val) =>
    Number(val) >= limit || `Deve ser no mínimo ${limit}`
