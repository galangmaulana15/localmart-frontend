/* eslint-disable */
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Store, Package, ShoppingBag, DollarSign, Star, MessageSquare,
  TrendingUp, TrendingDown, Users, Clock, ArrowUpRight,
  BarChart3, CircleDollarSign, ShoppingCart, Heart
} from 'lucide-react'
import { formatRupiah } from '../utils/formatRupiah'

const stats = [
  { label: 'Total Produk', value: '24', icon: Package, change: '+3', trend: 'up', color: 'from-blue-500 to-cyan-500' },
  { label: 'Pesanan Masuk', value: '12', icon: ShoppingBag, change: '+5', trend: 'up', color: 'from-primary to-orange-500' },
  { label: 'Pendapatan', value: 'Rp 2,4jt', icon: DollarSign, change: '+12%', trend: 'up', color: 'from-green-500 to-teal-500' },
  { label: 'Rating Toko', value: '4.8', icon: Star, change: '+0.2', trend: 'up', color: 'from-yellow-500 to-orange-500' },
]

const recentOrders = [
  { id: '#INV-001', customer: 'Sarah Wijaya', product: 'Kemeja Flanel Premium', amount: 185000, status: 'diproses', date: '2025-06-15' },
  { id: '#INV-002', customer: 'Budi Santoso', product: 'Tas Ransel Wanita', amount: 250000, status: 'dikirim', date: '2025-06-14' },
  { id: '#INV-003', customer: 'Ayu Lestari', product: 'Sepatu Sneakers Casual', amount: 320000, status: 'selesai', date: '2025-06-13' },
  { id: '#INV-004', customer: 'Rizki Pratama', product: 'Jam Tangan Analog', amount: 450000, status: 'diproses', date: '2025-06-13' },
  { id: '#INV-005', customer: 'Dian Permata', product: 'Parfum Pria 50ml', amount: 175000, status: 'selesai', date: '2025-06-12' },
]

const statusStyles = {
  diproses: 'bg-primary/10 text-primary',
  dikirim: 'bg-accent/10 text-accent',
  selesai: 'bg-green-100 text-green-700',
  dibatalkan: 'bg-red-100 text-red-600',
}

export default function SellerDashboard() {
  const { user } = useAuth()

  if (!user || user.role_id !== 2) {
    return (
      <div className="bg-light min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center panel rounded-3xl p-12 max-w-md">
          <Store className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-2">Akses Terbatas</h2>
          <p className="text-gray-500 mb-6">Halaman ini hanya untuk Seller. Daftar sebagai seller untuk mengakses.</p>
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
              <Store className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-semibold">Seller Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
            <p className="text-gray-500 mt-1">Selamat datang kembali, {user?.full_name || 'Seller'}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/seller/products" className="border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-gray-50 transition flex items-center gap-2">
              <Package className="h-4 w-4" /> Kelola Produk
            </Link>
            <Link to="/seller/orders" className="gradient-bg text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:shadow-xl transition-all flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Pesanan
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="panel rounded-2xl p-5 group hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-5.5 w-5.5 text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-secondary">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-secondary">Pesanan Terbaru</h3>
              <Link to="/seller/orders" className="flex items-center gap-1 text-primary text-sm font-semibold hover:gap-2 transition-all">
                Lihat Semua <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-3 font-medium">Invoice</th>
                    <th className="text-left pb-3 font-medium">Pelanggan</th>
                    <th className="text-left pb-3 font-medium hidden md:table-cell">Produk</th>
                    <th className="text-right pb-3 font-medium">Total</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                      <td className="py-3 font-semibold text-secondary">{order.id}</td>
                      <td className="py-3 text-gray-700">{order.customer}</td>
                      <td className="py-3 text-gray-500 hidden md:table-cell max-w-[160px] truncate">{order.product}</td>
                      <td className="py-3 text-right font-semibold text-secondary">Rp {formatRupiah(order.amount)}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${statusStyles[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel rounded-3xl p-6">
              <h3 className="font-bold text-lg text-secondary mb-4">Aktivitas Hari Ini</h3>
              <div className="space-y-4">
                {[
                  { icon: ShoppingCart, text: '3 produk terjual', time: '2 jam lalu', color: 'text-primary bg-primary/10' },
                  { icon: Star, text: 'Rating toko naik 4.8', time: '5 jam lalu', color: 'text-yellow-600 bg-yellow-100' },
                  { icon: MessageSquare, text: '2 chat baru dari pembeli', time: '1 jam lalu', color: 'text-accent bg-accent/10' },
                  { icon: Users, text: '5 pengunjung toko', time: 'Baru saja', color: 'text-blue-600 bg-blue-100' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary">{item.text}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel rounded-3xl p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-secondary">Ringkasan Toko</h3>
                <div className="w-9 h-9 rounded-xl bg-white/80 shadow-sm flex items-center justify-center"><BarChart3 className="h-4 w-4 text-primary" /></div>
              </div>
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Produk Terjual</span>
                  <span className="font-bold text-secondary">342</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Pendapatan Bulan Ini</span>
                  <span className="font-bold text-secondary">Rp 12,5jt</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Pelanggan</span>
                  <span className="font-bold text-secondary">89</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Produk Favorit</span>
                  <span className="font-bold text-secondary flex items-center gap-1"><Heart className="h-3 w-3 text-red-500" /> 45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
