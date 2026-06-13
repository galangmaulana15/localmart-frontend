import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import RootLayout from './components/layout/RootLayout'
import PrivateRoute from './components/PrivateRoute'
import { lazy, Suspense } from 'react'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProductListPage = lazy(() => import('./pages/ProductListPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'))
const WalletPage = lazy(() => import('./pages/WalletPage'))
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'))
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            
            {/* Customer Routes */}
            <Route element={<PrivateRoute allowedRoles={['customer', 'admin']} />}>
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="my-orders" element={<MyOrdersPage />} />
              <Route path="wallet" element={<WalletPage />} />
            </Route>
            
            {/* Seller Routes */}
            <Route element={<PrivateRoute allowedRoles={['seller', 'admin']} />}>
              <Route path="seller/dashboard" element={<SellerDashboard />} />
              <Route path="seller/products" element={<SellerProducts />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App