import { AlertCircle } from 'lucide-react'

export default function ErrorMessage({ message, onRetry, className = '' }) {
  if (!message) return null

  return (
    <div className={`rounded-2xl bg-red-50 text-red-600 p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${className}`}>
      <div className="flex items-center gap-3 flex-1">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold bg-white px-4 py-2 rounded-xl hover:bg-red-100 transition">
          Coba Lagi
        </button>
      )}
    </div>
  )
}
