import { Mail, Phone, MapPin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-secondary text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="gradient-bg w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <h3 className="text-xl font-bold">LocalMart</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Platform belanja produk lokal terpercaya. Dukung UMKM Indonesia.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-primary transition text-sm bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary">
                <span className="text-xs font-bold">f</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition text-sm bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary">
                <span className="text-xs font-bold">X</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition text-sm bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary">
                <span className="text-xs font-bold">in</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Menu</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/products" className="hover:text-primary transition">Belanja</a></li>
              <li><a href="#" className="hover:text-primary transition">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-primary transition">Karir</a></li>
              <li><a href="#" className="hover:text-primary transition">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-primary transition">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-primary transition">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-primary transition">Syarat & Ketentuan</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-3 group">
                <Mail className="h-4 w-4 group-hover:text-primary transition" />
                <span>support@localmart.com</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="h-4 w-4 group-hover:text-primary transition" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3 group">
                <MapPin className="h-4 w-4 group-hover:text-primary transition" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 LocalMart. Made with <Heart className="h-3 w-3 text-red-500 inline" /> for UMKM Indonesia</p>
          <p className="mt-1 text-xs opacity-50">API: https://localmart-backend-fbyw.onrender.com</p>
        </div>
      </div>
    </footer>
  )
}