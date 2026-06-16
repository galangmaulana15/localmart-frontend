import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { cartService } from '../services/cartService'
import { useAuth } from '../hooks/useAuth'
import { formatRupiah, getApiData, getImageUrl } from '../utils/formatRupiah'
import { addToWishlist, buildChatThreadId, getProductReviews, isInWishlist, removeFromWishlist } from '../utils/demoStore'
import { useToast } from '../components/ui/useToast'
import { ShoppingCart, Heart, MessageCircle, Truck, Star, Store, Zap, CheckCircle, TrendingUp } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated, user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [isWishlist, setIsWishlist] = useState(false)
  const [reviews, setReviews] = useState([])
  const [selectedImage, setSelectedImage] = useState('')

  async function fetchProduct() {
    setLoading(true)
    try {
      const res = await productService.getById(id)
      const data = getApiData(res, res.data)
      setProduct(data)
      const nextImages = getProductImages(data)
      setSelectedImage(nextImages[0] || getImageUrl(data?.image_url, data?.name || data?.product_name))
    } catch (error) {
      console.error('Error fetching product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      queueMicrotask(() => {
        fetchProduct()
        setIsWishlist(isInWishlist(Number(id)))
        setReviews(getProductReviews(id))
      })
    }
    window.scrollTo(0, 0)
  }, [id])

  const productImages = useMemo(() => getProductImages(product), [product])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await cartService.add(id, quantity)
      toast.success('Produk ditambahkan ke keranjang')
      window.dispatchEvent(new Event('cart-updated'))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan')
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const productId = Number(id)
    if (isWishlist) {
      removeFromWishlist(productId)
      setIsWishlist(false)
      toast.success('Dihapus dari wishlist')
    } else {
      addToWishlist(productId)
      setIsWishlist(true)
      toast.success('Ditambahkan ke wishlist')
    }
    window.dispatchEvent(new Event('wishlist-updated'))
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    navigate('/checkout', {
      state: {
        items: [{
          id: `buy-${product.id || id}`,
          product,
          quantity,
        }],
      },
    })
  }

  const handleChatSeller = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const params = new URLSearchParams({
      type: 'seller',
      thread: buildChatThreadId({ productId: product.id || id, customerKey: user?.id || user?.email || 'guest', kind: 'seller' }),
      productId: String(product.id || id),
      productName: product.name || product.product_name || 'Produk LocalMart',
      storeName: product.store?.name || product.store_name || 'Penjual LocalMart',
      context: product.name || product.product_name || 'Produk LocalMart',
      message: 'Halo, saya ingin bertanya tentang produk ini.',
    })
    navigate(`/customer/chat?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="bg-light min-h-screen pb-16">
        <div className="container-custom py-16">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="bg-light min-h-screen pb-16">
        <div className="container-custom text-center py-20">
          <h1 className="text-2xl font-bold text-secondary mb-2">Produk tidak ditemukan</h1>
          <Link to="/products" className="text-primary hover:underline">Kembali ke produk</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-h-screen pb-16">
      <div className="container-custom pt-4">
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
                src={selectedImage || getImageUrl(product.image_url, product.name)}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = `https://placehold.co/600x600?text=${encodeURIComponent(product.name || 'Product')}&bg=FF6B35&textColor=white`
                }}
              />
            </div>
            {productImages.length > 1 && (
              <div className="border-t border-gray-100 bg-white p-4">
                <p className="mb-3 text-sm font-semibold text-secondary">Semua foto produk</p>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
                  {productImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`aspect-square overflow-hidden rounded-2xl border transition ${
                        selectedImage === image ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/200x200?text=${index + 1}&bg=F3F4F6&textColor=111827`
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                onClick={handleBuyNow}
                className="flex-1 gradient-bg text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Zap className="h-5 w-5" /> Beli Sekarang
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={handleWishlist} className={`rounded-xl border px-4 py-3 font-semibold transition flex items-center justify-center gap-2 ${isWishlist ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-secondary hover:border-primary hover:text-primary'}`}>
                <Heart className={`h-5 w-5 ${isWishlist ? 'fill-primary' : ''}`} />
                {isWishlist ? 'Ada di Wishlist' : 'Wishlist'}
              </button>
              <button onClick={handleChatSeller} className="rounded-xl border border-gray-200 px-4 py-3 font-semibold text-secondary transition hover:border-primary hover:text-primary flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Seller
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

        <div className="mt-8 bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-secondary mb-4">Ulasan Produk</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">Belum ada ulasan untuk produk ini.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-secondary">{review.customer_name || 'Customer LocalMart'}</p>
                      <div className="mt-1 flex gap-1 text-accent">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className={`h-4 w-4 ${index < review.rating ? 'fill-accent' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getProductImages(product) {
  if (!product) return []

  const images = []
  const rawImages = Array.isArray(product.images) ? product.images : []

  rawImages.forEach((image) => {
    const value = typeof image === 'string' ? image : image?.image_url
    if (value) images.push(getImageUrl(value, product.name || product.product_name))
  })

  if (product.image_url) {
    images.unshift(getImageUrl(product.image_url, product.name || product.product_name))
  }

  return [...new Set(images)]
}
