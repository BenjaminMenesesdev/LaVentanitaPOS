import api from './api'

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('laventanita_token', data.token)
    localStorage.setItem('laventanita_user', JSON.stringify(data.user))
    return data
  },

  async logout() {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('laventanita_token')
      localStorage.removeItem('laventanita_user')
    }
  },

  async me() {
    const { data } = await api.get('/me')
    return data
  },

  async register(payload) {
    const { data } = await api.post('/register', payload)
    return data
  },

  getStoredUser() {
    const raw = localStorage.getItem('laventanita_user')
    return raw ? JSON.parse(raw) : null
  },

  getToken() {
    return localStorage.getItem('laventanita_token')
  },
}
