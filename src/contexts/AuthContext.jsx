import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { authService } from '../services/authService'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await authService.getMe()
      setUser(response.data?.data || null)
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(checkAuth)
  }, [checkAuth])

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password)

    const token = response.data?.data?.token
    const userData = response.data?.data?.user

    if (token) {
      localStorage.setItem('token', token)
    }

    setUser(userData || null)

    return response.data
  }, [])

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData)
    return response.data
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isSeller: user?.role_id === 2,
    isCustomer: user?.role_id === 3
  }), [user, loading, login, register, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
