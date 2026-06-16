import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { getApiData } from '../utils/formatRupiah'
import { Search, SlidersHorizontal, X, Grid3X3, List, ChevronLeft, ChevronRight, Shirt, Monitor, Apple, Dumbbell, Home, Pill, Sparkles } from 'lucide-react'
import { cartService } from '../services/cartService'
import { addToWishlist, removeFromWishlist, isInWishlist } from '../utils/demoStore'
import { useToast } from '../components/ui/useToast'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import ProductCard from '../components/ui/ProductCard'

const categoryIcons = {
  Fashion: Shirt, Elektronik: Monitor, Makanan: Apple,
  Olahraga: Dumbbell, 'Home & Living': Home, Kesehatan: Pill,
}

const sortOptions = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Termurah', value: 'price_asc' },
  { label: 'Termahal', value: 'price_desc' },
  { label: 'Terlaris', value: 'best_seller' },
  { label: 'Rating Tertinggi', value: 'rating' },
]

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState([])

  const ITEMS_PER_PAGE = 12

  const activeCategory = searchParams.get('category') || ''
  const searchQuery = searchParams.get('search') || ''
  const sortBy = searchParams.get('sort') || 'newest'

  async function fetchData() {
    setError('')
    try {
      const [productRes, categoryRes] = await Promise.all([
        productService.getAll({ limit: 100 }),
        productService.getCategories()
      ])
      const allProducts = getApiData(productRes, [])
      const cats = getApiData(categoryRes, [])
      setProducts(allProducts)
      setCategories(cats)
    } catch (err) {
      setError(err.response?.data?.message || 'Produk gagal dimuat')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { queueMicrotask(fetchData) }, [])

  useEffect(() => {
    let result = [...products]

    if (activeCategory) {
      result = result.filter(p =>
        (p.category_name || p.category)?.toLowerCase() === activeCategory.toLowerCase()
      )
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break
      case 'price_desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break
      case 'best_seller': result.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)); break
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break
      default: result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break
    }

    queueMicrotask(() => {
      setFilteredProducts(result)
      setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE) || 1)
      setPage(1)
    })
  }, [products, activeCategory, searchQuery, sortBy])

  const paginatedProducts = useMemo(
    () => filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [filteredProducts, page]
  )

  const toast = useToast()

  const handleToggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success('Dihapus dari wishlist')
    } else {
      addToWishlist(product.id)
      toast.success('Ditambahkan ke wishlist')
    }
    window.dispatchEvent(new Event('wishlist-updated'))
  }

  const handleAddToCart = async (product) => {
    try {
      await cartService.add(product.id, 1)
      toast.success('Ditambahkan ke keranjang')
      window.dispatchEvent(new Event('cart-updated'))
    } catch {
      toast.error('Gagal menambahkan ke keranjang')
    }
  }

  const updateSearch = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value); else params.delete(key)
    setSearchParams(params)
  }

  return (
    <div className="bg-light min-h-screen pb-16">
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 md:top-20 z-30">
        <div className="container-custom py-3">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-gray-400 hover:text-primary text-sm transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            <span className="text-sm font-semibold text-secondary">{activeCategory || 'Semua Produk'}</span>
          </div>
        </div>
      </div>

      <div className="container-custom mt-6">
        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(255,244,230,0.95)_48%,rgba(255,232,244,0.9)_100%)] p-5 shadow-sm md:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,107,53,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,94,139,0.12),transparent_28%)]"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Home
                <ChevronRight className="h-3 w-3 text-primary/60" />
                <span>Semua Produk</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-secondary md:text-5xl">
                Semua Produk
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
                Tampilan katalog dibuat lebih hidup, lembut, dan nyaman dilihat di semua ukuran layar.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <MiniMetric label="Produk" value={filteredProducts.length || products.length} />
              <MiniMetric label="Kategori" value={activeCategory ? 1 : categories.length || 0} />
              <MiniMetric label="View" value={view === 'grid' ? 'Grid' : 'List'} />
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
              <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl p-6 overflow-y-auto animate-slide-in-left">
                <FiltersSidebar categories={categories} activeCategory={activeCategory} onSelectCategory={(c) => { updateSearch('category', c); setShowFilters(false); }} searchQuery={searchQuery} onSearchChange={(q) => updateSearch('search', q)} />
              </div>
            </div>
          )}

          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <FiltersSidebar categories={categories} activeCategory={activeCategory} onSelectCategory={(c) => updateSearch('category', c)} searchQuery={searchQuery} onSearchChange={(q) => updateSearch('search', q)} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 mb-5 backdrop-blur supports-[backdrop-filter]:bg-white/90">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-medium hover:bg-gray-50 transition">
                    <SlidersHorizontal className="h-4 w-4" /> Filter
                  </button>
                  <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3.5 py-2 text-sm">
                    <Search className="h-4 w-4 text-gray-400" />
                    <select value={sortBy} onChange={(e) => updateSearch('sort', e.target.value)} className="bg-transparent outline-none text-sm font-medium text-gray-700 pr-6 cursor-pointer">
                      {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">{filteredProducts.length} produk ditemukan</p>
                  <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-0.5">
                    <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              {(searchQuery || activeCategory) && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                      <Search className="h-3 w-3" /> "{searchQuery}"
                      <button onClick={() => updateSearch('search', '')}><X className="h-3 w-3 ml-0.5 hover:text-primary/70" /></button>
                    </span>
                  )}
                  {activeCategory && (
                    <span className="inline-flex items-center gap-1 bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-medium">
                      {activeCategory}
                      <button onClick={() => updateSearch('category', '')}><X className="h-3 w-3 ml-0.5 hover:text-accent/70" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <LoadingSkeleton count={8} className="md:grid-cols-3 lg:grid-cols-3" />
            ) : error ? (
              <ErrorMessage message={error} onRetry={fetchData} />
            ) : paginatedProducts.length === 0 ? (
              <EmptyState
                icon={Search}
                title={searchQuery ? `Pencarian "${searchQuery}" tidak ditemukan` : 'Tidak ada produk'}
                description={searchQuery ? 'Coba kata kunci lain atau filter yang berbeda.' : 'Belum ada produk untuk kategori ini.'}
                actionLabel="Reset Filter"
                onAction={() => setSearchParams({})}
              />
            ) : (
              <>
                <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5' : 'space-y-4'}>
                  {paginatedProducts.map((product, index) => (
                    <div key={product.id} className="animate-fade-in motion-safe:transition-transform motion-safe:duration-500" style={{ animationDelay: `${index * 60}ms` }}>
                      <ProductCard product={product} compact={view === 'grid'} onToggleWishlist={handleToggleWishlist} onAddToCart={handleAddToCart} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i + 1} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${page === i + 1 ? 'gradient-bg text-white shadow-lg' : 'border border-gray-200 hover:bg-primary hover:text-white hover:border-primary'}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-black text-secondary">{value}</p>
    </div>
  )
}

function FiltersSidebar({ categories, activeCategory, onSelectCategory, searchQuery, onSearchChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-secondary">Filter</h3>
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari produk..."
            className="bg-transparent outline-none text-sm w-full"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          )}
        </label>
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kategori</h4>
        <div className="space-y-1">
          <button onClick={() => onSelectCategory('')} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${!activeCategory ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Sparkles className="h-4 w-4" />
            Semua Produk
          </button>
          {categories.length > 0 ? categories.map((cat) => {
            const name = cat.category_name || cat.name
            const Icon = categoryIcons[name] || Sparkles
            const isActive = activeCategory === name
            return (
              <button key={cat.id || name} onClick={() => onSelectCategory(name)} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icon className="h-4 w-4" />
                {name}
                {cat.count && <span className="ml-auto text-xs text-gray-400">({cat.count})</span>}
              </button>
            )
          }) : (
            <>
              {['Fashion', 'Elektronik', 'Makanan', 'Kesehatan', 'Olahraga', 'Home & Living'].map((name) => {
                const Icon = categoryIcons[name] || Sparkles
                const isActive = activeCategory === name
                return (
                  <button key={name} onClick={() => onSelectCategory(name)} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon className="h-4 w-4" />
                    {name}
                  </button>
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
