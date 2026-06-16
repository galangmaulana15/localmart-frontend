import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getWallet, addWalletTransaction } from '../utils/demoStore'
import { useToast } from '../components/ui/useToast'
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Copy, Check, Smartphone, CreditCard, Zap, ClipboardList } from 'lucide-react'
import { formatRupiah } from '../utils/formatRupiah'

const TOP_UP_METHODS = [
  {
    value: 'wallet-localmart',
    label: 'Wallet LocalMart',
    shortLabel: 'Wallet',
    icon: WalletIcon,
    accountNumber: '0812 3456 7890',
    steps: [
      'Pilih Wallet LocalMart sebagai tujuan top up.',
      'Masukkan nominal yang ingin ditambahkan.',
      'Konfirmasi top up agar saldo Wallet LocalMart bertambah.',
    ],
  },
  {
    value: 'bca-va',
    label: 'BCA Virtual Account',
    shortLabel: 'BCA VA',
    icon: CreditCard,
    accountNumber: '8080 1234 5678 9012',
    steps: [
      'Buka BCA mobile, myBCA, KlikBCA, atau ATM BCA.',
      'Pilih menu Transfer Virtual Account.',
      'Masukkan nomor Virtual Account LocalMart.',
      'Masukkan nominal top up sesuai pilihan.',
      'Konfirmasi pembayaran, saldo Wallet LocalMart akan bertambah.',
    ],
  },
  {
    value: 'bri-va',
    label: 'BRI Virtual Account',
    shortLabel: 'BRI VA',
    icon: CreditCard,
    accountNumber: '7777 1234 5678 9012',
    steps: [
      'Buka BRImo, Internet Banking BRI, atau ATM BRI.',
      'Pilih menu BRIVA.',
      'Masukkan nomor BRIVA LocalMart.',
      'Masukkan nominal top up.',
      'Konfirmasi pembayaran sampai transaksi berhasil.',
    ],
  },
  {
    value: 'bni-va',
    label: 'BNI Virtual Account',
    shortLabel: 'BNI VA',
    icon: CreditCard,
    accountNumber: '8881 1234 5678 9012',
    steps: [
      'Buka BNI Mobile Banking atau ATM BNI.',
      'Pilih menu Virtual Account Billing.',
      'Masukkan nomor Virtual Account LocalMart.',
      'Masukkan nominal top up.',
      'Selesaikan pembayaran dan cek saldo wallet.',
    ],
  },
  {
    value: 'mandiri-va',
    label: 'Mandiri Virtual Account',
    shortLabel: 'Mandiri VA',
    icon: CreditCard,
    accountNumber: '8899 1234 5678 9012',
    steps: [
      'Buka Livin by Mandiri atau ATM Mandiri.',
      'Pilih menu Bayar lalu Virtual Account.',
      'Masukkan nomor Virtual Account LocalMart.',
      'Masukkan nominal top up.',
      'Konfirmasi pembayaran.',
    ],
  },
  {
    value: 'dana',
    label: 'Dana',
    shortLabel: 'Dana',
    icon: Smartphone,
    accountNumber: '0812 3456 7890',
    steps: [
      'Buka aplikasi Dana.',
      'Pilih Kirim atau Send Money.',
      'Masukkan nomor e-wallet LocalMart.',
      'Masukkan nominal top up.',
      'Konfirmasi pembayaran di aplikasi Dana.',
    ],
  },
  {
    value: 'gopay',
    label: 'GoPay',
    shortLabel: 'GoPay',
    icon: Smartphone,
    accountNumber: '0812 3456 7890',
    steps: [
      'Buka aplikasi Gojek atau GoPay.',
      'Pilih Bayar atau Kirim.',
      'Masukkan nomor e-wallet LocalMart.',
      'Masukkan nominal top up.',
      'Konfirmasi pembayaran.',
    ],
  },
  {
    value: 'shopeepay',
    label: 'ShopeePay',
    shortLabel: 'ShopeePay',
    icon: Smartphone,
    accountNumber: '0812 3456 7890',
    steps: [
      'Buka aplikasi Shopee.',
      'Masuk ke ShopeePay lalu pilih Transfer.',
      'Masukkan nomor e-wallet LocalMart.',
      'Masukkan nominal top up.',
      'Konfirmasi pembayaran.',
    ],
  },
]

export default function WalletPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [showTopUp, setShowTopUp] = useState(false)
  const [amount, setAmount] = useState('')
  const [topUpMethod, setTopUpMethod] = useState('')
  const [copied, setCopied] = useState(false)

  const wallet = getWallet(user)
  const selectedTopUpMethod = TOP_UP_METHODS.find((method) => method.value === topUpMethod)
  const walletAccountNumber = '0812 3456 7890'

  const topUpAmounts = [50000, 100000, 200000, 500000, 1000000]

  const handleTopUp = () => {
    const nominal = parseInt(amount.replace(/[^\d]/g, ''))
    if (!selectedTopUpMethod) {
      toast.error('Pilih metode top up terlebih dahulu')
      return
    }
    if (!nominal || nominal < 10000) {
      toast.error('Minimal top up Rp10.000')
      return
    }
    addWalletTransaction(user, {
      type: 'topup',
      amount: nominal,
      method: selectedTopUpMethod.label,
      description: `Top Up via ${selectedTopUpMethod.label}`,
      status: 'success',
    })
    toast.success(`Saldo Rp ${formatRupiah(nominal)} berhasil ditambahkan!`)
    setShowTopUp(false)
    setAmount('')
  }

  const openTopUpWithMethod = (methodValue = '') => {
    setTopUpMethod(methodValue)
    setShowTopUp(true)
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success('Tersalin!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const latestTransactions = [...(wallet.transactions || [])].reverse().slice(0, 5)

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-3">
            <WalletIcon className="h-4 w-4 text-primary" />
            <span className="text-primary text-xs font-semibold">Dompet Digital</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary">Wallet LocalMart</h1>
          <p className="text-gray-500 mt-1">Kelola saldo dan pembayaran Anda dengan mudah</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="panel relative overflow-hidden rounded-3xl p-6 md:p-8">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg"><WalletIcon className="h-6 w-6 text-white" /></div>
                    <div>
                      <p className="text-sm text-gray-500">Saldo Anda</p>
                      <p className="text-3xl font-bold text-secondary">Rp {formatRupiah(wallet.balance)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={() => setShowTopUp(true)} className="gradient-bg text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    <Plus className="h-4 w-4" /> Top Up
                  </button>
                  <Link to="/my-orders" className="border border-gray-200 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-primary transition-all duration-300">
                    <ClipboardList className="h-4 w-4" /> Pesanan Saya
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Nomor e-wallet LocalMart</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-secondary tracking-wider font-mono">{walletAccountNumber}</p>
                    <button onClick={() => handleCopy(walletAccountNumber)} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel rounded-3xl p-6">
              <h3 className="font-bold text-secondary mb-4">Riwayat Transaksi</h3>
              {latestTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <WalletIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">Belum ada transaksi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {latestTransactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'topup' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {tx.type === 'topup' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-secondary">{tx.description}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.date || tx.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'topup' ? '+' : '-'} Rp {formatRupiah(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel rounded-3xl p-6">
              <h3 className="font-bold text-secondary mb-4">Metode Top Up</h3>
              <div className="space-y-3">
                {TOP_UP_METHODS.map((m) => (
                  <button key={m.value} onClick={() => openTopUpWithMethod(m.value)} className="flex w-full items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all text-left">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600"><m.icon className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm font-semibold text-secondary">{m.label}</p>
                      <p className="text-xs text-gray-500">Klik untuk memilih metode top up</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel rounded-3xl p-6 bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-secondary">Promo Wallet</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Dapatkan cashback 5% setiap top up saldo minimal Rp100.000!</p>
              <button onClick={() => openTopUpWithMethod('')} className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Top Up Sekarang <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowTopUp(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary"></div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-secondary">Top Up Wallet</h3>
              <button onClick={() => setShowTopUp(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><X className="h-4 w-4 text-gray-500" /></button>
            </div>

            <p className="text-sm text-gray-500 mb-5">Pilih metode top up lalu isi nominal. Panel akan menampilkan detail metode yang sedang aktif.</p>

            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-2">Pilih metode top up</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOP_UP_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setTopUpMethod(method.value)}
                    className={`group flex items-center gap-3 rounded-2xl border p-3 text-left text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${topUpMethod === method.value ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-gray-200 text-gray-700 hover:border-primary/50 hover:shadow-sm'}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${topUpMethod === method.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                      <method.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate">{method.shortLabel}</p>
                      <p className="text-[11px] font-normal text-gray-400">{method.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedTopUpMethod ? (
              <div className="mb-5 overflow-hidden rounded-3xl border border-primary/10 bg-[linear-gradient(135deg,rgba(255,107,53,0.08)_0%,rgba(255,94,139,0.08)_100%)]">
                <div className="flex items-center justify-between bg-white/80 px-4 py-3 backdrop-blur">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {selectedTopUpMethod.label === 'Wallet LocalMart'
                        ? 'Wallet aktif'
                        : selectedTopUpMethod.label.includes('Virtual Account')
                          ? 'Virtual Account aktif'
                          : 'E-wallet aktif'}
                    </p>
                    <p className="text-sm font-semibold text-secondary">{selectedTopUpMethod.label}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Aktif</span>
                </div>
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        {selectedTopUpMethod.label === 'Wallet LocalMart'
                          ? 'Nomor Wallet'
                          : selectedTopUpMethod.label.includes('Virtual Account')
                            ? 'Nomor Virtual Account'
                            : 'Nomor e-wallet LocalMart'}
                      </p>
                      <p className="mt-1 text-2xl font-black tracking-wider text-secondary">{selectedTopUpMethod.accountNumber}</p>
                    </div>
                    <button type="button" onClick={() => handleCopy(selectedTopUpMethod.accountNumber)} className="rounded-2xl bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-primary hover:text-white">
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-white/70">
                      <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-primary to-accent"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-500">Siap dipakai</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-5 rounded-2xl border border-yellow-100 bg-yellow-50 p-4 text-sm font-medium text-yellow-700">
                Pilih metode top up dulu untuk melihat nomor tujuan dan cara pembayarannya.
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-5">
              {topUpAmounts.map((nominal) => (
                <button
                  key={nominal}
                  onClick={() => setAmount(nominal.toString())}
                  className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${parseInt(amount.replace(/[^\d]/g, '')) === nominal ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 hover:border-primary/50 text-gray-700'}`}
                >
                  Rp{nominal.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            <label className="block mb-5">
              <p className="text-xs text-gray-500 mb-1.5">Atau masukkan nominal</p>
              <div className="flex items-center bg-gray-50 rounded-xl px-4 border border-gray-200 focus-within:border-primary transition-all">
                <span className="text-gray-400 font-semibold">Rp</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full bg-transparent outline-none py-3 px-2 font-semibold"
                  placeholder="10.000"
                />
              </div>
            </label>

            <button onClick={handleTopUp} disabled={!selectedTopUpMethod} className="w-full gradient-bg text-white rounded-xl py-3 font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Top Up Rp {formatRupiah(parseInt(amount.replace(/[^\d]/g, '')) || 0)}
            </button>
            </div>
              <div className="hidden lg:block border-l border-gray-100 bg-gradient-to-b from-gray-50 to-white p-6 md:p-8">
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Preview metode</p>
                  <h4 className="mt-2 text-xl font-black text-secondary">{selectedTopUpMethod ? selectedTopUpMethod.shortLabel : 'Pilih metode'}</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedTopUpMethod
                      ? selectedTopUpMethod.steps[0]
                      : 'Pilih e-wallet atau VA untuk melihat tampilan detail top up.'}
                  </p>
                  <div className="mt-5 space-y-3">
                    {TOP_UP_METHODS.filter((item) => item.value === topUpMethod || !topUpMethod).slice(0, 4).map((item, index) => (
                      <div key={item.value} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${selectedTopUpMethod?.value === item.value ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50/70'}`}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${selectedTopUpMethod?.value === item.value ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-secondary truncate">{item.label}</p>
                          <p className="text-xs text-gray-400">Langkah {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function X({ className, onClick }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} onClick={onClick}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}
