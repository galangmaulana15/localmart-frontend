import api from './api'

export const orderService = {
  getMyOrders: () => api.get('/orders'),
  checkout: () => api.post('/checkout'),
}