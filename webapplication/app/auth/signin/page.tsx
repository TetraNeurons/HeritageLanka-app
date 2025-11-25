'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await axiosInstance.post('/api/auth/signin', data);

      if (res.data.success) {
        // Redirect based on role
        const role = res.data.user.role;
        switch (role) {
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'GUIDE':
            router.push('/guider/dashboard');
            break;
          case 'TRAVELER':
          default:
            router.push('/traveler/dashboard');
            break;
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/Hero-Video-Trim.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/20">
                <span className="text-xl font-bold font-poppins">H</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-dancing-script">
                Heritage <span className="ml-2">Lanka</span>
              </span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/signup">
                <Button className="bg-white text-black hover:bg-gray-100 font-poppins font-bold shadow-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 pt-24 relative z-10">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-6 pt-8">
            <CardTitle className="text-3xl font-bold font-poppins">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8">
            {error && (
               <div className="bg-red-50 border-2 border-red-200 text-red-600 text-sm p-4 rounded-lg mb-4 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                  <Link href="#" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-poppins font-bold text-base shadow-xl" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8">
            <p className="text-center text-sm text-gray-600 w-full">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-amber-600 hover:text-amber-700 hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
            
            <p className="text-center text-xs text-gray-500">
              Admin? Use email ending with @hl.com
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}