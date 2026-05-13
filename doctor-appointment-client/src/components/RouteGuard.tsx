"use client"

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'


interface RouteGuardProps {
  children: React.ReactNode
  protectedRoutes?: string[]
  authRoutes?: string[]
}

export const RouteGuard = ({
  children,
  protectedRoutes = [],
  authRoutes = ['/login', '/register']
}: RouteGuardProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const path = pathname.split('?')[0]

    // Check authentication status (you might need to adjust this based on your auth state)
    const authVerified = isAuthenticated

    // Redirect authenticated users away from auth pages
    if (authVerified && authRoutes.includes(path)) {
      router.replace('/')
      return
    }

    // Redirect unauthenticated users from protected pages
    if (!authVerified && protectedRoutes.includes(path)) {
      router.replace('/login')
      return
    }
  }, [isAuthenticated, pathname, router, protectedRoutes, authRoutes])

  // Optional: Show loading state while checking auth
  if (typeof isAuthenticated === 'undefined') {
    return <div>Loading...</div>
  }

  return <>{children}</>
}