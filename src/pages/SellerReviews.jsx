/* eslint-disable */
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { Star, Store, MessageSquare, ThumbsUp, Flag, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { formatRupiah } from '../utils/formatRupiah'
import EmptyState from '../components/ui/EmptyState'

const reviewRatings = [5, 4, 3, 2, 1]

const allReviews = [
  { id: 1, customer: 'Sarah Wijaya', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 5, product: 'Kemeja Flanel Premium', comment: 'Produknya bagus banget! Bahannya nyaman dan pengiriman cepat banget. Recommended seller!', date: '2025-06-14', product_id: 1 },
  { id: 2, customer: 'Budi Santoso', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5, product: 'Tas Ransel Wanita', comment: 'Tasnya sesuai foto, kualitasnya oke. Makasih seller!', date: '2025-06-13', product_id: 2 },
  { id: 3, customer: 'Ayu Lestari', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 4, product: 'Sepatu Sneakers Casual', comment: 'Sepatu nyaman dipakai, cuma ukurannya sedikit kebesaran. Tapi overall bagus!', date: '2025-06-12', product_id: 3 },
  { id: 4, customer: 'Rizki Pratama', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', rating: 5, product: 'Jam Tangan Analog', comment: 'Jam tangannya mewah banget, pengiriman cepat, packing aman. Top seller!', date: '2025-06-11', product_id: 4 },
  { id: 5, customer: 'Dian Permata', avatar: 'https://randomuser.me/api/portraits/women/63.jpg', rating: 4, product: 'Parfum Pria 50ml', comment: 'Wanginya enak dan tahan lama. Recommended buat yang suka parfum fresh.', date: '2025-06-10', product_id: 5 },
  { id: 6, customer: 'Andi Wijaya', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', rating: 3, product: 'Kacamata Hitam', comment: 'Kacamatanya biasa aja, sesuai harga sih. Pengiriman agak lambat.', date: '2025-06-09', product_id: 6 },
]

const ratingLabels = { 5: 'Sangat Baik', 4: 'Baik', 3: 'Cukup', 2: 'Kurang', 1: 'Sangat Kurang' }
const avgRating = (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)
const ratingCounts = reviewRatings.map(r => ({ rating: r, count: allReviews.filter(rev => rev.rating === r).length }))

export default function SellerReviews() {
  const { user } = useAuth()
  const [activeRating, setActiveRating] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 4

  const filtered = allReviews.filter(r => {
    const matchRating = activeRating === 0 || r.rating === activeRating
    const matchSearch = !searchQuery ||
      r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase())
    return matchRating && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  if (!user || user.role_id !== 2) {
    return (
      <div className="bg-light min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center panel rounded-3xl p-12 max-w-md">
          <Store className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-2">Akses Terbatas</h2>
          <p className="text-gray-500 mb-6">Halaman ini hanya untuk Seller.</p>
          <Link to="/register" className="gradient-bg text-white px-8 py-3 rounded-xl font-semibold inline-block hover:shadow-xl transition-all">Daftar Seller</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-semibold">Seller Reviews</span>
            </div>
            <h1 className="text-3xl font-bold text-secondary">Ulasan Toko</h1>
            <p className="text-gray-500 mt-1">{allReviews.length} ulasan dari pelanggan</p>
          </div>
          <label className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-primary transition-all max-w-xs shadow-sm">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }} placeholder="Cari ulasan..." className="bg-transparent outline-none text-sm w-full" />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X className="h-4 w-4 text-gray-400" /></button>}
          </label>
        </div>

        <div className="panel rounded-3xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-secondary">{avgRating}</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-accent text-accent' : 'text-gray-300'}`} />)}
              </div>
              <p className="text-sm text-gray-500 mt-1">{allReviews.length} ulasan</p>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {ratingCounts.map(({ rating, count }) => (
                <button key={rating} onClick={() => setActiveRating(activeRating === rating ? 0 : rating)} className={`flex items-center gap-2 w-full text-sm group ${activeRating === rating ? 'opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity`}>
                  <span className="text-gray-600 w-6 text-right font-medium">{rating}</span>
                  <Star className={`h-3.5 w-3.5 ${rating <= 5 ? 'fill-accent text-accent' : 'text-gray-300'}`} />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${(count / allReviews.length) * 100}%` }}></div>
                  </div>
                  <span className="text-gray-500 w-8 text-left text-xs">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {paginated.length === 0 ? (
          <EmptyState icon={MessageSquare} title={searchQuery ? 'Ulasan tidak ditemukan' : 'Belum ada ulasan'} description={searchQuery ? 'Coba kata kunci lain.' : 'Belum ada ulasan dari pelanggan.'} />
        ) : (
          <div className="space-y-4">
            {paginated.map((review) => (
              <div key={review.id} className="panel rounded-2xl p-5 hover:shadow-lg transition-all duration-300 animate-fade-in">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={review.avatar} alt={review.customer} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div>
                      <p className="font-semibold text-secondary text-sm">{review.customer}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-accent text-accent' : 'text-gray-300'}`} />)}</div>
                        <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ThumbsUp className="h-3.5 w-3.5" /></button>
                    <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all"><Flag className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">"{review.comment}"</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Produk: </span>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{review.product}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-full font-semibold text-sm transition-all ${page === i + 1 ? 'gradient-bg text-white shadow-lg' : 'border border-gray-200 hover:bg-primary hover:text-white'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  )
}
