import api from './api'

export const paymentService = {
  createXenditCheckout: (payload = {}) =>
    api.post('/payments/xendit/checkout', payload),

  payOrderWithXendit: (orderId) =>
    api.post(`/payments/xendit/orders/${orderId}/pay`),
}
