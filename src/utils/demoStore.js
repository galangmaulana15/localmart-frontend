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

const getUserKey = (user = {}) => String(user?.id || user?.email || 'guest')

export const getUserDisplayName = (user = {}) => {
  return user?.full_name || user?.name || user?.email || 'User LocalMart'
}

const PROFILE_KEY_PREFIX = 'localmart_profile_'

export const getProfileKey = (user = {}) => {
  return `${PROFILE_KEY_PREFIX}${getUserKey(user)}`
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

export const getProductReviewKey = (productId) => `localmart_reviews_${productId}`

export const getReviews = () => {
  return []
}

export const saveReview = (review) => {
  const productId = review?.product_id
  if (!productId) return null
  const key = getProductReviewKey(productId)
  const reviews = readJson(key, [])
  const nextReview = {
    id: `review-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...review,
  }
  writeJson(key, [nextReview, ...reviews])
  return nextReview
}

export const hasReview = ({ order_id, product_id, customer_id }) => {
  const key = getProductReviewKey(product_id)
  return readJson(key, []).some((review) => (
    String(review.order_id) === String(order_id) &&
    String(review.product_id) === String(product_id) &&
    String(review.customer_id || '') === String(customer_id || '')
  ))
}

export const getProductReviews = (productId) => {
  const key = getProductReviewKey(productId)
  return readJson(key, [])
}

const WISHLIST_PREFIX = 'localmart_wishlist_'

export const getWishlist = (user = {}) => {
  return readJson(`${WISHLIST_PREFIX}${getUserKey(user)}`, [])
}

export const addToWishlist = (user = {}, productId) => {
  const key = `${WISHLIST_PREFIX}${getUserKey(user)}`
  const ids = readJson(key, [])
  if (!ids.includes(productId)) {
    writeJson(key, [...ids, productId])
    emitDemoEvent('wishlist-updated')
  }
}

export const removeFromWishlist = (user = {}, productId) => {
  const key = `${WISHLIST_PREFIX}${getUserKey(user)}`
  writeJson(key, readJson(key, []).filter((id) => id !== productId))
  emitDemoEvent('wishlist-updated')
}

export const clearWishlist = (user = {}) => {
  const key = `${WISHLIST_PREFIX}${getUserKey(user)}`
  writeJson(key, [])
  emitDemoEvent('wishlist-updated')
}

export const isInWishlist = (user = {}, productId) => {
  return readJson(`${WISHLIST_PREFIX}${getUserKey(user)}`, []).includes(productId)
}

const CHAT_THREAD_PREFIX = 'localmart_chat_thread_'

export const getChats = () => {
  if (typeof window === 'undefined') return []
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(CHAT_THREAD_PREFIX))
  const all = []
  keys.forEach((key) => {
    try {
      const msgs = JSON.parse(window.localStorage.getItem(key)) || []
      all.push(...msgs)
    } catch {}
  })
  return all
}

export const saveChatMessage = (message) => {
  const threadId = message?.thread_id
  if (!threadId) return null
  const key = `${CHAT_THREAD_PREFIX}${threadId}`
  const messages = readJson(key, [])
  const nextMessage = {
    id: `chat-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...message,
  }
  writeJson(key, [...messages, nextMessage])
  emitDemoEvent('demo-chats-updated')
  return nextMessage
}

export const getChatMessages = (threadId) => {
  return readJson(`${CHAT_THREAD_PREFIX}${threadId}`, [])
}

export const buildChatThreadId = ({ productId = '', orderId = '', customerKey = '', kind = 'seller' } = {}) => {
  const safeCustomerKey = String(customerKey || '').trim() || 'guest'
  const safeProductId = String(productId || '').trim()
  const safeOrderId = String(orderId || '').trim()

  if (safeOrderId) return `order-${kind}-${safeOrderId}`
  if (safeProductId) return `product-${kind}-${safeProductId}`
  return `${kind}-${safeCustomerKey}`
}

export const getChatThreads = (type = '') => {
  if (typeof window === 'undefined') return []
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(CHAT_THREAD_PREFIX))
  const map = new Map()

  keys.forEach((key) => {
    const messages = readJson(key, [])
    messages.forEach((message) => {
      if (type && message.type !== type) return
      const current = map.get(message.thread_id)
      if (!current || new Date(message.created_at) > new Date(current.created_at)) {
        map.set(message.thread_id, message)
      }
    })
  })

  return Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

const WALLET_KEY = 'localmart_wallet_'

export const getWallet = (user = {}) => {
  const key = `${WALLET_KEY}${getUserKey(user)}`
  return readJson(key, { balance: 0, transactions: [] })
}

export const getTopUpMethodBalance = (user = {}, method = '') => {
  const wallet = getWallet(user)
  const normalizedMethod = String(method || '').trim().toLowerCase()

  if (!normalizedMethod) return 0
  if (normalizedMethod === 'wallet localmart') return wallet.balance

  return (wallet.transactions || []).reduce((sum, transaction) => {
    const txMethod = String(transaction.method || '').trim().toLowerCase()
    if (txMethod !== normalizedMethod) return sum
    if (transaction.type === 'topup' || transaction.type === 'income') return sum + Number(transaction.amount || 0)
    if (transaction.type === 'payment') return sum - Number(transaction.amount || 0)
    return sum
  }, 0)
}

export const addWalletTransaction = (user = {}, transaction) => {
  const key = `${WALLET_KEY}${getUserKey(user)}`
  const wallet = readJson(key, { balance: 0, transactions: [] })
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

export const isPaymentMethodVerified = () => true

export const requestVerification = () => {
  return { success: true, message: 'Verification requested' }
}

const ORDERS_PREFIX = 'localmart_orders_'

export const getLocalOrders = (user = {}) => {
  return readJson(`${ORDERS_PREFIX}${getUserKey(user)}`, [])
}

export const getLocalOrdersForUser = (user = {}) => {
  return getLocalOrders(user)
}

export const getAllLocalOrders = () => {
  if (typeof window === 'undefined') return []
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(ORDERS_PREFIX))
  const all = []
  keys.forEach((key) => {
    try {
      const orders = JSON.parse(window.localStorage.getItem(key)) || []
      all.push(...orders)
    } catch {}
  })
  return all
}

export const saveLocalOrder = (user = {}, order) => {
  const key = `${ORDERS_PREFIX}${getUserKey(user)}`
  const orders = readJson(key, [])
  const nextOrder = {
    id: order.id || `local-${Date.now()}`,
    order_code: order.order_code || `ORD-${Date.now()}`,
    created_at: order.created_at || new Date().toISOString(),
    ...order,
  }
  writeJson(key, [nextOrder, ...orders])
  window.dispatchEvent(new Event('orders-updated'))
  return nextOrder
}

export const updateLocalOrderStatus = (orderId, status) => {
  if (typeof window === 'undefined') return null
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(ORDERS_PREFIX))
  let updated = null
  keys.forEach((key) => {
    const orders = readJson(key, [])
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
    if (updated) {
      writeJson(key, nextOrders)
    }
  })
  if (updated) window.dispatchEvent(new Event('orders-updated'))
  return updated
}
