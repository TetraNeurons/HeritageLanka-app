'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from '@/components/Header';

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
            router.push('/guide/dashboard');
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
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
               <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-sm text-muted-foreground w-full">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                Sign Up
              </Link>
            </p>
            
            <p className="text-center text-xs text-muted-foreground/60">
              Admin? Use email ending with @hl.com
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}