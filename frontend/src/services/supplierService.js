import api from './api'

export const supplierService = {
  async list() {
    const { data } = await api.get('/suppliers')
    return data
  },

  async create(payload) {
    const { data } = await api.post('/suppliers', payload)
    return data
  },

  async purchaseSuggestions() {
    const { data } = await api.get('/purchase-suggestions')
    return data
  },
}
