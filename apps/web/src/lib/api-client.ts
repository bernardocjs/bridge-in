import axios from 'axios'
import { API_BASE_URL } from './constants'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(config => {
  const raw = localStorage.getItem('auth-storage')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch {}
  }
  return config
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      const { pathname } = window.location
      if (
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/register') &&
        !pathname.startsWith('/report/')
      ) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
