import api from './api'

export const FALLBACK_IMAGE =
  'https://placehold.co/600x600?text=LocalMart&bg=FF6B35&textColor=white'

export const productService = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()

    if (params.search) queryParams.append('search', params.search)
    if (params.category) queryParams.append('category', params.category)
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.sort) queryParams.append('sort', params.sort)

    const url = `/products${queryParams.toString() ? `?${queryParams}` : ''}`

    return api.get(url)
  },

  getById: (id) => api.get(`/products/${id}`),

  getFeatured: () => api.get('/products?limit=8&sort=popular'),

  getCategories: () => api.get('/categories')
}