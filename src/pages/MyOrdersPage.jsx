import { useCallback, useEffect, useRef, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { orderService } from '../services/orderService'
import { paymentService } from '../services/paymentService'
import { getApiData } from '../utils/formatRupiah'
import { getOrderKey, isExternalPaymentMethod } from '../utils/marketplace'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/useToast'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import OrderCard from '../components/ui/OrderCard'

export default function MyOrdersPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const verifyingRef = useRef(false)

  const verifyXenditOrders = useCallback(async (ordersList) => {
    if (verifyingRef.current) return false
    verifyingRef.current = true
    try {
      const pendingExternal = ordersList.filter((o) => {
        const status = String(o.order_status || '').toUpperCase()
        return status === 'PENDING' && isExternalPaymentMethod(o.payment_method)
      })
      if (pendingExternal.length === 0) return false

      for (const order of pendingExternal) {
        const orderCode = order.order_code || order.order_number
        if (!orderCode) continue
        try {
          const response = await paymentService.verifyPayment(orderCode)
          if (response.data?.data?.paid) return true
        } catch {
          // individual verify failure is ok
        }
      }
      return false
    } finally {
      verifyingRef.current = false
    }
  }, [])

  const fetchOrders = useCallback(async ({ silent = false } = {}) => {
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }

    if (!silent) setLoading(true)
    setError('')
    try {
      const response = await orderService.getMyOrders(user)
      const data = getApiData(response, [])
      setOrders(data)

      const verified = await verifyXenditOrders(data)
      if (verified) {
        toast.success('Pembayaran Xendit terverifikasi!', { title: 'Status pesanan diperbarui.' })
      }
      const refreshed = await orderService.getMyOrders(user)
      setOrders(getApiData(refreshed, []))
    } catch (err) {
      setError(err.response?.data?.message || 'Pesanan gagal dimuat')
      setOrders([])
    } finally {
      if (!silent) setLoading(false)
    }
  }, [user, verifyXenditOrders, toast])

  useEffect(() => {
    const refresh = () => {
      fetchOrders({ silent: true })
    }

    queueMicrotask(() => fetchOrders())
    window.addEventListener('orders-updated', refresh)
    return () => {
      window.removeEventListener('orders-updated', refresh)
    }
  }, [fetchOrders])

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-3">
            <ClipboardList className="h-4 w-4 text-primary" />
            <span className="text-primary text-xs font-semibold">Pesanan Saya</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary">Pesanan Saya</h1>
          <p className="text-gray-500 mt-1">Pantau pembayaran, pengiriman, chat penjual, dan ulasan produk.</p>
        </div>

        {loading ? (
          <div className="h-80 skeleton rounded-3xl"></div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchOrders} />
        ) : orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Belum ada pesanan" description="Pesanan akan muncul setelah checkout berhasil." actionLabel="Mulai Belanja" actionTo="/products" />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={getOrderKey(order) || order.id || order.order_id} order={order} role="customer" user={user} onRefresh={() => fetchOrders({ silent: true })} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
