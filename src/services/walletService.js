import api from './api'

export const walletService = {
  get: () => api.get('/wallet'),
  topup: (amount) => api.post('/wallet/topup', { amount }),
  getTransactions: () => api.get('/wallet/transactions'),
}