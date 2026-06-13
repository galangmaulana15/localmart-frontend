import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ShoppingBag, Heart, ShoppingCart, Wallet, Store, User, LogOut, Menu, X, Search, Sparkles } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAuthenticated, isSeller, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Ambil nama dari user (support full_name atau name)
  const getUserName = () => {
    return user?.full_name || user?.name || 'User'
  }

  const getUserInitial = () => {
    const name = getUserName()
    return name.charAt(0).toUpperCase()
  }

  const getFirstName = () => {
    const name = getUserName()
    return name.split(' ')[0]
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled ? 'glass-effect shadow-lg' : 'bg-white/95 backdrop-blur-sm shadow-sm'
    }`}>
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <ShoppingBag className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold gradient-text">LocalMart</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk favoritmu..."
                className="w-full px-4 py-2.5 pl-12 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-gray-50 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition" />
            </div>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-dark hover:text-primary transition font-medium">Belanja</Link>
            
            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="text-dark hover:text-primary transition-transform hover:scale-110">
                  <Heart className="h-5 w-5" />
                </Link>
                <Link to="/cart" className="text-dark hover:text-primary transition-transform hover:scale-110 relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/wallet" className="text-dark hover:text-primary">
                  <Wallet className="h-5 w-5" />
                </Link>
                <Link to="/my-orders" className="text-dark hover:text-primary font-medium">Pesanan</Link>
              </>
            )}
            
            {isSeller && (
              <Link to="/seller/dashboard" className="flex items-center gap-1 text-dark hover:text-primary">
                <Store className="h-4 w-4" />
                <span>Toko</span>
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/admin/dashboard" className="text-dark hover:text-primary">Admin</Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 ml-3 pl-3 border-l border-gray-200">
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md">
                    {getUserInitial()}
                  </div>
                  <span className="text-sm text-dark font-medium">{getFirstName()}</span>
                </div>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-5 py-2 text-primary border-2 border-primary rounded-full hover:gradient-bg hover:text-white hover:border-transparent transition-all duration-300 font-medium">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2 gradient-bg text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium">
                  Daftar Gratis
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slide-up">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>
            <div className="flex flex-col space-y-3">
              <Link to="/products" className="py-2 text-dark font-medium" onClick={() => setMobileMenuOpen(false)}>Belanja</Link>
              {isAuthenticated && (
                <>
                  <Link to="/wishlist" className="py-2" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
                  <Link to="/cart" className="py-2" onClick={() => setMobileMenuOpen(false)}>Keranjang</Link>
                  <Link to="/wallet" className="py-2" onClick={() => setMobileMenuOpen(false)}>Dompet</Link>
                  <Link to="/my-orders" className="py-2" onClick={() => setMobileMenuOpen(false)}>Pesanan Saya</Link>
                </>
              )}
              {isSeller && <Link to="/seller/dashboard" className="py-2" onClick={() => setMobileMenuOpen(false)}>Dashboard Seller</Link>}
              {isAdmin && <Link to="/admin/dashboard" className="py-2" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" className="py-2 text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="py-2 text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>Daftar</Link>
                </div>
              ) : (
                <button onClick={handleLogout} className="py-2 text-red-500 text-left font-medium">Logout</button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}