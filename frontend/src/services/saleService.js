import api from './api'

export const saleService = {
  async list(date) {
    const { data } = await api.get('/sales', { params: date ? { date } : {} })
    return data
  },

  async create(items, paymentMethod) {
    const { data } = await api.post('/sales', { items, payment_method: paymentMethod })
    return data
  },

  async void(saleId, reason) {
    const { data } = await api.post(`/sales/${saleId}/void`, { reason })
    return data
  },
}
