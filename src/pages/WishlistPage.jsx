import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getWishlist, removeFromWishlist, clearWishlist } from '../utils/demoStore'
import { getApiData } from '../utils/formatRupiah'
import { productService } from '../services/productService'
import { cartService } from '../services/cartService'
import { Heart, ShoppingBag, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import ProductCard from '../components/ui/ProductCard'
import { useToast } from '../components/ui/useToast'

export default function WishlistPage() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = 12

  async function fetchWishlistProducts() {
    setError('')
    try {
      const ids = getWishlist()
      if (ids.length === 0) {
        setProducts([])
        setTotalPages(1)
        setLoading(false)
        return
      }
      const res = await productService.getAll({ limit: 100 })
      const allProducts = getApiData(res, [])
      const filtered = allProducts.filter(p => ids.includes(p.id))
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1)
      const start = (page - 1) * ITEMS_PER_PAGE
      setProducts(filtered.slice(start, start + ITEMS_PER_PAGE))
    } catch (err) {
      setError(err.response?.data?.message || 'Wishlist gagal dimuat')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { queueMicrotask(fetchWishlistProducts) }, [page])

  const handleRemove = (productId) => {
    removeFromWishlist(productId)
    fetchWishlistProducts()
    toast.success('Dihapus dari wishlist')
    window.dispatchEvent(new Event('wishlist-updated'))
  }

  const handleClear = () => {
    clearWishlist()
    setProducts([])
    setPage(1)
    toast.success('Wishlist dikosongkan')
    window.dispatchEvent(new Event('wishlist-updated'))
  }

  const handleAddProductToCart = async (product) => {
    try {
      await cartService.add(product.id, 1)
      toast.success('Ditambahkan ke keranjang')
    } catch {
      toast.error('Gagal menambahkan ke keranjang')
    }
  }

  const ids = getWishlist()

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-3">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-semibold">Favoritmu</span>
            </div>
            <h1 className="text-3xl font-bold text-secondary">Wishlist</h1>
            <p className="text-gray-500 mt-1">{ids.length} produk tersimpan</p>
          </div>
          <div className="flex items-center gap-3">
            {ids.length > 0 && (
              <button onClick={handleClear} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600 hover:shadow-lg transition-all hover:scale-105">
                <Trash2 className="h-4 w-4" />
                Hapus Semua
              </button>
            )}
            <Link to="/products" className="gradient-bg text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Belanja
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} className="md:grid-cols-4" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchWishlistProducts} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Wishlist masih kosong"
            description="Mulai jelajahi produk dan tambahkan ke wishlist!"
            actionLabel="Jelajahi Produk"
            actionTo="/products"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
              {products.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} onAddToCart={handleAddProductToCart} />
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute bottom-2 left-2 z-10 w-8 h-8 rounded-full bg-white/95 shadow-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-200"
                    title="Hapus dari wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${page === i + 1 ? 'gradient-bg text-white shadow-lg' : 'border border-gray-200 hover:bg-primary hover:text-white hover:border-primary'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
