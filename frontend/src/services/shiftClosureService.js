import api from './api'

export const shiftClosureService = {
  async close(shiftDate, cashCounted) {
    const { data } = await api.post('/shift-closures', {
      shift_date: shiftDate,
      cash_counted: cashCounted,
    })
    return data
  },
}
