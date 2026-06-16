import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { productService } from '../services/productService'
import { getApiData } from '../utils/formatRupiah'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import ProductCard from '../components/ui/ProductCard'
import { useAuth } from '../hooks/useAuth'
import {
  ShoppingBag, Truck, Shield, ArrowRight, Star,
  Sparkles, Users, Award, Zap, ChevronRight,
  Headphones, Rocket, Crown, Gem,
  ChevronLeft, Store
} from 'lucide-react'

const slides = [
  {
    title: 'Belanja Lokal Bandung',
    subtitle: 'Temukan produk时尚 dari UMKM Bandung terbaik',
    tag: '#BanggaBuatanIndonesia',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
    cta: 'Mulai Belanja',
    ctaLink: '/products',
  },
  {
    title: 'Gratis Ongkir Area Bandung',
    subtitle: 'Nikmati pengiriman gratis untuk setiap pembelian',
    tag: 'Promo Spesial',
    image: 'https://images.unsplash.com/photo-1553729459-afe8f2e3a5cb?w=1200&q=80',
    cta: 'Lihat Produk',
    ctaLink: '/products',
  },
  {
    title: 'Dukung UMKM Lokal',
    subtitle: 'Setiap pembelianmu membantu ribuan pengusaha lokal',
    tag: '#SemangatUMKM',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&q=80',
    cta: 'Jelajahi',
    ctaLink: '/products',
  },
]

const categories = [
  { name: 'Fashion', count: 120, image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400', color: 'from-pink-500 to-rose-500' },
  { name: 'Elektronik', count: 85, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', color: 'from-blue-500 to-cyan-500' },
  { name: 'Makanan', count: 200, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', color: 'from-orange-500 to-yellow-500' },
  { name: 'Kesehatan', count: 65, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', color: 'from-green-500 to-teal-500' },
  { name: 'Olahraga', count: 45, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', color: 'from-red-500 to-orange-500' },
  { name: 'Home & Living', count: 90, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400', color: 'from-purple-500 to-indigo-500' },
]

const trustedStores = [
  { name: 'Toko Fashion Bandung', products: 340, rating: 4.9, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200' },
  { name: 'Elektronik Jaya', products: 210, rating: 4.8, image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200' },
  { name: 'Kuliner Nusantara', products: 560, rating: 4.9, image: 'https://images.unsplash.com/photo-1504714146340-959ca07e1f38?w=200' },
  { name: 'Sport Center', products: 180, rating: 4.7, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200' },
]

export default function LandingPage() {
  const { isAuthenticated, isCustomer } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [flashProducts, setFlashProducts] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const [loading, setLoading] = useState(true)
  const [productError, setProductError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const flashRef = useRef(null)
  const recoRef = useRef(null)

  const testimonials = [
    { name: 'Sarah Wijaya', role: 'Fashion Enthusiast', image: 'https://randomuser.me/api/portraits/women/68.jpg', text: 'Gak nyangka belanja di LocalMart semudah ini! Produknya original, pengiriman cepat, dan CS nya ramah banget. Jadi langganan deh!', rating: 5 },
    { name: 'Budi Santoso', role: 'Seller UMKM', image: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'Sejak gabung LocalMart, omzet toko saya naik 300%! Fiturna lengkap dan mudah digunakan. Terima kasih LocalMart!', rating: 5 },
    { name: 'Ayu Lestari', role: 'Beauty Vlogger', image: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'Rekomendasi banget buat yang suka belanja online. Sistem walletnya memudahkan transaksi, dan promo nya selalu menarik!', rating: 5 },
    { name: 'Rizki Pratama', role: 'Tech Reviewer', image: 'https://randomuser.me/api/portraits/men/45.jpg', text: 'Sebagai tech reviewer, saya butuh platform yang reliable. LocalMart memberikan pengalaman belanja yang premium dan terpercaya.', rating: 5 },
  ]

  async function fetchData() {
    setProductError('')
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        productService.getFeatured(),
        productService.getCategories()
      ])
      const products = getApiData(productResponse, [])
      const cats = getApiData(categoryResponse, [])
      setFeaturedProducts(products)
      setFlashProducts(products.filter(p => p.discount || Math.random() > 0.5).slice(0, 8))
      setCategoryList(cats)
    } catch (error) {
      setProductError(error.response?.data?.message || 'Data homepage gagal dimuat')
      setFeaturedProducts([])
      setCategoryList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { queueMicrotask(fetchData) }, [])

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length), 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const scrollFlash = (dir) => { flashRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' }) }
  const scrollReco = (dir) => { recoRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' }) }

  const showCustomerCta = isAuthenticated && isCustomer

  return (
    <div className="overflow-x-hidden">
      {/* HERO CAROUSEL */}
      <section className="relative h-[90vh] min-h-[500px] flex items-center overflow-hidden bg-secondary">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-secondary/30"></div>
          </div>
        ))}
        <div className="container-custom relative z-10 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 carousel-slide" key={`tag-${currentSlide}`}>
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-white">{slides[currentSlide].tag}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6 carousel-slide" key={`title-${currentSlide}`}>{slides[currentSlide].title}</h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl carousel-slide" key={`sub-${currentSlide}`}>{slides[currentSlide].subtitle}</p>
            <Link to={slides[currentSlide].ctaLink} className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              {slides[currentSlide].cta} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 hover:border-white/40 hover:shadow-xl hover:scale-110 transition-all duration-300 shadow-lg">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 hover:border-white/40 hover:shadow-xl hover:scale-110 transition-all duration-300 shadow-lg">
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/40 hover:bg-white/70'}`} />
          ))}
        </div>
      </section>

      {/* FLASH SALE */}
      <section className="py-12 bg-gradient-to-r from-primary/5 via-white to-accent/5">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-2.5 shadow-lg animate-pulse-slow">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary">Flash Sale Hari Ini</h2>
                <p className="text-sm text-gray-500">Diskon terbatas, jangan sampai kehabisan!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scrollFlash(-1)} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-110 transition-all duration-300 group">
                <ChevronLeft className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
              </button>
              <button onClick={() => scrollFlash(1)} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-110 transition-all duration-300 group">
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
          {loading ? (
            <LoadingSkeleton count={4} className="md:grid-cols-4" />
          ) : flashProducts.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="Belum ada flash sale" description="Flash sale akan segera hadir." />
          ) : (
            <div ref={flashRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {flashProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-48 sm:w-56">
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORY */}
      <section className="py-16 bg-light">
        <div className="container-custom">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-primary text-sm font-medium">Kategori Populer</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Jelajahi <span className="gradient-text">Kategori</span></h2>
            <p className="text-gray-500">Temukan produk favoritmu dari berbagai kategori</p>
          </div>
          {loading ? (
            <LoadingSkeleton count={6} className="lg:grid-cols-6" />
          ) : categoryList.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => <CategoryCard key={cat.name} cat={cat} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categoryList.map((cat, i) => {
                const name = cat.category_name || cat.name
                return (
                  <Link key={cat.id || name} to={`/products?category=${name}`} className="group animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                      <div className="relative h-36 overflow-hidden">
                        <img src={categories[i % categories.length]?.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className={`absolute top-2 left-2 bg-gradient-to-r ${categories[i % categories.length]?.color || 'from-primary to-orange-500'} rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-lg`}>{name.slice(0, 2).toUpperCase()}</div>
                      </div>
                      <div className="p-3.5 text-center">
                        <h3 className="font-semibold text-secondary text-sm">{name}</h3>
                        {(cat.count || cat.product_count) && (
                          <p className="text-xs text-primary font-medium mt-0.5">{cat.count || cat.product_count} Produk</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* PRODUK TERLARIS */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-3">
                <Rocket className="h-4 w-4 text-accent" />
                <span className="text-accent text-sm font-medium">Best Seller</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Produk <span className="gradient-text">Terlaris</span></h2>
            </div>
            <Link to="/products" className="flex items-center gap-1 text-primary hover:gap-2 transition-all group text-sm font-semibold">
              Lihat Semua <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>
          {loading ? (
            <LoadingSkeleton count={4} className="md:grid-cols-4" />
          ) : productError ? (
            <ErrorMessage message={productError} onRetry={fetchData} />
          ) : featuredProducts.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="Belum ada produk" description="Produk akan segera hadir." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featuredProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} compact />)}
            </div>
          )}
        </div>
      </section>

      {/* REKOMENDASI */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-light">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="gradient-bg rounded-xl p-2.5 shadow-lg"><Sparkles className="h-5 w-5 text-white" /></div>
                <div>
                  <h2 className="text-xl font-bold text-secondary">Rekomendasi Untuk Anda</h2>
                  <p className="text-sm text-gray-500">Produk pilihan berdasarkan popularitas</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollReco(-1)} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-110 transition-all duration-300 group">
                  <ChevronLeft className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                </button>
                <button onClick={() => scrollReco(1)} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-110 transition-all duration-300 group">
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
            <div ref={recoRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {featuredProducts.slice(0, 10).map((product) => (
                <div key={product.id} className="flex-shrink-0 w-48 sm:w-56"><ProductCard product={product} compact /></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TOKO TERPERCAYA */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Store className="h-4 w-4 text-primary" />
              <span className="text-primary text-sm font-medium">Toko Terpercaya</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2"><span className="gradient-text">Toko</span> Terbaik</h2>
            <p className="text-gray-500">Ratusan toko terpercaya siap melayani Anda</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {trustedStores.map((store, i) => (
              <Link key={store.name} to="/products" className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="relative h-40 overflow-hidden">
                  <img src={store.image} alt={store.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-sm">{store.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/80">{store.products} Produk</span>
                      <span className="flex items-center gap-1 text-xs text-yellow-400"><Star className="h-3 w-3 fill-yellow-400" /> {store.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Kunjungi Toko</span>
                  <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-white to-accent/5">
        <div className="container-custom">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Gem className="h-4 w-4 text-primary" />
              <span className="text-primary text-sm font-medium">Keunggulan Kami</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Kenapa Pilih <span className="gradient-text">LocalMart?</span></h2>
            <p className="text-gray-500">Kami hadir untuk memudahkan belanja produk lokal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, title: 'Produk Lokal', desc: 'Dukung UMKM Indonesia', gradient: 'from-primary to-orange-500' },
              { icon: Shield, title: 'Aman & Terpercaya', desc: 'Transaksi 100% aman', gradient: 'from-accent to-green-500' },
              { icon: Truck, title: 'Pengiriman Cepat', desc: 'Seluruh Indonesia', gradient: 'from-primary to-orange-500' },
              { icon: Headphones, title: '24/7 Support', desc: 'CS siap membantu', gradient: 'from-accent to-green-500' },
            ].map((item, i) => (
              <div key={i} className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center border border-gray-100 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-secondary mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
              <Users className="h-4 w-4 text-accent" />
              <span className="text-accent text-sm font-medium">Testimoni</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Apa Kata <span className="gradient-text">Mereka?</span></h2>
            <p className="text-gray-500">Ribuan pengguna telah bergabung dan merasakan kemudahannya</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-8 md:p-10 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img src={testimonials[activeTestimonial].image} alt={testimonials[activeTestimonial].name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl mb-4 animate-zoom-in" key={`img-${activeTestimonial}`} />
                  <div className="absolute -bottom-1 -right-1 gradient-bg rounded-full p-1"><Award className="h-3.5 w-3.5 text-white" /></div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
                </div>
                <p className="text-gray-700 mb-4 italic leading-relaxed" key={`text-${activeTestimonial}`}>"{testimonials[activeTestimonial].text}"</p>
                <h4 className="font-bold text-secondary">{testimonials[activeTestimonial].name}</h4>
                <p className="text-sm text-gray-500">{testimonials[activeTestimonial].role}</p>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} className={`h-2 rounded-full transition-all duration-300 ${activeTestimonial === i ? 'w-8 bg-primary' : 'w-2 bg-gray-300 hover:bg-primary/50'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1607082350899-5e1055f0bb82?w=1600" alt="Shopping" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/85 to-secondary/70"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="text-center text-white py-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Promo Spesial!</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {showCustomerCta ? 'Lanjutkan Belanja di LocalMart' : 'Siap Jadi Bagian dari LocalMart?'}
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {showCustomerCta ? 'Cek pesanan, isi saldo wallet, dan temukan produk lokal favoritmu.' : 'Bergabunglah dengan ribuan seller dan buyer di platform terpercaya'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={showCustomerCta ? '/my-orders' : '/register'} className="bg-primary text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 group">
                {showCustomerCta ? 'Lihat Pesanan' : 'Daftar Sekarang'} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link to={showCustomerCta ? '/wallet' : '/products'} className="border-2 border-white/40 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
                {showCustomerCta ? 'Top Up Wallet' : 'Lihat Produk'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="container-custom">
          <p className="text-center text-gray-400 text-sm mb-5">Dipercaya oleh ribuan brand ternama</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Samsung', 'Apple', 'Unilever', 'Wings', 'Indofood'].map((brand, i) => (
              <div key={i} className="text-lg md:text-xl font-bold text-gray-300 hover:text-primary transition-all duration-300 hover:scale-110 cursor-pointer">{brand}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function CategoryCard({ cat, index }) {
  return (
    <Link to={`/products?category=${cat.name}`} className="group animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
        <div className="relative h-36 overflow-hidden">
          <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className={`absolute top-2 left-2 bg-gradient-to-r ${cat.color} rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-lg`}>{cat.name.slice(0, 2).toUpperCase()}</div>
        </div>
        <div className="p-3.5 text-center">
          <h3 className="font-semibold text-secondary text-sm">{cat.name}</h3>
          <p className="text-xs text-primary font-medium mt-0.5">{cat.count} Produk</p>
        </div>
      </div>
    </Link>
  )
}
