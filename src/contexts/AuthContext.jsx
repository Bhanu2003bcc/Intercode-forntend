import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

/**
 * A custom event fired by the Axios 401 interceptor so React can update
 * its in-memory user state without a full page reload.
 */
export const AUTH_EXPIRED_EVENT = 'auth:expired'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // True while we are still reading the stored session on first mount.
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)

  // On mount, rehydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (stored && token) {
        setUser(JSON.parse(stored))
      }
    } catch {
      // Corrupt data — clear it
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setInitializing(false)
    }
  }, [])

  // Listen for forced logout triggered by the 401 interceptor
  const handleAuthExpired = useCallback(() => {
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
  }, [handleAuthExpired])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      const { token, user: userData } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.register(data)
      const { token, user: userData } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Called by OAuth2Callback after it stores token/user in localStorage
  const rehydrate = () => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    } catch { /* ignore */ }
  }

  const hasRole = (...roles) => roles.includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, initializing, login, register, logout, hasRole, rehydrate }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
