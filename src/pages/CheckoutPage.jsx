import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, ShoppingBag, Shield, Truck } from 'lucide-react'
import { formatRupiah } from '../utils/formatRupiah'
import { getPaymentSourceBalance, mergeUserProfile, settleOrderPayment } from '../utils/demoStore'
import { calculateMarketplaceSummary, CHECKOUT_PAYMENT_METHODS, getBandungDeliveryInfo } from '../utils/marketplace'
import { orderService } from '../services/orderService'
import { paymentService } from '../services/paymentService'
import { cartService } from '../services/cartService'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/useToast'

const digitsOnly = (value) => String(value || '').replace(/\D/g, '')

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const items = useMemo(() => location.state?.items || [], [location.state])
  const profile = mergeUserProfile(user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: profile.full_name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    city: profile.city || 'Bandung',
    province: profile.province || 'Jawa Barat',
    postalCode: profile.postal_code || '',
    paymentMethod: 'Wallet LocalMart',
  })

  const normalizedItems = useMemo(() => items.map((item) => ({
    ...item,
    price: item.product?.price || item.price || 0,
    subtotal: (item.product?.price || item.price || 0) * (item.quantity || 1),
  })), [items])
  const stockAdjustedItems = useMemo(() => {
    return normalizedItems.map((item) => {
      const availableStock = Number(item.product?.stock || item.stock || 0)
      const price = Number(item.product?.price || item.price || 0)
      const quantity = Number(item.quantity || 1)

      if (availableStock <= 0) {
        return { ...item, stock: 0, quantity: 0, subtotal: 0, soldOut: true }
      }

      if (quantity > availableStock) {
        return {
          ...item,
          stock: availableStock,
          quantity: availableStock,
          subtotal: price * availableStock,
          adjusted: true,
        }
      }

      return {
        ...item,
        stock: availableStock,
        subtotal: price * quantity,
      }
    }).filter((item) => item.quantity > 0)
  }, [normalizedItems])
  const adjustedItems = useMemo(() => stockAdjustedItems.filter((item) => item.adjusted), [stockAdjustedItems])
  const soldOutItems = useMemo(() => normalizedItems.filter((item) => Number(item.product?.stock || item.stock || 0) <= 0), [normalizedItems])
  const summary = useMemo(() => calculateMarketplaceSummary(stockAdjustedItems), [stockAdjustedItems])
  const deliveryInfo = useMemo(() => getBandungDeliveryInfo(`${form.address} ${form.city}`), [form.address, form.city])
  const selectedPaymentBalance = useMemo(() => {
    return getPaymentSourceBalance(user, form.paymentMethod)
  }, [form.paymentMethod, user])

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const validate = () => {
    const phone = digitsOnly(form.phone)
    if (form.name.trim().length < 3) return 'Nama penerima minimal 3 karakter'
    if (!/^\d{10,13}$/.test(phone)) return 'Nomor handphone harus 10-13 digit'
    if (form.address.trim().length < 15) return 'Alamat minimal 15 karakter'
    if (form.city.trim().length < 3) return 'Kota minimal 3 karakter'
    if (form.province.trim().length < 3) return 'Provinsi minimal 3 karakter'
    if (!/^\d{5}$/.test(digitsOnly(form.postalCode))) return 'Kode pos harus 5 digit'
    const city = form.city.trim().toLowerCase()
    const province = form.province.trim().toLowerCase()
    const address = form.address.trim().toLowerCase()
    if (!city.includes('bandung')) {
      return 'Checkout hanya untuk kota Bandung. Ubah kota menjadi Bandung.'
    }
    if (!province.includes('jawa barat')) {
      return 'Checkout hanya untuk provinsi Jawa Barat. Ubah provinsi menjadi Jawa Barat.'
    }
    if (!address.includes('bandung') || address.includes('jakarta')) {
      return 'Alamat harus jelas berada di Bandung, bukan kota lain seperti Jakarta.'
    }
    if (!deliveryInfo.available) {
      return 'Pesanan hanya bisa di-checkout jika alamat berada di Kota Bandung, Jawa Barat.'
    }
    if (soldOutItems.length > 0) {
      return `${soldOutItems[0].product?.name || soldOutItems[0].product_name || 'Produk'} sedang habis. Hapus dulu dari checkout.`
    }
    if (form.paymentMethod === 'Wallet LocalMart' && selectedPaymentBalance < summary.total) {
      return `Saldo ${form.paymentMethod} tidak mencukupi. Top up dulu.`
    }
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setLoading(true)
    try {
      let nextUrl = ''
      let shouldNavigateToOrders = false
      if (form.paymentMethod === 'Wallet LocalMart') {
        const response = await orderService.checkout({
          items: stockAdjustedItems,
          summary,
          customer: user,
          payment_method: form.paymentMethod,
          shipping_name: form.name.trim(),
          shipping_phone: digitsOnly(form.phone),
          shipping_address: `${form.name.trim()} (${digitsOnly(form.phone)}), ${form.address.trim()}, ${form.city.trim()}, ${form.province.trim()} ${digitsOnly(form.postalCode)}`,
          shipping_city: form.city.trim(),
          shipping_province: form.province.trim(),
          shipping_postal_code: digitsOnly(form.postalCode),
        })
        const localOrder = response.data?.data || {}
        settleOrderPayment(user, localOrder || { order_code: 'LocalMart' }, form.paymentMethod, summary.total)
        toast.success('Pembayaran wallet berhasil. Status pesanan menjadi PAID.')
        shouldNavigateToOrders = true
      } else {
        const response = await paymentService.createXenditCheckout({
          items: stockAdjustedItems,
          summary,
          customer: user,
          payment_method: form.paymentMethod,
          shipping_name: form.name.trim(),
          shipping_phone: digitsOnly(form.phone),
          shipping_address: `${form.name.trim()} (${digitsOnly(form.phone)}), ${form.address.trim()}, ${form.city.trim()}, ${form.province.trim()} ${digitsOnly(form.postalCode)}`,
          shipping_city: form.city.trim(),
          shipping_province: form.province.trim(),
          shipping_postal_code: digitsOnly(form.postalCode),
        })
        const invoiceUrl = response.data?.data?.invoice_url
        toast.success('Invoice Xendit berhasil dibuat. Kamu akan diarahkan ke halaman pembayaran.')
        if (!invoiceUrl) {
          throw new Error('Invoice Xendit tidak tersedia')
        }
        nextUrl = invoiceUrl
      }

      await Promise.allSettled(items.map((item) => cartService.remove(item.id)))
      window.dispatchEvent(new Event('cart-updated'))
      window.dispatchEvent(new Event('orders-updated'))
      if (form.paymentMethod === 'Wallet LocalMart') {
        window.dispatchEvent(new Event('wallet-updated'))
      } else if (nextUrl) {
        window.location.replace(nextUrl)
      }
      if (shouldNavigateToOrders) {
        navigate('/my-orders')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Checkout gagal diproses'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-light min-h-screen pt-24 pb-16">
        <div className="container-custom text-center py-20">
          <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-secondary mb-2">Tidak ada item yang dipilih</h2>
          <p className="text-gray-500 mb-8">Pilih item di keranjang belanja terlebih dahulu.</p>
          <Link to="/cart" className="gradient-bg text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition inline-flex items-center gap-2">
            Kembali ke Keranjang <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition" /> Kembali ke Keranjang
        </Link>

        <h1 className="text-3xl font-bold text-secondary mb-8 animate-slide-up">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-secondary mb-4">Data Pengiriman</h2>
              {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}
              <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${deliveryInfo.available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {deliveryInfo.available
                  ? 'Alamat berada di area Bandung. Checkout bisa dilanjutkan.'
                  : 'LocalMart hanya melayani pengiriman untuk area Bandung. Ubah alamat ke Kota Bandung untuk bisa checkout.'}
              </div>
              {adjustedItems.length > 0 && (
                <div className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                  Beberapa quantity sudah disesuaikan dengan stok terbaru.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama Penerima" value={form.name} onChange={(value) => setField('name', value)} />
                <Input label="No. Handphone" value={form.phone} onChange={(value) => setField('phone', value)} inputMode="numeric" />
                <label className="md:col-span-2">
                  <span className="text-sm font-semibold text-gray-600">Alamat Lengkap</span>
                  <textarea value={form.address} onChange={(e) => setField('address', e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
                </label>
                <Input label="Kota" value={form.city} onChange={(value) => setField('city', value)} />
                <Input label="Provinsi" value={form.province} onChange={(value) => setField('province', value)} />
                <Input label="Kode Pos" value={form.postalCode} onChange={(value) => setField('postalCode', value)} inputMode="numeric" />
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-secondary mb-4">Metode Pembayaran</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHECKOUT_PAYMENT_METHODS.map((method) => (
                  <label key={method} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${form.paymentMethod === method ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                    <input type="radio" name="paymentMethod" value={method} checked={form.paymentMethod === method} onChange={(e) => setField('paymentMethod', e.target.value)} />
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-secondary">{method}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Saldo metode terpilih</p>
                <p className="mt-1 text-lg font-bold text-secondary">{formatRupiah(selectedPaymentBalance)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {form.paymentMethod === 'Wallet LocalMart'
                    ? 'Saldo ini dipakai langsung untuk bayar order.'
                    : `Saldo metode ${form.paymentMethod} dihitung dari top up yang sudah pernah dilakukan customer.`}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              {stockAdjustedItems.map((item, i) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-md p-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-secondary truncate">{item.product.name}</h3>
                      <p className="text-primary font-bold">{formatRupiah(item.product.price)}</p>
                      <p className="text-sm text-gray-500 mt-1">x{item.quantity}</p>
                      <p className="text-xs text-gray-400 mt-1">Stok tersedia: {item.stock || 'Habis'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary">{formatRupiah(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24 animate-slide-up">
              <h3 className="text-xl font-bold text-secondary mb-4">Ringkasan Pesanan</h3>
              <SummaryRow label={`Subtotal (${stockAdjustedItems.length} item)`} value={summary.subtotal} />
              <SummaryRow label="Ongkir LocalMart Express" value={summary.shipping} />
              <SummaryRow label="Diskon" value={summary.discount} negative />
              <SummaryRow label="Biaya Layanan" value={summary.serviceFee} />
              <div className="flex justify-between mt-4 mb-6 border-t pt-4">
                <span className="font-bold text-secondary text-lg">Total Bayar</span>
                <span className="font-bold text-primary text-2xl">{formatRupiah(summary.total)}</span>
              </div>
              <button disabled={loading} className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50">
                {loading ? 'Memproses...' : form.paymentMethod === 'Wallet LocalMart' ? 'Bayar Sekarang' : 'Buat Pesanan'}
              </button>
              <div className="mt-6 space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2"><Shield className="h-3 w-3" /> Keamanan transaksi terjamin</div>
                <div className="flex items-center gap-2"><Truck className="h-3 w-3" /> Pengiriman LocalMart Express area Bandung</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, inputMode = 'text' }) {
  return (
    <label>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode={inputMode} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40" />
    </label>
  )
}

function SummaryRow({ label, value, negative = false }) {
  return (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={negative ? 'font-semibold text-green-600' : 'font-semibold text-secondary'}>
        {negative && value > 0 ? '-' : ''}{formatRupiah(value)}
      </span>
    </div>
  )
}
