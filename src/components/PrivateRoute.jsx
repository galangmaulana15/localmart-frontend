import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function PrivateRoute({ allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const roleMap = { seller: 2, customer: 3 }
  const allowedIds = allowedRoles.map(r => roleMap[r]).filter(Boolean)

  if (allowedRoles.length > 0 && !allowedIds.includes(user?.role_id)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
