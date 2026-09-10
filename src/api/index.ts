const BASE_URL = 'http://localhost:1337/api'
const UPLOAD_URL = 'http://localhost:1337'

export const useUpload = (path: string) => `${UPLOAD_URL}${path}`

export const useFetch = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(`${BASE_URL}${input}`, init)
