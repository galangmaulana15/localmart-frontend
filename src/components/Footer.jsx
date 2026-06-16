import { Link } from 'react-router-dom'
import { 
  Store, Mail, MapPin, Phone, 
  Facebook, Twitter, Instagram, Youtube, Heart
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-secondary relative overflow-hidden pt-16">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Store className="h-5.5 w-5.5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Local<span className="gradient-text">Mart</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Platform e-commerce kebanggaan Bandung. Menghubungkan UMKM lokal dengan pembeli di seluruh Indonesia sejak 2024.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Youtube, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:shadow-lg hover:scale-110 transition-all duration-300 border border-white/5">
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-5 text-lg">Menu</h3>
            <ul className="space-y-3">
              {[
                { to: '/products', label: 'Semua Produk' },
                { to: '/products?category=Fashion', label: 'Fashion' },
                { to: '/products?category=Elektronik', label: 'Elektronik' },
                { to: '/products?category=Makanan', label: 'Makanan & Minuman' },
                { to: '/products?category=Kesehatan', label: 'Kesehatan' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-5 text-lg">Bantuan</h3>
            <ul className="space-y-3">
              {[
                { to: '#', label: 'Pusat Bantuan' },
                { to: '#', label: 'Kebijakan Privasi' },
                { to: '#', label: 'Syarat & Ketentuan' },
                { to: '#', label: 'Cara Belanja' },
                { to: '#', label: 'Pengembalian Barang' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.to} className="text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-5 text-lg">Kontak</h3>
            <ul className="space-y-4">
              {[
                { icon: MapPin, label: 'Jl. Merdeka No. 123, Bandung, Jawa Barat 40111' },
                { icon: Phone, label: '(022) 1234-5678' },
                { icon: Mail, label: 'hello@localmart.id' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-gray-400 text-sm">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © 2025 LocalMart. All rights reserved. Built with <Heart className="inline h-3.5 w-3.5 text-red-500 fill-red-500" /> for Bandung.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
            <a href="#" className="hover:text-white transition">Terms</a>
            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
            <a href="#" className="hover:text-white transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
