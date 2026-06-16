import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ShoppingBag, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Ambil pesan sukses dari location state (misal dari register atau verify OTP)
    if (location.state?.message) {
      queueMicrotask(() => {
        setSuccess(location.state.message)
        // Hapus state agar tidak muncul lagi saat refresh
        window.history.replaceState({}, document.title)
      })
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    console.log('Login form values:', { email, password })
    
    if (!email || email.trim() === '') {
      setError('Email wajib diisi')
      return
    }
    
    if (!password || password.trim() === '') {
      setError('Password wajib diisi')
      return
    }
    
    setLoading(true)
    
    try {
      const result = await login(email.trim(), password)
      console.log('Login success:', result)
      
      const roleId = result?.data?.user?.role_id || result?.user?.role_id
      navigate(roleId === 2 ? '/seller/dashboard' : '/')
    } catch (err) {
      console.error('Login error:', err)
      
      let errorMessage = 'Email atau password salah'
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      
      setError(errorMessage)
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
          <h2 className="text-3xl font-bold text-secondary">Selamat Datang Kembali</h2>
          <p className="text-gray-500 mt-2">Masuk ke akun LocalMart Anda</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="masukkan@email.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
          
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-primary transition">
              Lupa password?
            </Link>
          </div>
          
          <p className="text-center mt-6 text-gray-500">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
