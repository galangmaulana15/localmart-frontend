import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productService } from '../services/productService'
import { formatRupiah, getImageUrl } from '../utils/formatRupiah'
import { Search, ShoppingCart, Heart, Sparkles, Filter, Grid3x3, List, ChevronDown, Star, ShoppingBag } from 'lucide-react'

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [view, setView] = useState('grid')
  const [sortBy, setSortBy] = useState('popular')

  useEffect(() => {
    fetchProducts()
  }, [search, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (sortBy === 'price_asc') params.sort = 'price_asc'
      if (sortBy === 'price_desc') params.sort = 'price_desc'
      if (sortBy === 'popular') params.sort = 'popular'
      params.limit = 100
      
      const res = await productService.getAll(params)
      let productData = []
      if (res.data && Array.isArray(res.data)) {
        productData = res.data
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        productData = res.data.data
      }
      
      setProducts(productData)
      console.log('Products loaded:', productData.length)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      setSearchParams({ search: search.trim() })
    } else {
      setSearchParams({})
    }
    fetchProducts()
  }

  const sortOptions = [
    { value: 'popular', label: 'Terpopuler' },
    { value: 'price_asc', label: 'Termurah' },
    { value: 'price_desc', label: 'Termahal' },
  ]

  if (loading) {
    return (
      <div className="bg-light min-h-screen pt-24 pb-16">
        <div className="container-custom">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-2">Koleksi Produk</h1>
          <p className="text-gray-500">Temukan produk favoritmu dari {products.length} pilihan</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk favoritmu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-gray-50"
              />
            </form>
            
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`px-3 py-2 transition ${view === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-500'}`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-2 transition ${view === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-500'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary mb-2">Produk tidak ditemukan</h3>
            <p className="text-gray-500">Coba kata kunci lain atau lihat koleksi lainnya</p>
            <button 
              onClick={() => {
                setSearch('')
                setSearchParams({})
                fetchProducts()
              }}
              className="inline-block mt-4 text-primary hover:underline"
            >
              Lihat semua produk
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <Link
                key={product.id || i}
                to={`/products/${product.id}`}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <img
                    src={getImageUrl(product.image_url, product.name)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/400x400?text=${encodeURIComponent(product.name || 'Product')}&bg=FF6B35&textColor=white`
                    }}
                  />
                  <button className="absolute bottom-3 right-3 bg-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-secondary line-clamp-1">{product.name}</h3>
                  <p className="text-primary font-bold text-xl mt-1">{formatRupiah(product.price)}</p>
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
        ) : (
          <div className="space-y-4">
            {products.map((product, i) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex gap-4 p-4"
              >
                <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={getImageUrl(product.image_url, product.name)} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary text-lg">{product.name}</h3>
                  <p className="text-primary font-bold text-xl">{formatRupiah(product.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span className="text-sm text-gray-600">{product.rating || 4.9}</span>
                    </div>
                    <span className="text-xs text-gray-400">| Terjual {product.sold || 0}+</span>
                  </div>
                </div>
                <button className="gradient-bg text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition">
                  Beli
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}