import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Star, Store, WalletCards } from 'lucide-react'
import { productService } from '../../services/productService'
import { orderService } from '../../services/orderService'
import { formatRupiah, getApiData } from '../../utils/formatRupiah'
import { getChatThreads, getReviews } from '../../utils/demoStore'
import { getOrderStatusInfo } from '../../utils/marketplace'

const paidRevenueStatuses = ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED']

export default function SellerDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    const [productResult, orderResult] = await Promise.allSettled([
      productService.getAll({ limit: 100 }),
      orderService.getSellerOrders(),
    ])

    setProducts(productResult.status === 'fulfilled' ? getApiData(productResult.value, []) : [])
    setOrders(orderResult.status === 'fulfilled' ? getApiData(orderResult.value, []) : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    let timerId = null
    let alive = true

    const refresh = () => {
      if (!alive) return
      loadDashboard()
    }

    queueMicrotask(refresh)
    window.addEventListener('orders-updated', refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    timerId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }, 10000)

    return () => {
      alive = false
      window.removeEventListener('orders-updated', refresh)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
      if (timerId) {
        clearInterval(timerId)
      }
    }
  }, [loadDashboard])

  const summary = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const monthKey = new Date().toISOString().slice(0, 7)
    const paidOrders = orders.filter((order) => paidRevenueStatuses.includes(String(order.order_status || '').toUpperCase()))
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount || order.total || 0), 0)
    const todayRevenue = paidOrders
      .filter((order) => String(order.created_at || '').slice(0, 10) === todayKey)
      .reduce((sum, order) => sum + Number(order.total_amount || order.total || 0), 0)
    const monthRevenue = paidOrders
      .filter((order) => String(order.created_at || '').slice(0, 7) === monthKey)
      .reduce((sum, order) => sum + Number(order.total_amount || order.total || 0), 0)

    const count = (status) => orders.filter((order) => String(order.order_status || '').toUpperCase() === status).length

    return {
      products: products.length,
      newOrders: orders.length,
      paid: count('PAID'),
      processing: count('PROCESSING'),
      packed: count('PACKED'),
      shipped: count('SHIPPED'),
      delivered: count('DELIVERED'),
      completed: count('COMPLETED'),
      todayRevenue,
      monthRevenue,
      revenue,
    }
  }, [orders, products])

  const latestReviews = getReviews().slice(0, 4)
  const latestChats = getChatThreads('seller').slice(0, 4)

  const cards = [
    { label: 'Total Produk', value: summary.products, icon: Package },
    { label: 'Pesanan Baru', value: summary.newOrders, icon: ShoppingBag },
    { label: 'Perlu Diproses', value: summary.paid, icon: ShoppingBag },
    { label: 'Perlu Dikemas', value: summary.processing, icon: Package },
    { label: 'Sedang Dikirim', value: summary.shipped, icon: Store },
    { label: 'Sampai Tujuan', value: summary.delivered, icon: Store },
    { label: 'Pesanan Selesai', value: summary.completed, icon: Star },
    { label: 'Total Pendapatan', value: formatRupiah(summary.revenue), icon: WalletCards },
  ]

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-primary font-semibold">Seller Center</p>
            <h1 className="text-3xl font-bold text-secondary">Dashboard Seller</h1>
            <p className="text-gray-500">Pantau produk, pesanan, pendapatan, ulasan, dan chat customer.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/seller/products" className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-secondary hover:border-primary hover:text-primary">Kelola Produk</Link>
            <Link to="/seller/orders" className="gradient-bg rounded-xl px-4 py-2.5 text-sm font-semibold text-white">Pesanan Masuk</Link>
          </div>
        </div>

        {loading ? (
          <div className="h-80 skeleton rounded-3xl"></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {cards.map((card) => (
                <div key={card.label} className="panel rounded-2xl p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-secondary">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <RevenueCard label="Pendapatan Hari Ini" value={summary.todayRevenue} />
              <RevenueCard label="Pendapatan Bulan Ini" value={summary.monthRevenue} />
              <RevenueCard label="Total Pendapatan" value={summary.revenue} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="panel rounded-3xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-secondary">Pesanan Terbaru</h2>
                  <Link to="/seller/orders" className="text-sm font-semibold text-primary">Lihat semua</Link>
                </div>
                {orders.length === 0 ? (
                  <p className="py-10 text-center text-gray-500">Belum ada pesanan masuk.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => {
                      const status = getOrderStatusInfo(order.order_status)
                      return (
                        <div key={order.id || order.order_code} className="rounded-2xl border border-gray-100 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-secondary">{order.order_code || `ORDER-${order.id}`}</p>
                              <p className="text-sm text-gray-500">{order.customer_name || 'Customer LocalMart'}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                          </div>
                          <p className="mt-2 font-bold text-primary">{formatRupiah(order.total_amount || order.total || 0)}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              <section className="space-y-6">
                <PanelList title="Ulasan Terbaru" empty="Belum ada ulasan." items={latestReviews} render={(review) => (
                  <div>
                    <p className="font-semibold text-secondary">{review.product_name || 'Produk LocalMart'}</p>
                    <p className="text-sm text-gray-500">{review.customer_name || 'Customer'} - {review.rating}/5</p>
                    <p className="line-clamp-2 text-sm text-gray-500">{review.comment}</p>
                  </div>
                )} />
                <PanelList title="Chat Customer Terbaru" empty="Belum ada chat customer." items={latestChats} render={(chat) => (
                  <div>
                    <p className="font-semibold text-secondary">{chat.customer_name || 'Customer LocalMart'}</p>
                    <p className="text-sm text-gray-500">{chat.context_title || chat.product_name || 'Percakapan customer'}</p>
                    <p className="line-clamp-2 text-sm text-gray-500">{chat.message}</p>
                  </div>
                )} />
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function RevenueCard({ label, value }) {
  return (
    <div className="panel rounded-2xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-secondary">{formatRupiah(value)}</p>
    </div>
  )
}

function PanelList({ title, empty, items, render }) {
  return (
    <section className="panel rounded-3xl p-6">
      <h2 className="mb-4 text-xl font-bold text-secondary">{title}</h2>
      {items.length === 0 ? (
        <p className="py-8 text-center text-gray-500">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id || item.thread_id} className="rounded-2xl border border-gray-100 p-4">
              {render(item)}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
