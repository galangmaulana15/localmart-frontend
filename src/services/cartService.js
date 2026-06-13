import api from './api'

export const cartService = {
  get: () => api.get('/cart'),

  add: (productId, quantity = 1) =>
    api.post('/cart/add', {
      product_id: productId,
      quantity
    }),

  update: (cartItemId, quantity) =>
    api.put(`/cart/${cartItemId}`, {
      quantity
    }),

  remove: (cartItemId) =>
    api.delete(`/cart/${cartItemId}`)
}