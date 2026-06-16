import { Mail, Phone, MapPin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,94,139,0.12),transparent_30%)]"></div>
      <div className="container-custom relative py-14">
        <div className="mb-10 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                LocalMart
              </div>
              <h3 className="text-2xl font-black tracking-tight md:text-3xl">Belanja produk lokal dengan pengalaman yang lebih rapi dan modern.</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                LocalMart dibuat untuk mendukung UMKM dengan alur belanja yang jelas, cepat, dan nyaman di semua perangkat.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/products" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-secondary shadow-sm transition hover:-translate-y-0.5 hover:bg-primary hover:text-white">
                Mulai Belanja
              </a>
              <a href="/wallet" className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10">
                Buka Wallet
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="gradient-bg flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg">
                <span className="text-xl font-black text-white">L</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">LocalMart</h3>
            </div>
            <p className="text-sm leading-6 text-white/65">
              Platform belanja produk lokal terpercaya. Dukung UMKM Indonesia.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-white">
                <span className="text-xs font-bold">f</span>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-white">
                <span className="text-xs font-bold">X</span>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-white">
                <span className="text-xs font-bold">in</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white/60">Menu</h4>
            <ul className="space-y-3 text-sm text-white/65">
              <li><a href="/products" className="transition hover:text-white">Belanja</a></li>
              <li><a href="#" className="transition hover:text-white">Tentang Kami</a></li>
              <li><a href="#" className="transition hover:text-white">Karir</a></li>
              <li><a href="#" className="transition hover:text-white">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white/60">Bantuan</h4>
            <ul className="space-y-3 text-sm text-white/65">
              <li><a href="#" className="transition hover:text-white">Pusat Bantuan</a></li>
              <li><a href="#" className="transition hover:text-white">Kebijakan Privasi</a></li>
              <li><a href="#" className="transition hover:text-white">Syarat & Ketentuan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white/60">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm text-white/65">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@localmart.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          <p>© 2024 LocalMart. Made with <Heart className="inline h-3 w-3 text-red-400" /> for UMKM Indonesia</p>
          <p className="mt-2 text-xs">API: https://localmart-backend-fbyw.onrender.com</p>
        </div>
      </div>
    </footer>
  )
}
