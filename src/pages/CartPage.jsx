import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cartService } from '../services/cartService'
import { formatRupiah } from '../utils/formatRupiah'
import { Trash2, ShoppingBag, ArrowRight, Heart, Tag, Truck, Shield } from 'lucide-react'

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await cartService.get()
      setCart(res.data || { items: [], total: 0 })
    } catch (error) {
      console.error(error)
      // Fallback
      setCart({
        items: [
          { id: 1, product: { id: 1, name: 'Smartphone Pro Max', price: 12999000, image_url: 'https://images.unsplash.com/photo-1592899677977-9e10cb588d6a?w=200' }, quantity: 1 },
          { id: 2, product: { id: 2, name: 'Wireless Headphone', price: 899000, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' }, quantity: 2 },
        ],
        total: 14797000
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return
    try {
      await cartService.update(itemId, quantity)
      fetchCart()
    } catch (error) {
      console.error(error)
    }
  }

  const removeItem = async (itemId) => {
    try {
      await cartService.remove(itemId)
      fetchCart()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-light">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  if (cart.items.length === 0) {
    return (
      <div className="bg-light min-h-screen pt-24 pb-16">
        <div className="container-custom text-center py-20">
          <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-secondary mb-2">Keranjang Belanja Kosong</h2>
          <p className="text-gray-500 mb-8">Yuk, belanja produk favoritmu sekarang!</p>
          <Link to="/products" className="gradient-bg text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition inline-flex items-center gap-2">
            Mulai Belanja <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-secondary mb-8 animate-slide-up">Keranjang Belanja</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, i) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md p-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary">{item.product.name}</h3>
                    <p className="text-primary font-bold text-lg">{formatRupiah(item.product.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100">-</button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-secondary">{formatRupiah(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24 animate-slide-up">
              <h3 className="text-xl font-bold text-secondary mb-4">Ringkasan Belanja</h3>
              
              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Harga</span>
                  <span className="font-semibold">{formatRupiah(cart.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Biaya Pengiriman</span>
                  <span className="text-green-600 font-semibold">Gratis</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-4 mb-6">
                <span className="font-bold text-secondary text-lg">Total</span>
                <span className="font-bold text-primary text-2xl">{formatRupiah(cart.total)}</span>
              </div>
              
              <Link to="/checkout">
                <button className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:shadow-xl transition flex items-center justify-center gap-2">
                  Checkout <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              
              <div className="mt-6 space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2"><Shield className="h-3 w-3" /> Keamanan transaksi terjamin</div>
                <div className="flex items-center gap-2"><Truck className="h-3 w-3" /> Gratis ongkir min belanja Rp100.000</div>
                <div className="flex items-center gap-2"><Tag className="h-3 w-3" /> Bisa gunakan voucher</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}