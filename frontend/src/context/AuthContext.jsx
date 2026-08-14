import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getStoredUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = authService.getToken()
    if (!token) {
      setLoading(false)
      return
    }
    authService
      .me()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await authService.login(email, password)
    setUser(data.user)
    return data.user
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isCajero = user?.role === 'cajero'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isCajero }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
