import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { ShoppingBag, User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10,13}$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Nama lengkap wajib diisi')
      return
    }

    if (fullName.trim().length < 3) {
      setError('Nama lengkap minimal 3 karakter')
      return
    }

    if (!email.trim()) {
      setError('Email wajib diisi')
      return
    }

    if (!isValidEmail(email.trim())) {
      setError('Format email tidak valid')
      return
    }

    if (phone.trim() && !isValidPhone(phone.trim())) {
      setError('Nomor handphone harus 10-13 digit dan hanya angka')
      return
    }

    if (!password.trim()) {
      setError('Password wajib diisi')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak sama')
      return
    }

    setLoading(true)

    try {
      const requestData = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        ...(phone.trim() && { phone: phone.trim() })
      }

      await authService.register(requestData)

      setSuccess('Pendaftaran berhasil! Silakan login.')

      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Pendaftaran berhasil! Silakan login.'
          }
        })
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Pendaftaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-h-screen flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="gradient-bg rounded-2xl p-3">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-secondary">Daftar Akun</h2>
          <p className="text-gray-500 mt-2">Bergabung dengan LocalMart sekarang</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Nama lengkap Anda"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="contoh: nama@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No. Handphone <span className="text-gray-400 text-xs">(Opsional)</span>
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="081234567890"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Minimal 6 karakter"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Ulangi password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}