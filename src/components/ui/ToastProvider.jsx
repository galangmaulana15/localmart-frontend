import { useCallback, useMemo, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { ToastContext } from './toastContext'

const toneClass = {
  success: 'border-green-100 bg-green-50 text-green-700',
  error: 'border-red-100 bg-red-50 text-red-700',
  info: 'border-blue-100 bg-blue-50 text-blue-700',
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random()}`
    const nextToast = {
      id,
      type: toast.type || 'info',
      duration: toast.duration ?? 3500,
      ...toast,
    }

    setToasts((current) => [...current, nextToast])

    if (nextToast.duration > 0) {
      window.setTimeout(() => removeToast(id), nextToast.duration)
    }

    return id
  }, [removeToast])

  const value = useMemo(() => ({
    showToast,
    removeToast,
    success: (message, options = {}) => showToast({ ...options, type: 'success', message }),
    error: (message, options = {}) => showToast({ ...options, type: 'error', message }),
    info: (message, options = {}) => showToast({ ...options, type: 'info', message }),
  }), [removeToast, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info
          return (
            <div
              key={toast.id}
              className={`animate-slide-down rounded-2xl border p-4 shadow-xl backdrop-blur ${toneClass[toast.type] || toneClass.info}`}
              role="status"
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  {toast.title && <p className="font-semibold text-secondary">{toast.title}</p>}
                  <p className="text-sm font-medium">{toast.message}</p>
                  {toast.action && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.action.onClick?.()
                        removeToast(toast.id)
                      }}
                      className="mt-3 rounded-lg bg-white/80 px-3 py-1.5 text-sm font-semibold text-secondary shadow-sm transition hover:bg-white"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full p-1 transition hover:bg-white/60"
                  aria-label="Tutup notifikasi"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
