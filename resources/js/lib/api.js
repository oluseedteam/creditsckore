import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  if (error?.response?.data) {
    const data = error.response.data

    if (data.errors) {
      const firstError = Object.values(data.errors).flat()[0]
      if (firstError) return firstError
    }

    if (data.message && data.message !== 'The given data was invalid.') {
      return data.message
    }
  }

  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    const target = api.defaults.baseURL || '/api'
    return `Cannot connect to server at ${target}. Please make sure your Laravel backend is running (e.g. php artisan serve).`
  }

  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Connection timed out. Please check your network connection.'
  }

  if (error?.message) {
    return error.message
  }

  return fallback
}

export function setupAuthInterceptor(onUnauthorized) {
  return api.interceptors.response.use(
    (response) => response,
    (error) => {
      const isAuthRoute = /\/(login|register)$/.test(error.config?.url || '')

      if (error.response?.status === 401 && !isAuthRoute) {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        onUnauthorized?.()
      }

      return Promise.reject(error)
    }
  )
}
