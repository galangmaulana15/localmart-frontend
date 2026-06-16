import api from './api'

export const storeService = {
  getMyStore: () => api.get('/stores/my-store'),
}
