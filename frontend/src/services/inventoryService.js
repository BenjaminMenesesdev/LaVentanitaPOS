import api from './api'

export const inventoryService = {
  async list() {
    const { data } = await api.get('/stock')
    return data
  },

  async alerts() {
    const { data } = await api.get('/stock/alerts')
    return data
  },

  async adjust(payload) {
    const { data } = await api.post('/stock/adjust', payload)
    return data
  },

  async convertUnits(payload) {
    const { data } = await api.post('/units/convert', payload)
    return data
  },
}
