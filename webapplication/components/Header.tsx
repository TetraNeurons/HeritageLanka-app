"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { useState, useEffect } from "react"
import axiosInstance from "@/lib/axios"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
const response = await axiosInstance.get('/api/auth/validate')
      if (response.data.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  function getDashboardUrl() {
    if (!user) return '/traveler/dashboard'
    
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard'
      case 'GUIDE':
        return '/guide/dashboard'
      case 'TRAVELER':
      default:
        return '/traveler/dashboard'
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-lg font-bold">T</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Heritage Lanka</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{user.name}</span>
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={getDashboardUrl()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 py-4 bg-background">
            <nav className="flex flex-col space-y-4 px-2">
              {loading ? (
                <div className="h-9 bg-muted animate-pulse rounded-md" />
              ) : user ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Welcome, <span className="font-medium text-foreground">{user.name}</span>
                  </div>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href={getDashboardUrl()}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  
                </>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button className="justify-start" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}