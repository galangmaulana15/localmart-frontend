import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export default function EmptyState({
  icon: Icon = ShoppingBag,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className = ''
}) {
  const actionClass = 'gradient-bg text-white px-7 py-3 rounded-full font-semibold inline-flex items-center justify-center hover:shadow-lg transition'

  return (
    <div className={`panel rounded-3xl p-10 text-center animate-fade-in ${className}`}>
      <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-secondary mb-2">{title}</h2>
      {description && <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className={actionClass}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className={actionClass}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
