import api from './api'

export const productService = {
  async list() {
    const { data } = await api.get('/products')
    return data
  },

  async findByBarcode(barcode) {
    const { data } = await api.get(`/products/barcode/${encodeURIComponent(barcode)}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post('/products', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.put(`/products/${id}`, payload)
    return data
  },

  async getRecipe(productId) {
    const { data } = await api.get(`/products/${productId}/recipe`)
    return data
  },

  async saveRecipe(productId, items) {
    const { data } = await api.post(`/products/${productId}/recipe`, { items })
    return data
  },
}
