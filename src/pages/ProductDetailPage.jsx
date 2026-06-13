import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { cartService } from '../services/cartService'
import { useAuth } from '../hooks/useAuth'
import { formatRupiah, getImageUrl } from '../utils/formatRupiah'
import { ShoppingCart, Heart, ArrowLeft, Shield, Truck, Clock, Sparkles, Star, Store, Zap, CheckCircle, TrendingUp } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [isWishlist, setIsWishlist] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
    window.scrollTo(0, 0)
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await productService.getById(id)
      setProduct(res.data)
      console.log('Product loaded:', res.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await cartService.add(id, quantity)
      alert('✓ Produk ditambahkan ke keranjang')
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-light min-h-screen pt-24 pb-16">
        <div className="container-custom">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="bg-light min-h-screen pt-24 pb-16">
        <div className="container-custom text-center py-20">
          <h1 className="text-2xl font-bold text-secondary mb-2">Produk tidak ditemukan</h1>
          <Link to="/products" className="text-primary hover:underline">Kembali ke produk</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Produk</Link>
          <span>/</span>
          <span className="text-primary line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Section */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
              <img
                src={getImageUrl(product.image_url, product.name)}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = `https://placehold.co/600x600?text=${encodeURIComponent(product.name || 'Product')}&bg=FF6B35&textColor=white`
                }}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex gap-2">
              <div className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                <Star className="h-3 w-3 fill-accent" /> {product.rating || 4.9}
              </div>
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                <TrendingUp className="h-3 w-3" /> Terlaris
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-secondary">{product.name}</h1>
            
            {/* Price */}
            <div className="border-b pb-4">
              <p className="text-4xl text-primary font-bold">{formatRupiah(product.price)}</p>
              <p className="text-sm text-gray-400 mt-1">Harga sudah termasuk pajak</p>
            </div>

            {/* Store Info */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="gradient-bg rounded-full p-2 h-10 w-10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-secondary">{product.store?.name || 'Official Store'}</p>
                  <p className="text-xs text-gray-400">Online • Bergabung 2024</p>
                </div>
              </div>
            </div>

            {/* Stock & Delivery */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="font-semibold text-green-600">Stok {product.stock || 10}+</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                <div className="bg-blue-100 rounded-full p-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pengiriman</p>
                  <p className="font-semibold text-blue-600">Bebas Ongkir</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="font-semibold text-secondary mb-3">Jumlah</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition font-bold text-lg w-12"
                  >-</button>
                  <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))} 
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition font-bold text-lg w-12"
                  >+</button>
                </div>
                <p className="text-gray-400 text-sm">Maks. {product.stock || 10} produk</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 border-2 border-primary text-primary py-4 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" /> 
                {adding ? 'Menambahkan...' : 'Keranjang'}
              </button>
              <button
                className="flex-1 gradient-bg text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Zap className="h-5 w-5" /> Beli Sekarang
              </button>
            </div>

            {/* Payment Methods */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-400 mb-2">Metode Pembayaran</p>
              <div className="flex gap-2 flex-wrap">
                {['BCA', 'Mandiri', 'BNI', 'OVO', 'GoPay', 'DANA'].map(method => (
                  <span key={method} className="text-xs bg-gray-100 px-3 py-1 rounded-full">{method}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-12 bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-secondary mb-4">Deskripsi Produk</h2>
          <p className="text-gray-600 leading-relaxed">
            {product.description || 'Deskripsi produk akan segera diperbarui oleh penjual.'}
          </p>
        </div>
      </div>
    </div>
  )
}