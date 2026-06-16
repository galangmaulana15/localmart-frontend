import api from './api'
import {
  getLocalOrders,
  getLocalOrdersForUser,
  saveLocalOrder,
  updateLocalOrderStatus,
} from '../utils/demoStore'
import { calculateMarketplaceSummary, getPaymentStatusLabel, normalizePaymentMethod } from '../utils/marketplace'

const localResponse = (data) => Promise.resolve({ data: { success: true, data } })

const normalizeCheckoutItems = (items = []) => {
  return items.map((item) => {
    const product = item.product || item
    const price = Number(product.price || item.price || 0)
    const quantity = Number(item.quantity || 1)

    return {
      id: item.id,
      cart_item_id: item.id,
      product_id: product.id || item.product_id,
      product_name: product.name || product.product_name || item.product_name || 'Produk LocalMart',
      store_name: product.store_name || item.store_name || 'Toko LocalMart',
      seller_id: product.seller_id || item.seller_id || null,
      image_url: product.image_url || product.product_image || item.image_url || '',
      quantity,
      price,
      subtotal: price * quantity,
    }
  })
}

const createLocalCheckoutOrder = (payload = {}) => {
  const method = normalizePaymentMethod(payload.payment_method || payload.paymentMethod)
  const items = normalizeCheckoutItems(payload.items || [])
  const summary = payload.summary || calculateMarketplaceSummary(items)
  const customer = payload.customer || {}
  const orderStatus = method === 'Wallet LocalMart' ? 'PAID' : 'PENDING'

  return saveLocalOrder({
    customer_key: customer.id || customer.email || 'guest',
    customer_id: customer.id || null,
    customer_name: customer.full_name || customer.name || customer.email || 'Customer LocalMart',
    customer_email: customer.email || '',
    order_status: orderStatus,
    payment_status: getPaymentStatusLabel(orderStatus),
    payment_method: method,
    shipping_address: payload.shipping_address,
    shipping_name: payload.shipping_name,
    shipping_phone: payload.shipping_phone,
    shipping_city: payload.shipping_city,
    shipping_province: payload.shipping_province,
    shipping_postal_code: payload.shipping_postal_code,
    subtotal: summary.subtotal,
    shipping_fee: summary.shipping,
    discount: summary.discount,
    service_fee: summary.serviceFee,
    total_amount: summary.total,
    items,
  })
}

export const orderService = {
  getMyOrders: async (user) => {
    const localOrders = user ? getLocalOrdersForUser(user) : getLocalOrders()
    try {
      const response = await api.get('/orders')
      const remoteOrders = response.data?.data || []
      return { data: { ...response.data, data: [...localOrders, ...remoteOrders] } }
    } catch {
      return localResponse(localOrders)
    }
  },

  getSellerOrders: async () => {
    const localOrders = getLocalOrders()
    try {
      const response = await api.get('/orders/seller/my-orders')
      const remoteOrders = response.data?.data || []
      return { data: { ...response.data, data: [...localOrders, ...remoteOrders] } }
    } catch {
      return localResponse(localOrders)
    }
  },

  getById: async (orderId) => {
    const localOrder = getLocalOrders().find((order) => (
      String(order.id) === String(orderId) || String(order.order_code) === String(orderId)
    ))

    if (localOrder) {
      return localResponse({ order: localOrder, items: localOrder.items || [] })
    }

    return api.get(`/orders/${orderId}`)
  },

  checkout: async (payload = {}) => {
    const localOrder = createLocalCheckoutOrder(payload)
    return localResponse(localOrder)
  },

  payWithWallet: (orderId) => api.post(`/orders/${orderId}/pay-wallet`),

  updateStatus: async (orderId, status) => {
    const localOrder = updateLocalOrderStatus(orderId, status)
    if (localOrder) return localResponse(localOrder)
    return api.put(`/orders/${orderId}/status`, { status })
  },

  sellerUpdateStatus: async (orderId, status) => {
    const localOrder = updateLocalOrderStatus(orderId, status)
    if (localOrder) return localResponse(localOrder)
    return api.put(`/orders/${orderId}/status`, { status })
  },
}
