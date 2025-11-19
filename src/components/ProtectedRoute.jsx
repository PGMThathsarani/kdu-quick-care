import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUserStore } from '../store/UserStore'

export default function ProtectedRoute({ children, allowedRoles }) {
  // Read store values with separate selectors to avoid returning a new object each render
  const user = useUserStore((s) => s.user)
  const role = useUserStore((s) => s.role)
  const loading = useUserStore((s) => s.loading)

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to home if role not allowed
    return <Navigate to="/" replace />
  }

  return children
}
