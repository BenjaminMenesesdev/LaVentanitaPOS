import api from './api'

export const dashboardService = {
  async today() {
    const { data } = await api.get('/dashboard/today')
    return data
  },

  async productRanking() {
    const { data } = await api.get('/dashboard/product-ranking')
    return data
  },
}
