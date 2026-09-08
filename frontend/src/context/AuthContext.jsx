import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('kc_token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      if (!token) { setLoading(false); return }

      // Check for demo user first (works offline)
      const demoUser = localStorage.getItem('kc_demo_user')
      if (token.startsWith('demo-token-') && demoUser) {
        setUser(JSON.parse(demoUser))
        setLoading(false)
        return
      }

      // Real backend auth with 4s timeout
      try {
        const result = await api.get('/auth/me')
        setUser(result.data)
      } catch {
        localStorage.removeItem('kc_token')
        localStorage.removeItem('kc_demo_user')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [token])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('kc_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kc_token')
    localStorage.removeItem('kc_demo_user')
    setToken(null)
    setUser(null)
    navigate('/')
  }, [navigate])

  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }))
  }, [])

  const isFarmer   = user?.role === 'FARMER' || user?.role === 'FPO'
  const isFpo      = user?.role === 'FPO'
  const isBuyer    = user?.role === 'CONSUMER' || user?.role === 'BULK_BUYER'
  const isBulkBuyer = user?.role === 'BULK_BUYER'
  const isAdmin    = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, updateUser,
      isFarmer, isFpo, isBuyer, isBulkBuyer, isAdmin,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}