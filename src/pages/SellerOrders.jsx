import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/useToast'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Search, X, Store, Package, MapPin, Phone, User,
  ChevronLeft, ChevronRight, Eye, Clock, CheckCircle, XCircle, Truck
} from 'lucide-react'
import { formatRupiah } from '../utils/formatRupiah'
import EmptyState from '../components/ui/EmptyState'

const allOrders = [
  { id: '#INV-001', customer: 'Sarah Wijaya', product: 'Kemeja Flanel Premium', amount: 185000, status: 'diproses', date: '2025-06-15', qty: 2, phone: '081234567890', address: 'Jl. Merdeka No. 45, Bandung' },
  { id: '#INV-002', customer: 'Budi Santoso', product: 'Tas Ransel Wanita', amount: 250000, status: 'dikirim', date: '2025-06-14', qty: 1, phone: '081234567891', address: 'Jl. Asia Afrika No. 10, Bandung' },
  { id: '#INV-003', customer: 'Ayu Lestari', product: 'Sepatu Sneakers Casual', amount: 320000, status: 'selesai', date: '2025-06-13', qty: 1, phone: '081234567892', address: 'Jl. Setiabudi No. 22, Bandung' },
  { id: '#INV-004', customer: 'Rizki Pratama', product: 'Jam Tangan Analog', amount: 450000, status: 'diproses', date: '2025-06-13', qty: 1, phone: '081234567893', address: 'Jl. Dago No. 55, Bandung' },
  { id: '#INV-005', customer: 'Dian Permata', product: 'Parfum Pria 50ml', amount: 175000, status: 'selesai', date: '2025-06-12', qty: 3, phone: '081234567894', address: 'Jl. Buah Batu No. 88, Bandung' },
  { id: '#INV-006', customer: 'Andi Wijaya', product: 'Kacamata Hitam', amount: 150000, status: 'dibatalkan', date: '2025-06-11', qty: 1, phone: '081234567895', address: 'Jl. Cihampelas No. 12, Bandung' },
  { id: '#INV-007', customer: 'Siti Nurhaliza', product: 'Gelang Tangan Emas', amount: 890000, status: 'diproses', date: '2025-06-10', qty: 1, phone: '081234567896', address: 'Jl. Riau No. 33, Bandung' },
  { id: '#INV-008', customer: 'Rudi Hermawan', product: 'Tas Laptop', amount: 375000, status: 'dikirim', date: '2025-06-09', qty: 2, phone: '081234567897', address: 'Jl. Sukajadi No. 77, Bandung' },
]

const statuses = ['semua', 'diproses', 'dikirim', 'selesai', 'dibatalkan']
const statusStyles = {
  diproses: 'bg-primary/10 text-primary',
  dikirim: 'bg-accent/10 text-accent',
  selesai: 'bg-green-100 text-green-700',
  dibatalkan: 'bg-red-100 text-red-600',
}
const statusIcons = {
  diproses: Clock, dikirim: Truck, selesai: CheckCircle, dibatalkan: XCircle,
}

export default function SellerOrders() {
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const filtered = allOrders.filter(o => {
    const matchStatus = activeTab === 'semua' || o.status === activeTab
    const matchSearch = !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const updateOrderStatus = (orderId, newStatus) => {
    toast.success(`Pesanan ${orderId} diubah ke "${newStatus}"`)
  }

  if (!user || user.role_id !== 2) {
    return (
      <div className="bg-light min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center panel rounded-3xl p-12 max-w-md">
          <Store className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-2">Akses Terbatas</h2>
          <p className="text-gray-500 mb-6">Halaman ini hanya untuk Seller.</p>
          <Link to="/register" className="gradient-bg text-white px-8 py-3 rounded-xl font-semibold inline-block hover:shadow-xl transition-all">Daftar Seller</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-3">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-semibold">Seller Orders</span>
            </div>
            <h1 className="text-3xl font-bold text-secondary">Pesanan</h1>
            <p className="text-gray-500 mt-1">{allOrders.length} total pesanan</p>
          </div>
          <label className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-primary transition-all max-w-xs shadow-sm">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }} placeholder="Cari invoice / pelanggan..." className="bg-transparent outline-none text-sm w-full" />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X className="h-4 w-4 text-gray-400" /></button>}
          </label>
        </div>

        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setActiveTab(s); setPage(1) }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all capitalize ${activeTab === s ? 'gradient-bg text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{s}</button>
          ))}
        </div>

        {paginated.length === 0 ? (
          <EmptyState icon={ShoppingBag} title={searchQuery ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan'} description={searchQuery ? 'Coba kata kunci lain.' : 'Belum ada pesanan masuk.'} />
        ) : (
          <div className="space-y-4">
            {paginated.map((order) => {
              const StatusIcon = statusIcons[order.status] || Package
              return (
                <div key={order.id} className="panel rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'selesai' ? 'bg-green-100 text-green-600' : order.status === 'dibatalkan' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-secondary">{order.id}</span>
                          <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${statusStyles[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                        </div>
                        <p className="text-sm text-gray-500">{order.date} · {order.qty} barang</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-primary text-lg">Rp {formatRupiah(order.amount)}</p>
                      <button onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {selectedOrder?.id === order.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <User className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Pelanggan</p>
                            <p className="font-semibold text-sm text-secondary">{order.customer}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Telepon</p>
                            <p className="font-semibold text-sm text-secondary">{order.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Produk</p>
                            <p className="font-semibold text-sm text-secondary">{order.product} ({order.qty}x)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Alamat</p>
                            <p className="font-semibold text-sm text-secondary">{order.address}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.status === 'diproses' && (
                          <button onClick={() => updateOrderStatus(order.id, 'dikirim')} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all">
                            <Truck className="h-4 w-4" /> Kirim Pesanan
                          </button>
                        )}
                        {order.status === 'dikirim' && (
                          <button onClick={() => updateOrderStatus(order.id, 'selesai')} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all">
                            <CheckCircle className="h-4 w-4" /> Tandai Selesai
                          </button>
                        )}
                        {(order.status === 'diproses' || order.status === 'dikirim') && (
                          <button onClick={() => updateOrderStatus(order.id, 'dibatalkan')} className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all">
                            <XCircle className="h-4 w-4" /> Batalkan
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-full font-semibold text-sm transition-all ${page === i + 1 ? 'gradient-bg text-white shadow-lg' : 'border border-gray-200 hover:bg-primary hover:text-white'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  )
}
