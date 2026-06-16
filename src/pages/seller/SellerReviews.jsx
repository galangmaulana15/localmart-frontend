import { useEffect, useState } from 'react'
import { getReviews as getLocalReviews } from '../../utils/demoStore'
import { Star } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { reviewService } from '../../services/reviewService'

export default function SellerReviews() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await reviewService.getSellerReviews()
        const apiReviews = res.data?.data || []
        if (apiReviews.length > 0) {
          setReviews(apiReviews)
        } else {
          const localReviews = getLocalReviews().filter((r) => !r.seller_id || String(r.seller_id) === String(user?.id))
          setReviews(localReviews)
        }
      } catch {
        const localReviews = getLocalReviews().filter((r) => !r.seller_id || String(r.seller_id) === String(user?.id))
        setReviews(localReviews)
      }
    }
    loadReviews()
  }, [user])

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-8">
          <p className="text-primary font-semibold">Seller Center</p>
          <h1 className="text-3xl font-bold text-secondary">Ulasan Produk</h1>
          <p className="text-gray-500">Pantau ulasan customer untuk produk toko.</p>
        </div>

        <div className="panel rounded-3xl p-6">
          {reviews.length === 0 ? (
            <p className="py-12 text-center text-gray-500">Belum ada ulasan produk.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-secondary">{review.product_name}</p>
                      <p className="text-sm text-gray-500">{review.customer_name}</p>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="my-2 flex gap-1 text-accent">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`h-4 w-4 ${index < review.rating ? 'fill-accent' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
