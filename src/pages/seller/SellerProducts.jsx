import { useEffect, useMemo, useState } from 'react'
import { Edit3, Image, Package, Plus, Search, Trash2, X } from 'lucide-react'
import { productService } from '../../services/productService'
import { storeService } from '../../services/storeService'
import { formatRupiah, getApiData, getImageUrl } from '../../utils/formatRupiah'
import { useToast } from '../../components/ui/useToast'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'

const initialForm = {
  name: '',
  category_id: '',
  price: '',
  stock: '',
  image_url: '',
  description: '',
}

export default function SellerProducts() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [storeName, setStoreName] = useState('')

  async function fetchProducts(storeFilter = storeName) {
    setLoading(true)
    setError('')
    try {
      const response = await productService.getAll({ limit: 100 })
      const allProducts = getApiData(response, [])
      setProducts(storeFilter ? allProducts.filter((product) => String(product.store_name || '').toLowerCase() === storeFilter.toLowerCase()) : allProducts)
    } catch (err) {
      setError(err.response?.data?.message || 'Produk gagal dimuat')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const response = await productService.getCategories()
      setCategories(getApiData(response, []))
    } catch {
      setCategories([])
    }
  }

  async function fetchMyStore() {
    try {
      const response = await storeService.getMyStore()
      const data = getApiData(response, response.data)
      const nextStoreName = data?.store_name || data?.name || ''
      setStoreName(nextStoreName)
      return nextStoreName
    } catch {
      setStoreName('')
      return ''
    }
  }

  useEffect(() => {
    queueMicrotask(async () => {
      const nextStoreName = await fetchMyStore()
      await fetchProducts(nextStoreName)
    })
    queueMicrotask(fetchCategories)
  }, [])

  const filteredProducts = useMemo(() => products.filter((product) => (
    !search || String(product.name || product.product_name || '').toLowerCase().includes(search.toLowerCase())
  )), [products, search])

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name || product.product_name || '',
      category_id: String(resolveCategoryId(product, categories) || ''),
      price: String(product.price || ''),
      stock: String(product.stock || ''),
      image_url: product.image_url || '',
      description: product.description || '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(initialForm)
  }

  const submitProduct = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || Number(form.price) <= 0) {
      toast.error('Nama dan harga produk wajib diisi')
      return
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      product_name: form.name.trim(),
      category_id: Number(form.category_id),
      price: Number(form.price),
      stock: Number(form.stock || 0),
      image_url: form.image_url.trim(),
      description: form.description.trim(),
    }

    try {
      if (!payload.category_id) {
        throw new Error('Kategori wajib dipilih')
      }
      if (editing) {
        await productService.update(editing.id, payload)
        toast.success('Produk berhasil diperbarui')
      } else {
        await productService.create(payload)
        toast.success('Produk berhasil ditambahkan')
      }
      closeModal()
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Produk gagal disimpan')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (productId) => {
    if (!window.confirm('Hapus produk ini?')) {
      return
    }
    try {
      await productService.remove(productId)
      toast.success('Produk berhasil dihapus')
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Produk gagal dihapus')
    }
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-primary font-semibold">Seller Center</p>
            <h1 className="text-3xl font-bold text-secondary">Kelola Produk</h1>
            <p className="text-gray-500">{filteredProducts.length} produk tersedia</p>
          </div>
          <button onClick={openCreate} className="gradient-bg inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white">
            <Plus className="h-4 w-4" />
            Tambah Produk
          </button>
        </div>

        <label className="mb-6 flex max-w-md items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Cari produk..." />
        </label>

        {loading ? (
          <div className="h-80 skeleton rounded-3xl"></div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchProducts} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState icon={Package} title={search ? 'Produk tidak ditemukan' : 'Belum ada produk'} description={search ? 'Coba kata kunci lain.' : 'Tambahkan produk pertama untuk toko Anda.'} actionLabel="Tambah Produk" onAction={openCreate} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <article key={product.id} className="panel overflow-hidden rounded-2xl">
                <div className="aspect-square bg-gray-100">
                  <img src={getImageUrl(product.image_url, product.name || product.product_name)} alt={product.name || product.product_name} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-primary">{product.category_name || product.category || 'Umum'}</p>
                  <h2 className="mt-1 line-clamp-2 font-bold text-secondary">{product.name || product.product_name}</h2>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="font-bold text-primary">{formatRupiah(product.price || 0)}</p>
                    <p className="text-xs text-gray-500">Stok: {product.stock || 0}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEdit(product)} className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-secondary hover:border-primary hover:text-primary">
                      <Edit3 className="mx-auto h-4 w-4" />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="flex-1 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={submitProduct} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-secondary">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
                <p className="text-sm text-gray-500">Lengkapi nama, harga, stok, gambar, dan deskripsi produk.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nama Produk" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
              <label>
                <span className="text-sm font-semibold text-gray-600">Kategori</span>
                <select
                  value={form.category_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Pilih kategori</option>
                {categories.map((category) => {
                  const categoryId = category.id
                  const categoryName = category.category_name || category.name
                  return (
                    <option key={categoryId} value={categoryId}>
                      {categoryName}
                    </option>
                  )
                })}
                </select>
              </label>
              <Field label="Harga" type="number" value={form.price} onChange={(value) => setForm((prev) => ({ ...prev, price: value }))} />
              <Field label="Stok" type="number" value={form.stock} onChange={(value) => setForm((prev) => ({ ...prev, stock: value }))} />
              <label className="md:col-span-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-600"><Image className="h-4 w-4" /> URL Gambar Produk</span>
                <input value={form.image_url} onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-gray-600">Deskripsi</span>
                <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} rows={4} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
              </label>
            </div>

            <button disabled={saving} className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-50">
              {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
    </label>
  )
}

function resolveCategoryId(product, categories) {
  if (product?.category_id) return product.category_id

  const productCategoryName = String(product?.category_name || product?.category || '').trim().toLowerCase()
  const matched = categories.find((category) => String(category.category_name || category.name || '').trim().toLowerCase() === productCategoryName)
  return matched?.id || ''
}
