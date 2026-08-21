import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { invalidateCache } from '../lib/queryCache'
import { api, getApiErrorMessage, setupAuthInterceptor } from '../lib/api'

const AuthContext = createContext(null)

export function getStatusFromScore(score) {
  if (score >= 670) return { label: 'Good', color: 'green', description: 'Loan assistance unlocked!' }
  if (score >= 580) return { label: 'Low', color: 'yellow', description: 'Keep improving — almost there.' }
  return { label: 'Critical', color: 'red', description: 'Intensive coaching activated.' }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const formatUserData = (u) => {
    if (!u) return null
    return {
      ...u,
      creditHistory: u.credit_history || u.creditHistory || [],
      attendance: u.attendance || { attended: 0, total: 0 },
    }
  }

  useEffect(() => {
    const interceptorId = setupAuthInterceptor(() => setUser(null))

    return () => api.interceptors.response.eject(interceptorId)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      try {
        const res = await api.get('/me')
        setUser(formatUserData(res.data.user))
      } catch {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password })

      if (!res.data.token) {
        throw new Error('Login succeeded but no token was returned.')
      }

      localStorage.setItem('token', res.data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      const u = formatUserData(res.data.user)
      setUser(u)
      return u
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid credentials'))
    }
  }

  const signup = async (name, email, password) => {
    try {
      const res = await api.post('/register', { name, email, password })

      if (!res.data.token) {
        throw new Error(res.data.message || 'Verification pending. Please wait for admin approval.')
      }

      localStorage.setItem('token', res.data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      const u = formatUserData(res.data.user)
      setUser(u)
      return u
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Registration failed'))
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch {
      // ignore — token may already be invalid
    }
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const addCreditEntry = async (score, note = '') => {
    try {
      const month = new Date().toISOString().slice(0, 7)
      await api.post('/credit-scores', { month, score, note })
      await refreshUser()
    } catch {
      console.error('Failed to add credit score')
    }
  }

  const updateCreditEntry = async (id, score, note = '') => {
    try {
      await api.put(`/credit-scores/${id}`, { score, note })
      await refreshUser()
    } catch {
      console.error('Failed to update credit score')
    }
  }

  const deleteCreditEntry = async (id) => {
    try {
      await api.delete(`/credit-scores/${id}`)
      await refreshUser()
    } catch {
      console.error('Failed to delete credit score')
    }
  }

  const getAllUsers = useCallback(async () => {
    const res = await api.get('/users')
    return (res.data ?? []).map(formatUserData)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/me')
      setUser(formatUserData(res.data.user))
    } catch {
      console.error('Failed to refresh')
    }
  }, [])

  const invalidateQueries = useCallback((key) => {
    invalidateCache(key)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        addCreditEntry,
        updateCreditEntry,
        deleteCreditEntry,
        getAllUsers,
        refreshUser,
        invalidateQueries,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
