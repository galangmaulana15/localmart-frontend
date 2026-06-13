import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { formatRupiah, getImageUrl } from '../utils/formatRupiah'
import { 
  ShoppingBag, Truck, Shield, Clock, ArrowRight, Star, TrendingUp, 
  Sparkles, Users, Award, Zap, ChevronRight, Play, Gift, 
  CreditCard, Headphones, Rocket, Crown, Gem, Wallet
} from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'


export default function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  
  const { ref: heroRef, isRevealed: heroRevealed } = useScrollReveal()
  const { ref: featuresRef, isRevealed: featuresRevealed } = useScrollReveal()

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const res = await productService.getFeatured()
      console.log('API Response:', res)
      
      // Handle berbagai format response
      let products = []
      if (res.data && Array.isArray(res.data)) {
        products = res.data
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        products = res.data.data
      } else if (Array.isArray(res)) {
        products = res
      }
      
      console.log('Featured products loaded:', products.length)
      setFeaturedProducts(products)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      // Fallback data dengan gambar yang pasti tampil
      setFeaturedProducts([
        { id: 1, name: 'Smartphone Samsung Galaxy S23', price: 12999000, image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', rating: 4.9, sold: 1234 },
        { id: 2, name: 'Headphone Sony WH-1000XM5', price: 4999000, image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', rating: 4.8, sold: 892 },
        { id: 3, name: 'iPad Pro 12.9 inch', price: 19999000, image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', rating: 4.9, sold: 567 },
        { id: 4, name: 'MacBook Pro M3', price: 24999000, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', rating: 4.9, sold: 2341 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const testimonials = [
    { name: 'Sarah Wijaya', role: 'Fashion Enthusiast', image: 'https://randomuser.me/api/portraits/women/68.jpg', text: 'Gak nyangka belanja di LocalMart semudah ini! Produknya original, pengiriman cepat, dan CS nya ramah banget. Jadi langganan deh!', rating: 5 },
    { name: 'Budi Santoso', role: 'Seller UMKM', image: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'Sejak gabung LocalMart, omzet toko saya naik 300%! Fiturna lengkap dan mudah digunakan. Terima kasih LocalMart!', rating: 5 },
    { name: 'Ayu Lestari', role: 'Beauty Vlogger', image: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'Rekomendasi banget buat yang suka belanja online. Sistem walletnya memudahkan transaksi, dan promo nya selalu menarik!', rating: 5 },
    { name: 'Rizki Pratama', role: 'Tech Reviewer', image: 'https://randomuser.me/api/portraits/men/45.jpg', text: 'Sebagai tech reviewer, saya butuh platform yang reliable. LocalMart memberikan pengalaman belanja yang premium dan terpercaya.', rating: 5 },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const categories = [
    { name: 'Elektronik', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', icon: '📱', count: '1.234' },
    { name: 'Fashion Pria', image: 'https://images.unsplash.com/photo-1617137968427-85924c8006f8?w=400', icon: '👔', count: '2.567' },
    { name: 'Fashion Wanita', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400', icon: '👗', count: '3.456' },
    { name: 'Makanan', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', icon: '🍕', count: '892' },
    { name: 'Kecantikan', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', icon: '💄', count: '1.789' },
    { name: 'Olahraga', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', icon: '⚽', count: '654' },
  ]

  return (
    <div className="overflow-x-hidden">
      
      {/* HERO SECTION - Premium dengan Video Style Background */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-primary/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-float"></div>
          </div>
          {/* Decorative Grid */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`text-white transition-all duration-700 ${heroRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`} ref={heroRef}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-bounce-slow">
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                <span className="text-sm font-medium">🔥 #BelanjaLokalBanggaIndonesia</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                Belanja Lokal{' '}
                <span className="gradient-text">Lebih Mudah</span>
                <br />
                & Lebih Hemat
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
                Temukan ribuan produk berkualitas dari UMKM Indonesia. 
                Belanja aman, pengiriman cepat, dan dukung ekonomi lokal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="gradient-bg text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2 group">
                  Mulai Belanja <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                </Link>
                <Link to="/register" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 text-center">
                  Jadi Penjual
                </Link>
              </div>
              
              {/* Stats dengan animasi */}
              <div className="flex gap-8 mt-12">
                <div className="text-center group cursor-pointer">
                  <div className="text-3xl font-bold text-accent group-hover:scale-110 transition transform">10K+</div>
                  <div className="text-sm text-white/70">Produk</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="text-3xl font-bold text-accent group-hover:scale-110 transition transform">5K+</div>
                  <div className="text-sm text-white/70">Penjual</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="text-3xl font-bold text-accent group-hover:scale-110 transition transform">50K+</div>
                  <div className="text-sm text-white/70">Pembeli</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image Animation */}
            <div className="relative hidden lg:block animate-float">
              <div className="relative">
                <div className="gradient-bg rounded-3xl p-2 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600"
                    alt="Shopping Experience"
                    className="rounded-2xl w-full object-cover"
                  />
                </div>
                {/* Floating Cards */}
                <div className="absolute -top-5 -right-5 bg-white rounded-xl shadow-xl p-3 flex items-center gap-3 animate-bounce-slow">
                  <div className="bg-accent rounded-full p-2">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Diskon</p>
                    <p className="font-bold text-accent">Up to 70%</p>
                  </div>
                </div>
                <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-xl p-3 flex items-center gap-3 animate-float-delayed">
                  <div className="gradient-bg rounded-full p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pengguna</p>
                    <p className="font-bold text-primary">50,000+</p>
                  </div>
                </div>
                <div className="absolute top-1/2 -left-10 bg-white rounded-xl shadow-xl p-3 animate-pulse-slow">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-bold text-sm">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Category Section - Dengan Foto Real */}
      <section className="py-20 bg-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-primary text-sm font-medium">Kategori Populer</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Jelajahi <span className="gradient-text">Kategori</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Temukan produk favoritmu dari berbagai kategori menarik
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                to={`/products?category=${cat.name}`} 
                className="group animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 text-3xl drop-shadow-lg">{cat.icon}</div>
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-secondary text-sm">{cat.name}</h3>
                    <p className="text-xs text-gray-400">{cat.count}+ produk</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Dengan API Real */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
                <Rocket className="h-4 w-4 text-accent" />
                <span className="text-accent text-sm font-medium">Best Seller</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Produk <span className="gradient-text">Terlaris</span>
              </h2>
              <p className="text-gray-500">Pilihan terbaik dari ribuan produk</p>
            </div>
            <Link to="/products" className="flex items-center gap-2 text-primary hover:gap-3 transition-all group">
              Lihat Semua <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-shimmer"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.isArray(featuredProducts) && featuredProducts.map((product, i) => (
                <Link 
                  key={product.id || i} 
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img 
                      src={getImageUrl(product.image_url, product.name)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/400x400?text=${encodeURIComponent(product.name || 'Product')}&bg=FF6B35&textColor=white`
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-accent text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Best
                    </div>
                    <button className="absolute bottom-3 right-3 bg-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-secondary line-clamp-1">{product.name}</h3>
                    <p className="text-primary font-bold text-xl mt-1">
                      {formatRupiah(product.price || 0)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="text-sm text-gray-600">{product.rating || 4.9}</span>
                      </div>
                      <span className="text-xs text-gray-400">| Terjual {product.sold || 0}+</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Premium Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-accent/5">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Gem className="h-4 w-4 text-primary" />
              <span className="text-primary text-sm font-medium">Keunggulan Kami</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kenapa Pilih <span className="gradient-text">LocalMart?</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Kami hadir untuk memudahkan belanja produk lokal dengan pengalaman terbaik
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShoppingBag, title: 'Produk Lokal', desc: 'Dukung UMKM Indonesia', gradient: 'from-primary to-orange-500', delay: 0 },
              { icon: Shield, title: 'Aman & Terpercaya', desc: 'Transaksi 100% aman', gradient: 'from-accent to-teal-500', delay: 100 },
              { icon: Truck, title: 'Pengiriman Cepat', desc: 'Seluruh Indonesia', gradient: 'from-primary to-orange-500', delay: 200 },
              { icon: Headphones, title: '24/7 Support', desc: 'CS siap membantu', gradient: 'from-accent to-teal-500', delay: 300 },
            ].map((item, i) => (
              <div 
                key={i} 
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center border border-gray-100 animate-fade-in"
                style={{ animationDelay: `${item.delay}ms` }}
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section dengan Foto Real & Animasi */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
              <Users className="h-4 w-4 text-accent" />
              <span className="text-accent text-sm font-medium">Testimoni</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Apa Kata <span className="gradient-text">Mereka?</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Ribuan pengguna telah bergabung dan merasakan kemudahan berbelanja di LocalMart
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Background Decoration */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl"></div>
              
              <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-10 shadow-xl">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <img 
                      src={testimonials[activeTestimonial].image} 
                      alt={testimonials[activeTestimonial].name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl mb-4 animate-zoom-in"
                    />
                    <div className="absolute -bottom-2 -right-2 gradient-bg rounded-full p-1">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                  <p className="text-lg text-gray-700 mb-6 italic leading-relaxed max-w-2xl">
                    "{testimonials[activeTestimonial].text}"
                  </p>
                  <h4 className="font-bold text-secondary text-xl">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-gray-500">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeTestimonial === i ? 'w-8 bg-primary' : 'w-2 bg-gray-300 hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid 2 - Kelebihan lainnya */}
      <section className="py-20 bg-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="gradient-bg rounded-3xl p-2 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
                  alt="Happy Shopping"
                  className="rounded-2xl w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 animate-float">
                <div className="gradient-bg rounded-full p-2">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Metode Pembayaran</p>
                  <p className="font-bold text-primary">Lengkap & Aman</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-primary text-sm font-medium">Kelebihan Lainnya</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Pengalaman Belanja <span className="gradient-text">Tanpa Ribet</span>
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="gradient-bg rounded-full p-2 h-10 w-10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary">Dompet Digital</h4>
                    <p className="text-gray-500 text-sm">Top up dan transaksi mudah dengan wallet LocalMart</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="gradient-bg rounded-full p-2 h-10 w-10 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary">Voucher & Promo</h4>
                    <p className="text-gray-500 text-sm">Dapatkan diskon dan cashback setiap hari</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="gradient-bg rounded-full p-2 h-10 w-10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary">Pengembalian Mudah</h4>
                    <p className="text-gray-500 text-sm">Garansi uang kembali jika produk tidak sesuai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner dengan Background Image */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1607082350899-5e1055f0bb82?w=1600"
            alt="Shopping Together"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-bg opacity-90"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center text-white py-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Zap className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-sm font-medium">Promo Spesial!</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-float">Siap Jadi Bagian dari LocalMart?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan seller dan buyer di platform terpercaya
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary px-8 py-3.5 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 group">
                Daftar Sekarang <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link to="/products" className="border-2 border-white text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
                Lihat Produk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container-custom">
          <p className="text-center text-gray-400 text-sm mb-6">Dipercaya oleh ribuan brand ternama</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Samsung', 'Apple', 'Unilever', 'Wings', 'Indofood'].map((brand, i) => (
              <div key={i} className="text-xl md:text-2xl font-bold text-gray-300 hover:text-primary transition-all duration-300 hover:scale-110 cursor-pointer">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}