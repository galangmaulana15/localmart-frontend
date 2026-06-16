import { Wallet, Shield } from 'lucide-react'
import { formatRupiah } from '../../utils/formatRupiah'

export default function WalletCard({ balance = 0, subtitle = 'Gunakan saldo untuk pembayaran pesanan LocalMart.' }) {
  return (
    <section className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-xl animate-fade-in" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #F97316 100%)' }}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-4 right-4 opacity-[0.04]">
        <Wallet className="h-32 w-32" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <Wallet className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/60 font-medium">LocalMart Wallet</p>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-1">Saldo tersedia</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">{formatRupiah(balance)}</h2>

        <div className="flex items-center gap-2 mt-4">
          <Shield className="h-3.5 w-3.5 text-accent" />
          <p className="text-xs text-white/60">Transaksi aman & terpercaya</p>
        </div>
        <p className="mt-3 text-sm text-white/70 max-w-md leading-relaxed">{subtitle}</p>
      </div>
    </section>
  )
}
