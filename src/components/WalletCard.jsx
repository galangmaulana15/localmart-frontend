import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getWallet } from '../utils/demoStore'
import { formatRupiah } from '../utils/formatRupiah'

export default function WalletCard() {
  const { user } = useAuth()
  const wallet = getWallet(user)

  const income = (wallet.transactions || [])
    .filter(t => t.type === 'topup')
    .reduce((acc, t) => acc + (t.amount || 0), 0)

  const expense = (wallet.transactions || [])
    .filter(t => t.type === 'payment')
    .reduce((acc, t) => acc + (t.amount || 0), 0)

  return (
    <div className="panel rounded-3xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg"><Wallet className="h-6 w-6 text-white" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold text-secondary">Rp {formatRupiah(wallet.balance)}</p>
            </div>
          </div>
          <a href="/wallet" className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200">
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Pemasukan</p>
              <p className="text-sm font-bold text-green-600">+Rp {formatRupiah(income)}</p>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"><TrendingDown className="h-4 w-4 text-red-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Pengeluaran</p>
              <p className="text-sm font-bold text-red-600">-Rp {formatRupiah(expense)}</p>
            </div>
          </div>
        </div>
        <a href="/wallet" className="mt-4 flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-500 hover:border-primary hover:text-primary transition-all group">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" /> Top Up Wallet
        </a>
      </div>
    </div>
  )
}
