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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    checkAuth()
    
    // Add scroll listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
        return '/guider/dashboard'
      case 'TRAVELER':
      default:
        return '/traveler/dashboard'
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'border-b border-white/20 bg-black/80 backdrop-blur-lg' 
        : 'border-b border-transparent bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden" style={{ filter: 'drop-shadow(0 0 8px rgba(245, 245, 245, 0.8))' }}>
              <img src="/images/logo_whitebg.png" alt="Heritage Lanka Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-dancing-script" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
              Heritage <span className="ml-2">Lanka</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-10 w-32 bg-white/10 animate-pulse rounded-md" />
            ) : user ? (
              <>
                <span className="text-sm text-white/80 font-poppins">
                  Welcome, <span className="font-semibold text-white">{user.name}</span>
                </span>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 font-poppins font-semibold shadow-lg" asChild>
                  <Link href={getDashboardUrl()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 font-poppins font-bold shadow-xl" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-white text-black hover:bg-gray-100 font-poppins font-bold shadow-xl" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/20"
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
          <div className="md:hidden border-t border-white/20 py-4 bg-black/90 backdrop-blur-lg">
            <nav className="flex flex-col space-y-4 px-2">
              {loading ? (
                <div className="h-9 bg-white/10 animate-pulse rounded-md" />
              ) : user ? (
                <>
                  <div className="px-3 py-2 text-sm text-white/80 font-poppins">
                    Welcome, <span className="font-semibold text-white">{user.name}</span>
                  </div>
                  <Button variant="ghost" className="justify-start text-white hover:bg-white/20 font-poppins font-semibold shadow-lg" asChild>
                    <Link href={getDashboardUrl()}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  
                </>
              ) : (
                <>
                  <Button variant="outline" className="justify-start bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 font-poppins font-bold shadow-xl" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button className="justify-start bg-white text-black hover:bg-gray-100 font-poppins font-bold shadow-xl" asChild>
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