import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, CreditCard, MapPin, PackageCheck, Star, Truck, X, Send } from 'lucide-react'
import { formatRupiah } from '../../utils/formatRupiah'
import { buildChatThreadId, getUserDisplayName, hasReview, saveChatMessage, saveReview } from '../../utils/demoStore'
import {
  getNextDemoOrderStatus,
  getOrderIdentity,
  getOrderStatusInfo,
  getBandungDeliveryInfo,
  getPaymentStatusLabel,
  isExternalPaymentMethod,
  normalizePaymentMethod,
  orderTimelineSteps,
} from '../../utils/marketplace'
import { orderService } from '../../services/orderService'
import { paymentService } from '../../services/paymentService'
import { reviewService } from '../../services/reviewService'
import { useToast } from './useToast'

export default function OrderCard({ order, role = 'customer', user = null, onRefresh }) {
  const toast = useToast()
  const navigate = useNavigate()
  const orderId = getOrderIdentity(order)
  const orderNumber = order.order_code || order.order_number || `ORDER-${orderId}`
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const orderStatus = String(order.order_status || 'PENDING').toUpperCase()
  const paymentStatus = order.payment_status || getPaymentStatusLabel(orderStatus)
  const status = getOrderStatusInfo(orderStatus)
  const total = order.total_amount || order.grand_total || order.total || 0
  const items = Array.isArray(order.items) ? order.items : []
  const paymentMethod = normalizePaymentMethod(order.payment_method)
  const displayPaymentMethod = paymentMethod === 'Wallet LocalMart' ? 'LocalMart Wallet' : paymentMethod
  const createdAt = order.created_at || order.order_date
  const externalPayment = isExternalPaymentMethod(paymentMethod)
  const isPendingExternalPayment = orderStatus === 'PENDING' && externalPayment
  const canSellerUpdate = role === 'seller' && ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED'].includes(orderStatus)
  const sellerActionLabel = {
    PAID: 'Proses Pesanan',
    PROCESSING: 'Kemas Pesanan',
    PACKED: 'Kirim Pesanan',
    SHIPPED: 'Tandai Sampai Tujuan',
  }[orderStatus]
  const deliveryInfo = getBandungDeliveryInfo(order.shipping_address || '')

  const handleAdvanceStatus = async () => {
    setActionLoading(true)
    try {
      const nextStatus = getNextDemoOrderStatus(orderStatus)
      await orderService.sellerUpdateStatus(orderId, nextStatus)
      toast.success(`Status pesanan berubah menjadi ${getOrderStatusInfo(nextStatus).label}`)
      onRefresh?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status pesanan')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    setActionLoading(true)
    try {
      await orderService.sellerUpdateStatus(orderId, 'CANCELLED')
      toast.success('Pesanan berhasil dibatalkan.')
      onRefresh?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan pesanan')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReceived = async () => {
    setActionLoading(true)
    try {
      await orderService.updateStatus(order.id, 'COMPLETED')
      toast.success('Pesanan selesai')
      onRefresh?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengonfirmasi penerimaan')
    } finally {
      setActionLoading(false)
    }
  }

  const handleExternalPayment = async () => {
    setActionLoading(true)
    try {
      const response = await paymentService.payOrderWithXendit(orderId)
      const invoiceUrl = response.data?.data?.invoice_url
      if (!invoiceUrl) {
        throw new Error('Invoice Xendit tidak tersedia')
      }
      window.location.replace(invoiceUrl)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuka pembayaran Xendit')
      setActionLoading(false)
    }
  }

  const openCustomerChat = () => {
    const params = new URLSearchParams({
      type: 'seller',
      thread: buildChatThreadId({ orderId, kind: 'seller' }),
      orderId: String(orderNumber),
      context: `Pesanan ${orderNumber}`,
      message: 'Halo, saya ingin bertanya tentang pesanan ini.',
    })
    navigate(`/customer/chat?${params.toString()}`)
  }

  return (
    <article className="panel rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="font-bold text-secondary">Nomor pesanan: {orderNumber}</h2>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-500">
              {createdAt && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Tanggal pesanan: {new Date(createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              )}
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Metode pembayaran: {displayPaymentMethod}
              </div>
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4" />
                Status pembayaran: {paymentStatus}
              </div>
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4" />
                Status pesanan: {status.label}
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Dana diterima oleh: LocalMart
              </div>
              {order.shipping_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4" />
                  <span>Alamat pengiriman: {order.shipping_address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Kurir: LocalMart Express
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Area pengiriman: Bandung
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Estimasi tiba {deliveryInfo.available ? deliveryInfo.estimate : '2-5 hari'}
              </div>
              {orderStatus !== 'PENDING' && orderStatus !== 'CANCELLED' && (
                <div className="flex items-center gap-2 text-green-600">
                  <PackageCheck className="h-4 w-4" />
                  Pembayaran diterima dan diteruskan ke penjual.
                </div>
              )}
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-gray-400">Total pembayaran</p>
            <p className="text-2xl font-bold text-primary">{formatRupiah(total)}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-7">
            {orderTimelineSteps.map((step, index) => {
              const active = status.step >= index + 1
              return (
                <div key={step} className="flex flex-col gap-2">
                  <div className={`h-2 rounded-full ${active ? 'bg-primary' : 'bg-gray-200'}`}></div>
                  <span className={`text-xs font-medium ${active ? 'text-secondary' : 'text-gray-400'}`}>{step}</span>
                </div>
              )
            })}
          </div>
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-2">
            {items.map((item) => (
              <div key={item.order_item_id || item.product_id || item.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-secondary">{item.product_name || 'Produk LocalMart'}</p>
                  <p className="text-xs text-gray-400">{item.store_name || 'LocalMart Store'}</p>
                </div>
                <span className="text-gray-500">{item.quantity || 1} x {formatRupiah(item.price || 0)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <PackageCheck className="h-4 w-4 text-primary" />
            {orderStatus === 'PENDING' && role === 'seller' ? 'Menunggu pembayaran customer.' : isPendingExternalPayment ? 'Selesaikan pembayaran untuk memproses pesanan.' : status.actionText}
          </div>
          <div className="flex flex-wrap gap-2">
            {role === 'customer' && isPendingExternalPayment && (
              externalPayment ? (
                <button
                  type="button"
                  onClick={handleExternalPayment}
                  disabled={actionLoading}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400"
                >
                  Saldo Tidak Cukup
                </button>
              )
            )}
            {role === 'seller' && orderStatus === 'PENDING' && (
              <button
                type="button"
                disabled
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400"
              >
                Proses Pesanan
              </button>
            )}
            {role === 'customer' && orderStatus === 'PENDING' && (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={actionLoading}
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                {actionLoading ? 'Memproses...' : 'Batalkan Pesanan'}
              </button>
            )}
            {role === 'customer' && orderStatus === 'DELIVERED' && (
              <button
                type="button"
                onClick={handleReceived}
                disabled={actionLoading}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'Memproses...' : 'Pesanan Diterima'}
              </button>
            )}
            {role === 'customer' && orderStatus === 'COMPLETED' && (
              <button type="button" onClick={() => setReviewModalOpen(true)} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm">
                Beri Ulasan
              </button>
            )}
            {canSellerUpdate && (
              <button
                type="button"
                onClick={handleAdvanceStatus}
                disabled={actionLoading}
                className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                {actionLoading ? 'Memproses...' : sellerActionLabel}
              </button>
            )}
            {role === 'customer' && (
              <button type="button" onClick={openCustomerChat} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-secondary hover:bg-gray-50">
                Chat Penjual
              </button>
            )}
            {role === 'seller' && (
              <button type="button" onClick={() => setChatModalOpen(true)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-secondary hover:bg-gray-50">
                Chat Customer
              </button>
            )}
            <details className="relative">
              <summary className="list-none rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-secondary hover:bg-gray-50 cursor-pointer">
                Detail Pesanan
              </summary>
              <div className="absolute right-0 z-10 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-xl">
                <p className="font-semibold text-secondary mb-2">Detail Pesanan</p>
                <p>Status: {status.label}</p>
                <p>Status pembayaran: {paymentStatus}</p>
                <p>Metode: {displayPaymentMethod}</p>
                <p>Estimasi: {deliveryInfo.available ? deliveryInfo.estimate : '2-5 hari'}</p>
                <p>Total item: {items.length}</p>
              </div>
            </details>
          </div>
        </div>

      </div>

      {reviewModalOpen && (
        <ReviewModal order={order} user={user} onClose={() => setReviewModalOpen(false)} />
      )}
      {chatModalOpen && (
        <QuickChatModal orderId={orderId} role={role} user={user} onClose={() => setChatModalOpen(false)} />
      )}
    </article>
  )
}

function ReviewModal({ order, user, onClose }) {
  const toast = useToast()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const submitReview = async (event) => {
    event.preventDefault()
    if (!comment.trim()) return

    let reviewItems
    try {
      const response = await orderService.getById(order.id)
      reviewItems = response.data?.data?.items
    } catch {
      reviewItems = null
    }

    if (!reviewItems || reviewItems.length === 0) {
      reviewItems = [{ product_id: order.product_id, product_name: order.product_name || 'Produk LocalMart' }]
    }

    let savedCount = 0
    reviewItems.forEach((item) => {
      const reviewData = {
        order_id: getOrderIdentity(order),
        product_id: item.product_id || item.id,
        product_name: item.product_name || 'Produk LocalMart',
        customer_id: user?.id || null,
        customer_name: getUserDisplayName(user),
        seller_id: item.seller_id || null,
        rating,
        comment: comment.trim(),
      }

      if (hasReview(reviewData)) {
        toast.error('Ulasan untuk produk ini sudah pernah dikirim.')
        return
      }

      saveReview(reviewData)
      savedCount += 1

      if (reviewData.product_id) {
        reviewService.createReview(reviewData.product_id, rating, comment.trim())
          .catch(() => {})
      }
    })
    if (savedCount > 0) {
      toast.success('Ulasan berhasil dikirim')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
      <form onSubmit={submitReview} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-zoom-in">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-secondary">Beri Ulasan</h3>
            <p className="text-sm text-gray-500">Bagikan pengalaman belanja kamu untuk membantu pembeli lain.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mb-4 flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <button key={index} type="button" onClick={() => setRating(index + 1)} className="text-accent">
              <Star className={`h-7 w-7 ${index < rating ? 'fill-accent' : 'text-gray-200'}`} />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={5} className="w-full rounded-2xl border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-primary" placeholder="Tulis pengalaman belanja kamu..." />
        <button className="mt-4 w-full gradient-bg rounded-xl py-3 font-semibold text-white">Kirim Ulasan</button>
      </form>
    </div>
  )
}

function QuickChatModal({ orderId, role, user, onClose }) {
  const toast = useToast()
  const [text, setText] = useState('')
  const customerKey = user?.id || user?.email || 'guest'

  const sendChat = (event) => {
    event.preventDefault()
    if (!text.trim()) return

    saveChatMessage({
      thread_id: buildChatThreadId({ orderId, customerKey, kind: 'seller' }),
      type: 'seller',
      sender_role: role,
      sender_name: getUserDisplayName(user),
      customer_key: customerKey,
      customer_name: role === 'customer' ? getUserDisplayName(user) : 'Customer LocalMart',
      message: text.trim(),
    })
    toast.success(role === 'customer' ? 'Pesan berhasil dikirim.' : 'Balasan berhasil dikirim.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
      <form onSubmit={sendChat} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-zoom-in">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-secondary">Kirim Chat</h3>
            <p className="text-sm text-gray-500">Kirim pesan terkait pesanan ini.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} className="w-full rounded-2xl border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-primary" placeholder="Tulis pesan..." />
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white">
          <Send className="h-4 w-4" />
          Kirim
        </button>
      </form>
    </div>
  )
}
