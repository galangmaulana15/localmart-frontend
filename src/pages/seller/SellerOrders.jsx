import { useCallback, useEffect, useState } from 'react'
import { orderService } from '../../services/orderService'
import { getApiData } from '../../utils/formatRupiah'
import OrderCard from '../../components/ui/OrderCard'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useAuth } from '../../hooks/useAuth'
import { getOrderKey } from '../../utils/marketplace'
import { ReceiptText } from 'lucide-react'

export default function SellerOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await orderService.getSellerOrders()
      setOrders(getApiData(response, []))
    } catch (err) {
      setError(err.response?.data?.message || 'Pesanan seller belum tersedia')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let timerId = null
    let alive = true

    const refresh = () => {
      if (!alive) return
      fetchOrders()
    }

    queueMicrotask(refresh)
    window.addEventListener('orders-updated', refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    timerId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }, 8000)

    return () => {
      alive = false
      window.removeEventListener('orders-updated', refresh)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
      if (timerId) {
        clearInterval(timerId)
      }
    }
  }, [fetchOrders])

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-8">
          <p className="text-primary font-semibold">Seller Center</p>
          <h1 className="text-3xl font-bold text-secondary">Pesanan Masuk</h1>
          <p className="text-gray-500">Seller dapat mengemas, mengirim, dan menandai pesanan sampai tujuan setelah pembayaran diterima.</p>
        </div>

        {loading ? (
          <div className="h-80 skeleton rounded-3xl"></div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchOrders} />
        ) : orders.length === 0 ? (
          <EmptyState icon={ReceiptText} title="Belum ada pesanan masuk" description="Pesanan customer akan tampil di sini." />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={getOrderKey(order) || order.id || order.order_id} order={order} role="seller" user={user} onRefresh={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
