import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/useToast'
import {
  Store, ShoppingCart, Heart, Wallet, LogOut, User, Menu, X, 
  ChevronDown, Package, Box
} from 'lucide-react'
import CartSlideOver from '../components/cart/CartSlideOver'

export default function Navbar() {
  const { user, isAuthenticated, isSeller, isCustomer, logout, avatar } = useAuth()
  const [openMobile, setOpenMobile] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const [openCart, setOpenCart] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenProfile(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Berhasil logout!')
    navigate('/login')
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-md' : 'bg-gradient-to-r from-secondary/90 to-secondary/80 backdrop-blur-sm'}`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 md:w-10 md:h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Store className="h-5 w-5 md:h-5.5 md:w-5.5 text-white" />
              </div>
              <span className={`text-xl md:text-2xl font-bold tracking-tight ${scrolled ? 'text-secondary' : 'text-white'}`}>
                Local<span className="gradient-text">Mart</span>
              </span>
            </Link>

            {/* DESKTOP */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {[
                { to: '/products', label: 'Products', icon: Box },
                isCustomer && { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: 0 },
                isCustomer && { to: '/my-orders', label: 'Orders', icon: Package },
                isCustomer && { to: '/wallet', label: 'Wallet', icon: Wallet },
                isSeller && { to: '/seller/dashboard', label: 'Seller', icon: Store },
              ].filter(Boolean).map((item) => (
                <Link key={item.to} to={item.to} className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 ${scrolled ? 'text-secondary hover:bg-primary hover:text-white hover:shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/15'}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
              {isCustomer && (
                <button onClick={() => setOpenCart(true)} className={`relative p-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${scrolled ? 'text-secondary hover:bg-primary hover:text-white hover:shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/15'}`}>
                  <ShoppingCart className="h-5 w-5" />
                </button>
              )}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setOpenProfile(!openProfile)} className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-300 ${scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/15'}`}>
                    {avatar ? (
                      <img src={avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white/60 object-cover" />
                    ) : (
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white/60">{user?.full_name?.charAt(0) || 'U'}</div>
                    )}
                    <span className={`hidden lg:inline text-sm font-medium ${scrolled ? 'text-secondary' : 'text-white'}`}>{user?.full_name || 'User'}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openProfile ? 'rotate-180' : ''} ${scrolled ? 'text-secondary' : 'text-white/70'}`} />
                  </button>
                  {openProfile && (
                    <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border overflow-hidden ${scrolled ? 'bg-white border-gray-100' : 'bg-white/95 backdrop-blur-xl border-white/20'} animate-scale-in`}>
                      <div className={`p-4 border-b ${scrolled ? 'border-gray-100' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold">{user?.full_name?.charAt(0) || 'U'}</div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-secondary">{user?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        {[
                          { to: '/profile', icon: User, label: 'Profile' },
                          isCustomer && { to: '/wallet', icon: Wallet, label: 'Wallet' },
                          isCustomer && { to: '/my-orders', icon: Package, label: 'Pesanan' },
                          isCustomer && { to: '/wishlist', icon: Heart, label: 'Wishlist' },
                          isSeller && { to: '/seller/dashboard', icon: Store, label: 'Dashboard Seller' },
                          isSeller && { to: '/seller/products', icon: Box, label: 'Kelola Produk' },
                        ].filter(Boolean).map((item) => (
                          <Link key={item.to} to={item.to} onClick={() => setOpenProfile(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-200 group">
                            <item.icon className="h-4.5 w-4.5 text-gray-400 group-hover:text-primary transition-colors" />
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all w-full group">
                            <LogOut className="h-4.5 w-4.5 text-red-400 group-hover:text-red-600 transition-colors" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${scrolled ? 'text-secondary hover:bg-gray-100' : 'text-white/80 hover:text-white hover:bg-white/15'}`}>
                    Masuk
                  </Link>
                  <Link to="/register" className="gradient-bg text-white px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300">
                    Daftar
                  </Link>
                </div>
              )}
              <button onClick={() => setOpenMobile(true)} className={`md:hidden p-2.5 rounded-xl transition-all duration-300 ${scrolled ? 'text-secondary hover:bg-gray-100' : 'text-white/70 hover:text-white hover:bg-white/15'}`}>
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE */}
      {openMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setOpenMobile(false)}></div>
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-slide-in overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Link to="/" onClick={() => setOpenMobile(false)} className="flex items-center gap-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center shadow"><Store className="h-4.5 w-4.5 text-white" /></div>
                <span className="text-lg font-bold">Local<span className="gradient-text">Mart</span></span>
              </Link>
              <button onClick={() => setOpenMobile(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><X className="h-4 w-4 text-gray-500" /></button>
            </div>
            {isAuthenticated && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                  ) : (
                    <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-xl">{user?.full_name?.charAt(0) || 'U'}</div>
                  )}
                  <div>
                    <p className="font-semibold text-secondary">{user?.full_name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="p-3 space-y-1">
              {[
                { to: '/products', label: 'Products', icon: ShoppingCart },
                { to: '/wishlist', label: 'Wishlist', icon: Heart },
                { to: '/my-orders', label: 'Orders', icon: Package },
                { to: '/wallet', label: 'Wallet', icon: Wallet },
                { to: '/profile', label: 'Profile', icon: User },
                isSeller && { to: '/seller/dashboard', label: 'Seller Dashboard', icon: Store },
              ].filter(Boolean).map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpenMobile(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary/10 hover:text-primary transition-all font-medium">
                  <item.icon className="h-5 w-5 text-gray-400" />
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button onClick={() => { setOpenMobile(false); handleLogout() }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium w-full">
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              )}
            </div>
            {!isAuthenticated && (
              <div className="p-4 space-y-3">
                <Link to="/login" onClick={() => setOpenMobile(false)} className="block w-full text-center border border-gray-200 rounded-xl py-3 font-semibold text-secondary hover:bg-gray-50 transition">Masuk</Link>
                <Link to="/register" onClick={() => setOpenMobile(false)} className="block w-full text-center gradient-bg text-white rounded-xl py-3 font-semibold hover:shadow-xl transition">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <CartSlideOver isOpen={openCart} onClose={() => setOpenCart(false)} />
    </>
  )
}
