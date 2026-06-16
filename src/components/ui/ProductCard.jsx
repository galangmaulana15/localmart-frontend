import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { formatRupiah, getCategoryName, getImageUrl, getProductName, getStoreName } from '../../utils/formatRupiah'

export default function ProductCard({ product, onAddToCart, onToggleWishlist, compact = false }) {
  const { isSeller } = useAuth()
  const productName = getProductName(product)
  const stock = Number(product.stock || 0)
  const outOfStock = stock <= 0
  const showCommerceActions = !isSeller
  const cardLayout = compact ? 'sm:flex sm:items-stretch' : ''
  const imageLayout = compact ? 'sm:w-40 sm:shrink-0 sm:aspect-auto' : 'aspect-square'

  return (
    <article className={`group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${cardLayout}`}>
      <Link to={`/products/${product.id}`} className="block">
        <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden ${imageLayout}`}>
          <img
            src={getImageUrl(product.image_url, productName)}
            alt={productName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            onError={(event) => {
              event.currentTarget.src = `https://placehold.co/500x500?text=${encodeURIComponent(productName)}&bg=FF6B35&textColor=white`
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100"></div>
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            {outOfStock ? 'Stok Habis' : `Stok ${stock}`}
          </div>
          {showCommerceActions && onToggleWishlist && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                onToggleWishlist(product)
              }}
              className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/95 text-primary shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition"
              title="Tambah ke wishlist"
              >
                <Heart className="h-4 w-4" />
              </button>
          )}
        </div>
      </Link>

      <div className={`flex-1 ${compact ? 'p-3 sm:p-4' : 'p-4'}`}>
        <Link to={`/products/${product.id}`} className="font-semibold text-secondary line-clamp-2 min-h-11 hover:text-primary transition">
          {productName}
        </Link>
        <p className="text-xs text-gray-400 mt-1">{getStoreName(product)} - {getCategoryName(product)}</p>
        <p className="text-primary font-bold text-lg mt-2">{formatRupiah(product.price)}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Link to={`/products/${product.id}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            Detail
          </Link>
          {showCommerceActions && onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              disabled={outOfStock}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:scale-105 hover:bg-primary-dark disabled:bg-gray-300 disabled:hover:scale-100"
              title={outOfStock ? 'Stok habis' : 'Tambah ke keranjang'}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
