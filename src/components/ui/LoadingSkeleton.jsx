export default function LoadingSkeleton({ type = 'card-grid', count = 4, className = '' }) {
  if (type === 'page') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-8 w-64 skeleton rounded-xl"></div>
        <div className="h-4 w-96 max-w-full skeleton rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="h-32 skeleton rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
            <div className="h-24 w-24 skeleton rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 w-3/4 skeleton rounded"></div>
              <div className="h-5 w-32 skeleton rounded"></div>
              <div className="h-8 w-28 skeleton rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="aspect-square rounded-xl skeleton mb-4"></div>
          <div className="h-4 skeleton rounded mb-3"></div>
          <div className="h-5 w-2/3 skeleton rounded"></div>
        </div>
      ))}
    </div>
  )
}
