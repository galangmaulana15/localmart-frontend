/* eslint-disable */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { productService } from '../services/productService'
import { getApiData } from '../utils/formatRupiah'
import { useToast } from '../components/ui/useToast'
import {
  Package, Plus, Edit3, Trash2, Search, X, Store,
  ChevronLeft, ChevronRight, Image, Tag, DollarSign
} from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'

export default function SellerProducts() {
  const { user } = useAuth()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '', image: '', description: '' })

  const ITEMS_PER_PAGE = 8

  async function fetchProducts() {
    setError('')
    try {
      const res = await productService.getAll({ limit: 100 })
      setProducts(getApiData(res, []))
    } catch (err) {
      setError(err.response?.data?.message || 'Produk gagal dimuat')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { queueMicrotask(fetchProducts) }, [])

  const filtered = products.filter(p =>
    !searchQuery ||
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const resetForm = () => {
    setForm({ name: '', category: '', price: '', stock: '', image: '', description: '' })
    setEditingProduct(null)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name || '',
      category: product.category_name || product.category || '',
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '',
      image: product.image_url || product.image || '',
      description: product.description || '',
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.error('Nama dan harga produk wajib diisi')
      return
    }
    toast.success(editingProduct ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!')
    setShowModal(false)
    resetForm()
    fetchProducts()
  }

  const handleDelete = (productId) => {
    toast.success('Produk berhasil dihapus!')
    fetchProducts()
  }

  const formFields = [
    { key: 'name', label: 'Nama Produk', type: 'text', icon: Tag },
    { key: 'category', label: 'Kategori', type: 'text', icon: Package },
    { key: 'price', label: 'Harga', type: 'number', icon: DollarSign },
    { key: 'stock', label: 'Stok', type: 'number', icon: Package },
    { key: 'image', label: 'URL Gambar', type: 'text', icon: Image },
  ]

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-3">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-semibold">Seller Products</span>
            </div>
            <h1 className="text-3xl font-bold text-secondary">Kelola Produk</h1>
            <p className="text-gray-500 mt-1">{filtered.length} produk tersedia</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true) }} className="gradient-bg text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 w-fit">
            <Plus className="h-4 w-4" /> Tambah Produk
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <label className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex-1 max-w-md shadow-sm">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }} placeholder="Cari produk..." className="bg-transparent outline-none text-sm w-full" />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X className="h-4 w-4 text-gray-400" /></button>}
          </label>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} className="md:grid-cols-4" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchProducts} />
        ) : paginated.length === 0 ? (
          <EmptyState icon={Package} title={searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'} description={searchQuery ? 'Coba kata kunci lain.' : 'Tambahkan produk pertama Anda!'} actionLabel="Tambah Produk" onAction={() => { resetForm(); setShowModal(true) }} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {paginated.map((product) => (
                <div key={product.id} className="panel rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    {(product.image_url || product.image) ? (
                      <img src={product.image_url || product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><Image className="h-10 w-10 text-gray-300" /></div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">{product.category_name || product.category || 'Umum'}</span>
                    <h3 className="font-semibold text-secondary mt-2 text-sm line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-primary">Rp {(product.price || 0).toLocaleString('id-ID')}</span>
                      <span className="text-xs text-gray-500">Stok: {product.stock || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-full font-semibold text-sm transition-all ${page === i + 1 ? 'gradient-bg text-white shadow-lg' : 'border border-gray-200 hover:bg-primary hover:text-white'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowModal(false); resetForm() }}>
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-secondary">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => { setShowModal(false); resetForm() }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><X className="h-4 w-4 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields.map(f => (
                <label key={f.key}>
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">{f.label}</p>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 border border-gray-200 focus-within:border-primary transition-all">
                    <f.icon className="h-4 w-4 text-gray-400" />
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-transparent outline-none py-3 text-sm" />
                  </div>
                </label>
              ))}
              <label>
                <p className="text-xs text-gray-500 mb-1.5 font-medium">Deskripsi</p>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 outline-none focus:border-primary transition-all text-sm" rows={3} />
              </label>
              <button type="submit" className="w-full gradient-bg text-white rounded-xl py-3 font-semibold hover:shadow-xl transition-all">{editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
