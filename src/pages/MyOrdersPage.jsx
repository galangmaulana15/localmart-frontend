import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function PageName() {
  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition" /> Kembali
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-secondary mb-3">Halaman Sedang Dibangun</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Fitur ini sedang dalam pengembangan. Akan segera hadir untuk pengalaman terbaik Anda!
          </p>
          <Link to="/products" className="gradient-bg text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition inline-flex items-center gap-2">
            Mulai Belanja
          </Link>
        </div>
      </div>
    </div>
  )
}