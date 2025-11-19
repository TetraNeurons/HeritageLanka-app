"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe, 
  Calendar, 
  Users, 
  MapPin, 
  Star 
} from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"traveler" | "guide">("traveler")

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-8 lg:px-12">
        <div className="container mx-auto text-center space-y-8 max-w-4xl">
          
          {/* Beta Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-1.5 bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
              <span className="text-xs font-bold uppercase tracking-wide">Early Access Beta</span>
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Explore Sri Lanka{" "}
            <br className="hidden sm:block" />
            <span className="text-primary">Like a Local</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A new way to connect with verified local guides. Be among the first to test our platform and discover hidden places across Sri Lanka.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 px-4 sm:px-0">
            <Button size="lg" className="w-full sm:w-auto h-12 text-base" asChild>
              <Link href="/auth/signup">
                Join as Traveler
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-base" asChild>
              <Link href="/auth/signup">
                Apply as Guide
              </Link>
            </Button>
          </div>
          
          {/* Removed fake stats section completely */}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 md:px-8 lg:px-12 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              We are simplifying how you connect with locals.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-10">
            <Button 
              variant={activeTab === "traveler" ? "default" : "ghost"} 
              onClick={() => setActiveTab("traveler")}
              className="w-32"
            >
              Travelers
            </Button>

            <Button 
              variant={activeTab === "guide" ? "default" : "ghost"} 
              onClick={() => setActiveTab("guide")}
              className="w-32"
            >
              Guides
            </Button>
          </div>

          {activeTab === "traveler" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Step 1 */}
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">1. Create a Request</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Tell us where you want to go and what you want to see.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">2. Get Matched</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We connect you with available local guides in that area.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">3. Explore</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Meet your guide and enjoy a safe, local experience.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Step 1 */}
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">1. Register</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Sign up with your details. We verify every guide manually.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">2. Receive Jobs</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get notifications when travelers are looking for guides in your area.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">3. Get Paid</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Complete the tour and receive payments directly.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Features - Kept minimal and realistic */}
      <section className="py-16 px-6 md:px-8 lg:px-12 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Heritage Lanka?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-background/60 border-none shadow-none">
              <CardContent className="pt-6 text-center sm:text-left">
                <Shield className="h-8 w-8 text-primary mb-4 mx-auto sm:mx-0" />
                <h3 className="font-semibold text-lg mb-2">Manual Verification</h3>
                <p className="text-sm text-muted-foreground">Every guide is screened before approval.</p>
              </CardContent>
            </Card>

            <Card className="bg-background/60 border-none shadow-none">
              <CardContent className="pt-6 text-center sm:text-left">
                <Zap className="h-8 w-8 text-primary mb-4 mx-auto sm:mx-0" />
                <h3 className="font-semibold text-lg mb-2">Direct Connection</h3>
                <p className="text-sm text-muted-foreground">No middlemen agencies, just you and the guide.</p>
              </CardContent>
            </Card>

            <Card className="bg-background/60 border-none shadow-none">
              <CardContent className="pt-6 text-center sm:text-left">
                <Globe className="h-8 w-8 text-primary mb-4 mx-auto sm:mx-0" />
                <h3 className="font-semibold text-lg mb-2">Local Secrets</h3>
                <p className="text-sm text-muted-foreground">Access places only locals know about.</p>
              </CardContent>
            </Card>

            <Card className="bg-background/60 border-none shadow-none">
              <CardContent className="pt-6 text-center sm:text-left">
                <Shield className="h-8 w-8 text-primary mb-4 mx-auto sm:mx-0" />
                <h3 className="font-semibold text-lg mb-2">Beta Support</h3>
                <p className="text-sm text-muted-foreground">24/7 support team available during beta.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}