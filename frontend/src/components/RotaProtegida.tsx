import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthPublico } from '../context/AuthContext.tsx'

// Só deixa passar quem está logado; os demais vão para /login.
export default function RotaProtegida({ children }: { children: ReactNode }) {
  const { usuario } = useAuthPublico()
  const local = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: local.pathname }} />
  }
  return children
}
