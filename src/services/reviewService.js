import api from './api'

export const reviewService = {
  createReview: (productId, rating, comment) =>
    api.post('/reviews', { product_id: productId, rating, comment }),

  getProductReviews: (productId) =>
    api.get(`/reviews/product/${productId}`),

  getSellerReviews: () =>
    api.get('/reviews/seller'),
}
