import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartService } from '../services/cartService'
import { formatRupiah, getApiData } from '../utils/formatRupiah'
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck, Shield, CheckSquare } from 'lucide-react'
import { useToast } from '../components/ui/useToast'

export default function CartPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState(new Set())

  useEffect(() => {
    queueMicrotask(fetchCart)
  }, [])

  const normalizeItem = (item) => {
    if (item.product) return item
    return {
      id: item.cart_item_id || item.id,
      cart_item_id: item.cart_item_id || item.id,
      product: {
        id: item.product_id,
        name: item.name || item.product_name || '',
        price: item.price || 0,
        image_url: item.image_url || item.product_image || '',
        stock: item.stock || item.product?.stock || 0,
      },
      quantity: item.quantity || 1,
    }
  }

  async function fetchCart() {
    try {
      const res = await cartService.get()
      const data = getApiData(res, { items: [], total: 0 })
      data.items = (data.items || []).map(normalizeItem)
      setCart(data)
      setSelectedIds(prev => {
        const valid = new Set(data.items.map(i => i.id))
        return new Set([...prev].filter(id => valid.has(id)))
      })
      window.dispatchEvent(new Event('cart-updated'))
    } catch (error) {
      console.error(error)
      const fallback = {
        items: [
          { id: 1, product: { id: 1, name: 'Smartphone Pro Max', price: 12999000, image_url: 'https://images.unsplash.com/photo-1592899677977-9e10cb588d6a?w=200' }, quantity: 1 },
          { id: 2, product: { id: 2, name: 'Wireless Headphone', price: 899000, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' }, quantity: 2 },
        ],
        total: 14797000
      }
      setCart(fallback)
      setSelectedIds(new Set())
      window.dispatchEvent(new Event('cart-updated'))
    } finally {
      setLoading(false)
    }
  }

  const selectedTotal = useMemo(() => {
    return cart.items
      .filter(i => selectedIds.has(i.id))
      .reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  }, [cart.items, selectedIds])

  const getAvailableStock = (item) => Number(item.product?.stock || item.stock || 0)

  const allSelected = cart.items.length > 0 && selectedIds.size === cart.items.length

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(cart.items.map(i => i.id)))
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return
    try {
      await cartService.update(itemId, quantity)
      fetchCart()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Gagal mengubah quantity')
    }
  }

  const removeItem = async (itemId) => {
    try {
      await cartService.remove(itemId)
      toast.success('Produk dihapus dari keranjang')
      fetchCart()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Gagal menghapus produk')
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

        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2.5 cursor-pointer select-none" onClick={toggleSelectAll}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${allSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
              {allSelected && <CheckSquare className="h-4 w-4 text-white" />}
            </div>
            <span className="text-sm font-semibold text-gray-700">Pilih Semua</span>
            <span className="text-xs text-gray-400">({selectedIds.size} dari {cart.items.length} dipilih)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, i) => (
              <div key={item.id} className={`bg-white rounded-2xl shadow-md p-4 animate-fade-in transition ${!selectedIds.has(item.id) ? 'opacity-60' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex gap-4">
                  <div className="flex items-start pt-2">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition mt-1.5 ${selectedIds.has(item.id) ? 'bg-primary border-primary' : 'border-gray-300'}`} onClick={() => toggleSelect(item.id)}>
                      {selectedIds.has(item.id) && <CheckSquare className="h-4 w-4 text-white" />}
                    </div>
                  </div>
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
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={getAvailableStock(item) > 0 && item.quantity >= getAvailableStock(item)}
                          className="px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Stok tersedia: {getAvailableStock(item) > 0 ? getAvailableStock(item) : 'Habis'}
                    </p>
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
                  <span className="text-gray-500">Total Harga ({selectedIds.size} item)</span>
                  <span className="font-semibold">{formatRupiah(selectedTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Biaya Pengiriman</span>
                  <span className="text-green-600 font-semibold">Gratis</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-4 mb-6">
                <span className="font-bold text-secondary text-lg">Total</span>
                <span className="font-bold text-primary text-2xl">{formatRupiah(selectedTotal)}</span>
              </div>
              
              <button
                onClick={() => {
                  const selected = cart.items.filter(i => selectedIds.has(i.id))
                  navigate('/checkout', { state: { items: selected } })
                }}
                disabled={selectedIds.size === 0}
                className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedIds.size === 0 ? 'Pilih item terlebih dahulu' : `Checkout (${selectedIds.size})`} <ArrowRight className="h-5 w-5" />
              </button>
              
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
