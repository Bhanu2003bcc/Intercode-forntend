import axios from 'axios'
import { AUTH_EXPIRED_EVENT } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('token')
      if (token) {
        // Clear persisted auth data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Fire a custom event so AuthContext can update React state
        // (avoids a hard reload that bypasses React Router guards)
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: data => api.post('/api/v1/auth/login', data),
  register: data => api.post('/api/v1/auth/register', data),
  me: () => api.get('/api/v1/auth/me'),
}

export const interviewApi = {
  list: () => api.get('/api/v1/interviews'),
  create: data => api.post('/api/v1/interviews', data),
  getById: id => api.get(`/api/v1/interviews/${id}`),
  getByRoom: token => api.get(`/api/v1/interviews/room/${token}`),
  updateStatus: (id, status) => api.patch(`/api/v1/interviews/${id}/status?status=${status}`),
  delete: id => api.delete(`/api/v1/interviews/${id}`),
}

export const analyticsApi = {
  summary: () => api.get('/api/v1/analytics/summary'),
  users: () => api.get('/api/v1/analytics/users'),
}

export const executeApi = {
  run: data => api.post('/api/v1/execute', data),
}

export default api
