export const EXTERNAL_PAYMENT_METHODS = [
  'BCA Virtual Account',
  'BRI Virtual Account',
  'BNI Virtual Account',
  'Mandiri Virtual Account',
  'Dana',
  'GoPay',
  'ShopeePay',
]

export const CHECKOUT_PAYMENT_METHODS = [
  'Wallet LocalMart',
  ...EXTERNAL_PAYMENT_METHODS,
]

export const PAYMENT_BADGES = [
  'Wallet LocalMart',
  'BCA VA',
  'BRI VA',
  'BNI VA',
  'Mandiri VA',
  'Dana',
  'GoPay',
  'ShopeePay',
]

export const DEMO_STATUS_FLOW = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
]

const ORDER_STATUS_KEY_PREFIX = 'localmart_order_status_'
const DEMO_ORDER_STATUS_KEY_PREFIX = 'localmart_demo_order_status_'
const PAYMENT_STATUS_RECEIVED = 'Pembayaran Diterima'
const PAYMENT_STATUS_WAITING = 'Menunggu Pembayaran'
const PAYMENT_STATUS_CANCELLED = 'Dibatalkan'

export const paymentMethodToPayload = (method) => {
  return method === 'Wallet LocalMart' ? 'WALLET' : method
}

export const normalizePaymentMethod = (method) => {
  if (!method || method === 'WALLET') return 'Wallet LocalMart'
  return method
}

export const getOrderIdentity = (order = {}) => {
  return order.id || order.order_id || order.orderId || order.order?.id || order.order?.order_id || order.order_code || order.order_number
}

const uniqueKeys = (keys) => {
  return [...new Set(keys.filter(Boolean).map((key) => String(key).trim()).filter(Boolean))]
}

const getOrderCandidateKeys = (order = {}) => {
  if (typeof order !== 'object' || order === null) {
    const rawKey = String(order || '').trim()
    const cleanNumber = rawKey.replace(/\D/g, '')
    return uniqueKeys([
      rawKey,
      cleanNumber,
      cleanNumber ? `ORD-${cleanNumber}` : '',
    ])
  }

  const orderCode = order.order_number || order.order_code || order.orderNo || order.order?.order_number || order.order?.order_code
  const rawId = order.id || order.order_id || order.orderId || order.order?.id || order.order?.order_id
  const cleanOrderCodeNumber = String(orderCode || '').replace(/\D/g, '')
  const cleanIdNumber = String(rawId || '').replace(/\D/g, '')

  return uniqueKeys([
    orderCode,
    cleanOrderCodeNumber,
    cleanOrderCodeNumber ? `ORD-${cleanOrderCodeNumber}` : '',
    rawId,
    cleanIdNumber,
    cleanIdNumber ? `ORD-${cleanIdNumber}` : '',
  ])
}

export const getOrderKey = (order = {}) => {
  return getOrderCandidateKeys(order)[0] || ''
}

export const getDemoOrderStatusKey = (orderId) => {
  return `${DEMO_ORDER_STATUS_KEY_PREFIX}${orderId}`
}

const getOrderStatusStoreKey = (orderKey) => {
  return `${ORDER_STATUS_KEY_PREFIX}${orderKey}`
}

const normalizeOrderStatusValue = (status = 'PENDING') => {
  const normalized = String(status || 'PENDING').trim().toUpperCase()
  const labelMap = {
    'MENUNGGU PEMBAYARAN': 'PENDING',
    DIBATALKAN: 'CANCELLED',
    'PEMBAYARAN DITERIMA': 'PAID',
    'PEMBAYARAN DIVERIFIKASI': 'PAID',
    'DIPROSES PENJUAL': 'PROCESSING',
    DIKEMAS: 'PACKED',
    DIKIRIM: 'SHIPPED',
    'SAMPAI TUJUAN': 'DELIVERED',
    SELESAI: 'COMPLETED',
  }

  return labelMap[normalized] || normalized
}

const readStoredOrderStatus = (order = {}) => {
  if (typeof window === 'undefined') return null

  for (const key of getOrderCandidateKeys(order)) {
    const saved = window.localStorage.getItem(getOrderStatusStoreKey(key))
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          orderStatus: normalizeOrderStatusValue(parsed.orderStatus),
          paymentStatus: parsed.paymentStatus || getPaymentStatusLabel(parsed.orderStatus),
        }
      } catch {
        return {
          orderStatus: normalizeOrderStatusValue(saved),
          paymentStatus: getPaymentStatusLabel(saved),
        }
      }
    }

    const legacyStatus = window.localStorage.getItem(getDemoOrderStatusKey(key))
    if (legacyStatus) {
      return {
        orderStatus: normalizeOrderStatusValue(legacyStatus),
        paymentStatus: getPaymentStatusLabel(legacyStatus),
      }
    }
  }

  return null
}

export const getSavedDemoOrderStatus = (orderId) => {
  return readStoredOrderStatus(orderId)?.orderStatus || ''
}

export const saveDemoOrderStatus = (orderId, status) => {
  saveOrderStatus(orderId, status, getPaymentStatusLabel(status))
}

export const getMergedOrderStatus = (order = {}) => {
  return normalizeOrderStatusValue(order.order_status || order.status || order.orderStatus || 'PENDING')
}

export const getMergedPaymentStatus = (order = {}) => {
  const rawPaymentStatus = order.payment_status || order.paymentStatus
  if (rawPaymentStatus) {
    const normalizedPayment = String(rawPaymentStatus).trim().toUpperCase()
    if (['PAID', 'SUCCESS', 'SETTLED', 'PEMBAYARAN DITERIMA'].includes(normalizedPayment)) return PAYMENT_STATUS_RECEIVED
    if (['CANCELLED', 'CANCELED', 'DIBATALKAN'].includes(normalizedPayment)) return PAYMENT_STATUS_CANCELLED
  }

  return getPaymentStatusLabel(getMergedOrderStatus(order))
}

export const saveOrderStatus = (order = {}, orderStatus = 'PENDING', paymentStatus = '') => {
  if (typeof window === 'undefined') return

  const normalizedOrderStatus = normalizeOrderStatusValue(orderStatus)
  const nextPaymentStatus = paymentStatus || getPaymentStatusLabel(normalizedOrderStatus)
  const payload = JSON.stringify({
    orderStatus: normalizedOrderStatus,
    paymentStatus: nextPaymentStatus,
  })

  getOrderCandidateKeys(order).forEach((key) => {
    window.localStorage.setItem(getOrderStatusStoreKey(key), payload)
    window.localStorage.setItem(getDemoOrderStatusKey(key), normalizedOrderStatus)
  })
}

export const getEffectiveOrderStatus = (order = {}) => {
  return getMergedOrderStatus(order)
}

export const getNextDemoOrderStatus = (status = 'PENDING') => {
  const normalized = String(status || 'PENDING').toUpperCase()
  const currentIndex = DEMO_STATUS_FLOW.indexOf(normalized)

  if (currentIndex < 0) return 'PENDING'
  return DEMO_STATUS_FLOW[Math.min(currentIndex + 1, DEMO_STATUS_FLOW.length - 1)]
}

export const isExternalPaymentMethod = (method) => {
  return EXTERNAL_PAYMENT_METHODS.includes(normalizePaymentMethod(method))
}

export const getPaymentNumber = (method, orderId) => {
  const normalized = normalizePaymentMethod(method)
  const cleanOrderId = String(orderId || '0000').replace(/\D/g, '') || '0000'

  if (normalized.includes('BCA')) return `8808${cleanOrderId}`
  if (normalized.includes('BRI')) return `7777${cleanOrderId}`
  if (normalized.includes('BNI')) return `8881${cleanOrderId}`
  if (normalized.includes('Mandiri')) return `8899${cleanOrderId}`
  return '0812-3456-7890'
}

export const calculateMarketplaceSummary = (items = []) => {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price || 0)
    const quantity = Number(item.quantity || 1)
    const itemSubtotal = Number(item.subtotal || item.total || 0)
    return sum + (itemSubtotal || price * quantity)
  }, 0)

  const shipping = subtotal >= 100000 ? 0 : 10000
  const discount = subtotal >= 500000 ? Math.round(subtotal * 0.05) : 0
  const serviceFee = items.length > 0 ? 2500 : 0
  const total = Math.max(0, subtotal + shipping + serviceFee - discount)

  return {
    subtotal,
    shipping,
    discount,
    serviceFee,
    total,
  }
}

export const getOrderStatusInfo = (status = 'PENDING') => {
  const normalized = String(status || 'PENDING').toUpperCase()
  const statusMap = {
    PENDING: {
      label: 'Menunggu Pembayaran',
      className: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      step: 1,
      actionText: 'Bayar Sekarang',
    },
    PAID: {
      label: 'Pembayaran Diterima',
      className: 'bg-blue-50 text-blue-700 border-blue-100',
      step: 2,
      actionText: 'Pembayaran diterima',
    },
    PROCESSING: {
      label: 'Diproses Penjual',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      step: 3,
      actionText: 'Pesanan sedang diproses',
    },
    PACKED: {
      label: 'Dikemas',
      className: 'bg-purple-50 text-purple-700 border-purple-100',
      step: 4,
      actionText: 'Pesanan sedang dikemas',
    },
    SHIPPED: {
      label: 'Dikirim',
      className: 'bg-violet-50 text-violet-700 border-violet-100',
      step: 5,
      actionText: 'Dalam pengiriman',
    },
    DELIVERED: {
      label: 'Sampai Tujuan',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      step: 6,
      actionText: 'Pesanan Diterima',
    },
    COMPLETED: {
      label: 'Selesai',
      className: 'bg-green-50 text-green-700 border-green-100',
      step: 7,
      actionText: 'Selesai',
    },
    CANCELLED: {
      label: 'Dibatalkan',
      className: 'bg-red-50 text-red-700 border-red-100',
      step: 0,
      actionText: 'Dibatalkan',
    },
  }

  return statusMap[normalized] || {
    label: normalized,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    step: 1,
    actionText: normalized,
  }
}

export const getPaymentStatusLabel = (status = 'PENDING', method = '') => {
  const normalized = normalizeOrderStatusValue(status)
  void method

  if (normalized === 'CANCELLED') return PAYMENT_STATUS_CANCELLED
  if (normalized === 'PENDING') return PAYMENT_STATUS_WAITING
  return PAYMENT_STATUS_RECEIVED
}

export const BANDUNG_SERVICE_AREAS = [
  'cicendo',
  'sukajadi',
  'andir',
  'coblong',
  'bandung wetan',
  'cidadap',
  'astanaanyar',
  'regol',
  'lengkong',
  'batununggal',
  'kiaracondong',
  'buahbatu',
  'antapani',
  'arcamanik',
  'ujungberung',
  'gedebage',
  'bojongloa',
  'bandung kulon',
  'bandung kidul',
]

export const getBandungDeliveryInfo = (address = '') => {
  const normalizedAddress = String(address || '').toLowerCase()
  const inBandung = normalizedAddress.includes('bandung')
  const matchedArea = BANDUNG_SERVICE_AREAS.find((area) => normalizedAddress.includes(area))

  if (!inBandung) {
    return {
      available: false,
      area: '',
      estimate: '',
      message: 'Maaf, saat ini LocalMart hanya melayani area Bandung.',
    }
  }

  if (['cicendo', 'sukajadi', 'andir'].includes(matchedArea)) {
    return { available: true, area: 'Bandung', estimate: '1 hari' }
  }
  if (['coblong', 'bandung wetan', 'cidadap'].includes(matchedArea)) {
    return { available: true, area: 'Bandung', estimate: '1-2 hari' }
  }
  if (['lengkong', 'batununggal', 'kiaracondong', 'buahbatu'].includes(matchedArea)) {
    return { available: true, area: 'Bandung', estimate: '2 hari' }
  }
  if (['antapani', 'arcamanik', 'ujungberung', 'gedebage'].includes(matchedArea)) {
    return { available: true, area: 'Bandung', estimate: '2-3 hari' }
  }

  return { available: true, area: 'Bandung', estimate: '2-5 hari' }
}

export const orderTimelineSteps = [
  'Pesanan Dibuat',
  'Pembayaran',
  'Diproses',
  'Dikemas',
  'Dikirim',
  'Sampai Tujuan',
  'Selesai',
]
