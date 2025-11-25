"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import StructuredData from "@/components/StructuredData"
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe, 
  Calendar, 
  Users, 
  MapPin, 
  Star,
  Megaphone,
  Copy,
  Check,
  Smartphone,
  Clock,
  Award,
  Heart
} from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"traveler" | "guide">("traveler")
  
  // Advertisement form state
  const [adForm, setAdForm] = useState({
    imageUrl: "",
    description: "",
    redirectUrl: "",
  })
  const [adSubmitting, setAdSubmitting] = useState(false)
  const [adSuccess, setAdSuccess] = useState(false)
  const [paymentRef, setPaymentRef] = useState("")
  const [adError, setAdError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdSubmitting(true)
    setAdError("")

    try {
      const response = await fetch("/api/public/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adForm),
      })

      const data = await response.json()

      if (data.success) {
        setAdSuccess(true)
        setPaymentRef(data.paymentReference)
        setAdForm({ imageUrl: "", description: "", redirectUrl: "" })
      } else {
        setAdError(data.message || "Failed to submit advertisement")
      }
    } catch (error) {
      setAdError("An error occurred. Please try again.")
    } finally {
      setAdSubmitting(false)
    }
  }

  const copyToClipboard = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(paymentRef)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <StructuredData />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 md:px-8 lg:px-12 min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </div>

        {/* Content */}
        <div className="container mx-auto text-center space-y-10 max-w-5xl relative z-10">
          
          {/* Beta Badge */}
          <div className="flex justify-center animate-fade-in">
            <Badge variant="secondary" className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/30 transition-all">
              <span className="text-sm font-bold uppercase tracking-widest">Early Access Beta</span>
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-white drop-shadow-2xl animate-fade-in-up">
            Explore Sri Lanka
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Like a Local
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-lg animate-fade-in-up animation-delay-200">
            Connect with verified local guides and discover hidden places across Sri Lanka
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 px-4 sm:px-0 animate-fade-in-up animation-delay-400">
            <Button size="lg" className="w-full sm:w-auto h-12 text-base px-6 bg-white text-black hover:bg-gray-100 font-semibold shadow-2xl transition-all transform hover:scale-105" asChild>
              <Link href="/auth/signup">
                Join as Traveler
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-base px-6 bg-transparent text-white hover:bg-white/20 border-2 border-white font-semibold shadow-2xl backdrop-blur-sm transition-all transform hover:scale-105" asChild>
              <Link href="/auth/signup">
                Apply as Guide
              </Link>
            </Button>
          </div>
          
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 md:px-8 lg:px-12 bg-black text-white">
        <div className="container mx-auto">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              One Platform
              <br />
              <span className="text-amber-400">For Your Entire Journey</span>
            </h2>
            <p className="text-white/80 text-base md:text-lg">
              Stop switching between multiple apps. Heritage Lanka brings everything together.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <Button 
              variant={activeTab === "traveler" ? "default" : "ghost"} 
              onClick={() => setActiveTab("traveler")}
              className={`px-6 py-3 text-sm md:text-base font-bold uppercase tracking-wider transition-all ${
                activeTab === "traveler" 
                  ? "bg-white text-black hover:bg-gray-100" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Travelers
            </Button>

            <Button 
              variant={activeTab === "guide" ? "default" : "ghost"} 
              onClick={() => setActiveTab("guide")}
              className={`px-6 py-3 text-sm md:text-base font-bold uppercase tracking-wider transition-all ${
                activeTab === "guide" 
                  ? "bg-white text-black hover:bg-gray-100" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Guides
            </Button>
          </div>

          {activeTab === "traveler" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Step 1 */}
              <div className="perspective-1000 h-64">
                <div className="relative w-full h-full transition-transform duration-700 transform-style-3d hover:rotate-y-180">
                  {/* Front */}
                  <Card className="absolute inset-0 border-gray-200 bg-white/95 backdrop-blur-md shadow-xl backface-hidden">
                    <CardContent className="p-6 space-y-4 h-full flex flex-col justify-center items-center text-center">
                      <div className="h-14 w-14 rounded-xl bg-amber-400/20 flex items-center justify-center transition-all">
                        <Calendar className="h-7 w-7 text-amber-600" />
                      </div>
                      <div className="space-y-2 relative w-full">
                        <div className="text-5xl font-black text-black/20 absolute top-0 left-1/2 transform -translate-x-1/2">01</div>
                        <h3 className="text-xl font-bold text-black pt-12">Create Request</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        Tell us where you want to go and what you want to see.
                      </p>
                    </CardContent>
                  </Card>
                  {/* Back */}
                  <Card className="absolute inset-0 border-gray-200 bg-amber-500 backdrop-blur-md shadow-xl backface-hidden rotate-y-180">
                    <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                      <h3 className="text-xl font-bold text-white mb-4">Create Request</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Simply share your travel preferences, desired destinations, and dates. Our platform makes it easy to communicate your needs to local guides who know the area best.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 2 */}
              <div className="perspective-1000 h-64">
                <div className="relative w-full h-full transition-transform duration-700 transform-style-3d hover:rotate-y-180">
                  {/* Front */}
                  <Card className="absolute inset-0 border-gray-200 bg-white/95 backdrop-blur-md shadow-xl backface-hidden">
                    <CardContent className="p-6 space-y-4 h-full flex flex-col justify-center items-center text-center">
                      <div className="h-14 w-14 rounded-xl bg-amber-400/20 flex items-center justify-center transition-all">
                        <Users className="h-7 w-7 text-amber-600" />
                      </div>
                      <div className="space-y-2 relative w-full">
                        <div className="text-5xl font-black text-black/20 absolute top-0 left-1/2 transform -translate-x-1/2">02</div>
                        <h3 className="text-xl font-bold text-black pt-12">Get Matched</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        We connect you with available local guides in that area.
                      </p>
                    </CardContent>
                  </Card>
                  {/* Back */}
                  <Card className="absolute inset-0 border-gray-200 bg-amber-500 backdrop-blur-md shadow-xl backface-hidden rotate-y-180">
                    <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                      <h3 className="text-xl font-bold text-white mb-4">Get Matched</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Our intelligent system connects you with verified local guides who specialize in your areas of interest. Receive personalized recommendations based on your preferences.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 3 */}
              <div className="perspective-1000 h-64">
                <div className="relative w-full h-full transition-transform duration-700 transform-style-3d hover:rotate-y-180">
                  {/* Front */}
                  <Card className="absolute inset-0 border-gray-200 bg-white/95 backdrop-blur-md shadow-xl backface-hidden">
                    <CardContent className="p-6 space-y-4 h-full flex flex-col justify-center items-center text-center">
                      <div className="h-14 w-14 rounded-xl bg-amber-400/20 flex items-center justify-center transition-all">
                        <MapPin className="h-7 w-7 text-amber-600" />
                      </div>
                      <div className="space-y-2 relative w-full">
                        <div className="text-5xl font-black text-black/20 absolute top-0 left-1/2 transform -translate-x-1/2">03</div>
                        <h3 className="text-xl font-bold text-black pt-12">Explore</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        Meet your guide and enjoy a safe, local experience.
                      </p>
                    </CardContent>
                  </Card>
                  {/* Back */}
                  <Card className="absolute inset-0 border-gray-200 bg-amber-500 backdrop-blur-md shadow-xl backface-hidden rotate-y-180">
                    <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                      <h3 className="text-xl font-bold text-white mb-4">Explore</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Experience Sri Lanka like never before with authentic local insights. Your guide ensures a safe, memorable journey through hidden gems and cultural treasures.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Step 1 */}
              <div className="perspective-1000 h-64">
                <div className="relative w-full h-full transition-transform duration-700 transform-style-3d hover:rotate-y-180">
                  {/* Front */}
                  <Card className="absolute inset-0 border-gray-200 bg-white/95 backdrop-blur-md shadow-xl backface-hidden">
                    <CardContent className="p-6 space-y-4 h-full flex flex-col justify-center items-center text-center">
                      <div className="h-14 w-14 rounded-xl bg-amber-400/20 flex items-center justify-center transition-all">
                        <Shield className="h-7 w-7 text-amber-600" />
                      </div>
                      <div className="space-y-2 relative w-full">
                        <div className="text-5xl font-black text-black/20 absolute top-0 left-1/2 transform -translate-x-1/2">01</div>
                        <h3 className="text-xl font-bold text-black pt-12">Register</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        Sign up with your details. We verify every guide manually.
                      </p>
                    </CardContent>
                  </Card>
                  {/* Back */}
                  <Card className="absolute inset-0 border-gray-200 bg-amber-500 backdrop-blur-md shadow-xl backface-hidden rotate-y-180">
                    <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                      <h3 className="text-xl font-bold text-white mb-4">Register</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Complete your profile with your expertise, language skills, and areas of specialization. Our thorough verification process ensures quality and trustworthiness for all travelers.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 2 */}
              <div className="perspective-1000 h-64">
                <div className="relative w-full h-full transition-transform duration-700 transform-style-3d hover:rotate-y-180">
                  {/* Front */}
                  <Card className="absolute inset-0 border-gray-200 bg-white/95 backdrop-blur-md shadow-xl backface-hidden">
                    <CardContent className="p-6 space-y-4 h-full flex flex-col justify-center items-center text-center">
                      <div className="h-14 w-14 rounded-xl bg-amber-400/20 flex items-center justify-center transition-all">
                        <Globe className="h-7 w-7 text-amber-600" />
                      </div>
                      <div className="space-y-2 relative w-full">
                        <div className="text-5xl font-black text-black/20 absolute top-0 left-1/2 transform -translate-x-1/2">02</div>
                        <h3 className="text-xl font-bold text-black pt-12">Receive Jobs</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        Get notifications when travelers are looking for guides in your area.
                      </p>
                    </CardContent>
                  </Card>
                  {/* Back */}
                  <Card className="absolute inset-0 border-gray-200 bg-amber-500 backdrop-blur-md shadow-xl backface-hidden rotate-y-180">
                    <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                      <h3 className="text-xl font-bold text-white mb-4">Receive Jobs</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Get instant notifications when travelers request guides in your area. Review requests, check schedules, and accept jobs that match your availability and expertise.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 3 */}
              <div className="perspective-1000 h-64">
                <div className="relative w-full h-full transition-transform duration-700 transform-style-3d hover:rotate-y-180">
                  {/* Front */}
                  <Card className="absolute inset-0 border-gray-200 bg-white/95 backdrop-blur-md shadow-xl backface-hidden">
                    <CardContent className="p-6 space-y-4 h-full flex flex-col justify-center items-center text-center">
                      <div className="h-14 w-14 rounded-xl bg-amber-400/20 flex items-center justify-center transition-all">
                        <Star className="h-7 w-7 text-amber-600" />
                      </div>
                      <div className="space-y-2 relative w-full">
                        <div className="text-5xl font-black text-black/20 absolute top-0 left-1/2 transform -translate-x-1/2">03</div>
                        <h3 className="text-xl font-bold text-black pt-12">Get Paid</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        Complete the tour and receive payments directly.
                      </p>
                    </CardContent>
                  </Card>
                  {/* Back */}
                  <Card className="absolute inset-0 border-gray-200 bg-amber-500 backdrop-blur-md shadow-xl backface-hidden rotate-y-180">
                    <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                      <h3 className="text-xl font-bold text-white mb-4">Get Paid</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Receive secure, direct payments upon tour completion. Set your own rates, track your earnings, and build your reputation through positive reviews from satisfied travelers.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features - Kept minimal and realistic */}
      <section className="py-20 px-6 md:px-8 lg:px-12 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              Why <span className="text-amber-500">Heritage Lanka?</span>
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need in one intelligent platform
            </p>
          </div>

          <div className="relative">
            {/* Auto-scrolling container */}
            <div className="flex gap-6 animate-scroll-left">
              {/* First set of cards */}
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Shield className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Manual Verification</h3>
                  <p className="text-sm text-gray-600">Every guide is screened before approval.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Zap className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Direct Connection</h3>
                  <p className="text-sm text-gray-600">No middlemen agencies, just you and the guide.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Globe className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Local Secrets</h3>
                  <p className="text-sm text-gray-600">Access places only locals know about.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Smartphone className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Mobile First</h3>
                  <p className="text-sm text-gray-600">Seamless experience on any device.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Real-Time Updates</h3>
                  <p className="text-sm text-gray-600">Instant notifications and booking confirmations.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Award className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Quality Assured</h3>
                  <p className="text-sm text-gray-600">Rated guides with verified reviews.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Heart className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Community Driven</h3>
                  <p className="text-sm text-gray-600">Built by travelers for travelers.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Shield className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Beta Support</h3>
                  <p className="text-sm text-gray-600">24/7 support team available during beta.</p>
                </CardContent>
              </Card>

              {/* Duplicate set for seamless loop */}
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Shield className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Manual Verification</h3>
                  <p className="text-sm text-gray-600">Every guide is screened before approval.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Zap className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Direct Connection</h3>
                  <p className="text-sm text-gray-600">No middlemen agencies, just you and the guide.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Globe className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Local Secrets</h3>
                  <p className="text-sm text-gray-600">Access places only locals know about.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[280px] flex-shrink-0">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all">
                    <Smartphone className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Mobile First</h3>
                  <p className="text-sm text-gray-600">Seamless experience on any device.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Advertise With Us Section */}
      <section className="py-16 px-6 md:px-8 lg:px-12 bg-white relative overflow-hidden">
        {/* Background SVG */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{ 
            backgroundImage: "url('/images/bg01.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'scaleY(-1)'
          }}
        />
        
        {/* Content */}
        <div className="container mx-auto max-w-2xl relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center">
                <Megaphone className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Advertise <span className="text-amber-500">With Us</span>
            </h2>
            <p className="text-lg text-gray-600">
              Reach thousands of travelers exploring Sri Lanka. Only 50 LKR per day!
            </p>
          </div>

          {!adSuccess ? (
            <Card className="bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-2xl">
              <CardHeader className="pb-6 pt-6 px-12 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Submit Your Advertisement</CardTitle>
              </CardHeader>
              <CardContent className="px-12 pb-8">
                <form onSubmit={handleAdSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="imageUrl" className="text-base font-semibold">Image URL *</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={adForm.imageUrl}
                      onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                      required
                      className="mt-2 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-base font-semibold">Description * (Max 500 characters)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your advertisement..."
                      value={adForm.description}
                      onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                      maxLength={500}
                      rows={4}
                      required
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {adForm.description.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="redirectUrl" className="text-base font-semibold">Redirect URL *</Label>
                    <Input
                      id="redirectUrl"
                      type="url"
                      placeholder="https://your-website.com"
                      value={adForm.redirectUrl}
                      onChange={(e) => setAdForm({ ...adForm, redirectUrl: e.target.value })}
                      required
                      className="mt-2 h-12"
                    />
                  </div>

                  {adError && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm font-medium">
                      {adError}
                    </div>
                  )}

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-5">
                    <h4 className="font-bold text-base mb-3 text-gray-900">Payment Instructions</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Price: 50 LKR per day</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Payment via bank transfer</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Include the payment reference ID in your transfer description</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Your ad will be reviewed and activated after payment verification</span>
                      </li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-bold" disabled={adSubmitting}>
                    {adSubmitting ? "Submitting..." : "Submit Advertisement"}
                  </Button>

                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                      Already submitted an ad?{" "}
                      <Link href="/public/check-ad" className="text-amber-600 hover:text-amber-700 hover:underline font-semibold">
                        Check your ad status
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">Advertisement Submitted!</h3>
                  <p className="text-green-700">
                    Your advertisement has been submitted successfully. Please complete the payment to activate it.
                  </p>

                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Your Payment Reference ID:</p>
                    <div className="flex items-center gap-2 justify-center">
                      <code className="text-lg font-mono font-bold text-green-600 bg-green-100 px-4 py-2 rounded">
                        {paymentRef}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex items-center gap-2"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Include this reference ID in your bank transfer description
                    </p>
                  </div>

                  <div className="text-left bg-white border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">Next Steps:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Make a bank transfer of 50 LKR per day</li>
                      <li>Include the reference ID <strong>{paymentRef}</strong> in the description</li>
                      <li>Your ad will be reviewed and activated within 24 hours</li>
                      <li>Check your ad status at <Link href="/check-ad" className="text-primary underline">/check-ad</Link></li>
                    </ol>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setAdSuccess(false)
                      setPaymentRef("")
                    }}
                  >
                    Submit Another Advertisement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}