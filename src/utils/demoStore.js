const PROFILE_KEY_PREFIX = 'localmart_profile_'
const REVIEWS_KEY = 'localmart_reviews'
const CHATS_KEY = 'localmart_chats'
const ORDERS_KEY = 'localmart_orders'

const readJson = (key, fallback) => {
  if (typeof window === 'undefined') return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

const emitDemoEvent = (name) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(name))
}

export const getUserDisplayName = (user = {}) => {
  return user?.full_name || user?.name || user?.email || 'User LocalMart'
}

export const getProfileKey = (user = {}) => {
  return `${PROFILE_KEY_PREFIX}${user?.id || user?.email || 'guest'}`
}

export const getSavedProfile = (user = {}) => {
  return readJson(getProfileKey(user), {})
}

export const saveProfile = (user = {}, profile) => {
  writeJson(getProfileKey(user), profile)
}

export const mergeUserProfile = (user = {}) => {
  const saved = getSavedProfile(user)
  return {
    full_name: saved.full_name || user?.full_name || user?.name || '',
    email: user?.email || saved.email || '',
    phone: saved.phone || user?.phone || user?.phone_number || '',
    address: saved.address || user?.address || '',
    city: saved.city || user?.city || '',
    province: saved.province || user?.province || '',
    postal_code: saved.postal_code || user?.postal_code || user?.zip_code || '',
    avatar: saved.avatar || '',
  }
}

export const getReviews = () => {
  return readJson(REVIEWS_KEY, [])
}

export const saveReview = (review) => {
  const reviews = getReviews()
  const nextReview = {
    id: `review-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...review,
  }
  writeJson(REVIEWS_KEY, [nextReview, ...reviews])
  return nextReview
}

export const hasReview = ({ order_id, product_id, customer_id }) => {
  return getReviews().some((review) => (
    String(review.order_id) === String(order_id) &&
    String(review.product_id) === String(product_id) &&
    String(review.customer_id || '') === String(customer_id || '')
  ))
}

export const getProductReviews = (productId) => {
  return getReviews().filter((review) => String(review.product_id) === String(productId))
}

export const getChats = () => {
  return readJson(CHATS_KEY, [])
}

export const saveChatMessage = (message) => {
  const chats = getChats()
  const nextMessage = {
    id: `chat-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...message,
  }
  writeJson(CHATS_KEY, [...chats, nextMessage])
  emitDemoEvent('demo-chats-updated')
  return nextMessage
}

export const getChatMessages = (threadId) => {
  return getChats().filter((message) => message.thread_id === threadId)
}

export const buildChatThreadId = ({ productId = '', orderId = '', customerKey = '', kind = 'seller' } = {}) => {
  const safeCustomerKey = String(customerKey || '').trim() || 'guest'
  const safeProductId = String(productId || '').trim()
  const safeOrderId = String(orderId || '').trim()

  if (safeOrderId) return `order-${kind}-${safeOrderId}`
  if (safeProductId) return `product-${kind}-${safeProductId}`
  return `${kind}-${safeCustomerKey}`
}

const WISHLIST_KEY = 'localmart_wishlist'
const WALLET_KEY = 'localmart_wallet_'

export const getWallet = (user = {}) => {
  const key = `${WALLET_KEY}${user?.id || user?.email || 'guest'}`
  return readJson(key, { balance: 0, transactions: [] })
}

export const getTopUpMethodBalance = (user = {}, method = '') => {
  const wallet = getWallet(user)
  const normalizedMethod = String(method || '').trim().toLowerCase()

  if (!normalizedMethod) return 0
  if (normalizedMethod === 'wallet localmart') return wallet.balance

  return (wallet.transactions || []).reduce((sum, transaction) => {
    const txMethod = String(transaction.method || '').trim().toLowerCase()
    if (txMethod !== normalizedMethod) {
      return sum
    }
    if (transaction.type === 'topup' || transaction.type === 'income') return sum + Number(transaction.amount || 0)
    if (transaction.type === 'payment') return sum - Number(transaction.amount || 0)
    return sum
  }, 0)
}

export const addWalletTransaction = (user = {}, transaction) => {
  const key = `${WALLET_KEY}${user?.id || user?.email || 'guest'}`
  const wallet = getWallet(user)
  const nextTransaction = {
    id: `tx-${Date.now()}`,
    date: new Date().toISOString(),
    ...transaction,
  }
  const balanceChange = transaction.type === 'topup' || transaction.type === 'income'
    ? Number(transaction.amount || 0)
    : -Number(transaction.amount || 0)
  wallet.balance += balanceChange
  wallet.transactions = [...(wallet.transactions || []), nextTransaction]
  writeJson(key, wallet)
  emitDemoEvent('wallet-updated')
  return nextTransaction
}

export const getPaymentSourceBalance = (user = {}, method = '') => {
  return getTopUpMethodBalance(user, method)
}

export const getSellerWalletIdentity = (order = {}) => {
  const firstItem = Array.isArray(order?.items) ? order.items[0] : null
  return (
    order?.seller_id ||
    order?.seller_email ||
    order?.seller_name ||
    firstItem?.seller_id ||
    firstItem?.seller_email ||
    firstItem?.store_name ||
    order?.store_name ||
    'seller-default'
  )
}

export const creditSellerWallet = (order = {}, amount = 0, method = '') => {
  const sellerIdentity = getSellerWalletIdentity(order)
  return addWalletTransaction({ id: sellerIdentity }, {
    type: 'income',
    method,
    amount,
    description: `Penerimaan pesanan ${order?.order_code || order?.order_number || order?.id || 'LocalMart'}`,
  })
}

export const settleOrderPayment = (user = {}, order = {}, method = '', amount = 0) => {
  const paymentMethod = String(method || '').trim() || 'Wallet LocalMart'
  const totalAmount = Number(amount || 0)
  const availableBalance = getPaymentSourceBalance(user, paymentMethod)

  if (availableBalance < totalAmount) {
    throw new Error(`Saldo ${paymentMethod} tidak mencukupi. Top up dulu.`)
  }

  addWalletTransaction(user, {
    type: 'payment',
    method: paymentMethod,
    amount: totalAmount,
    description: `Pembayaran pesanan ${order?.order_code || order?.order_number || order?.id || 'LocalMart'}`,
  })

  creditSellerWallet(order, totalAmount, paymentMethod)
  emitDemoEvent('wallet-updated')
}

export const isPaymentMethodVerified = () => {
  return true
}

export const requestVerification = () => {
  return { success: true, message: 'Verification requested' }
}

export const getWishlist = () => {
  return readJson(WISHLIST_KEY, [])
}

export const addToWishlist = (productId) => {
  const ids = getWishlist()
  if (!ids.includes(productId)) {
    writeJson(WISHLIST_KEY, [...ids, productId])
  }
}

export const removeFromWishlist = (productId) => {
  writeJson(WISHLIST_KEY, getWishlist().filter((id) => id !== productId))
}

export const clearWishlist = () => {
  writeJson(WISHLIST_KEY, [])
}

export const isInWishlist = (productId) => {
  return getWishlist().includes(productId)
}

export const getChatThreads = (type = '') => {
  const chats = getChats().filter((message) => !type || message.type === type)
  const map = new Map()

  chats.forEach((message) => {
    const current = map.get(message.thread_id)
    if (!current || new Date(message.created_at) > new Date(current.created_at)) {
      map.set(message.thread_id, message)
    }
  })

  return Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export const getLocalOrders = () => {
  return readJson(ORDERS_KEY, [])
}

export const saveLocalOrder = (order) => {
  const orders = getLocalOrders()
  const nextOrder = {
    id: order.id || `local-${Date.now()}`,
    order_code: order.order_code || `ORD-${Date.now()}`,
    created_at: order.created_at || new Date().toISOString(),
    ...order,
  }
  writeJson(ORDERS_KEY, [nextOrder, ...orders])
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('orders-updated'))
  return nextOrder
}

export const updateLocalOrderStatus = (orderId, status) => {
  const orders = getLocalOrders()
  let updated = null
  const nextOrders = orders.map((order) => {
    const matches = String(order.id) === String(orderId) || String(order.order_code) === String(orderId)
    if (!matches) return order
    updated = {
      ...order,
      order_status: status,
      payment_status: status === 'PENDING' ? 'Menunggu Pembayaran' : status === 'CANCELLED' ? 'Dibatalkan' : 'Pembayaran Diterima',
      updated_at: new Date().toISOString(),
    }
    return updated
  })
  writeJson(ORDERS_KEY, nextOrders)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('orders-updated'))
  return updated
}

export const getLocalOrdersForUser = (user = {}) => {
  const key = String(user?.id || user?.email || '')
  return getLocalOrders().filter((order) => {
    const orderCustomerKey = String(order.customer_key || order.customer_id || order.customer_email || '')
    return !key || !orderCustomerKey || orderCustomerKey === key
  })
}
