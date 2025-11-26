"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Smartphone,
  Clock,
  Award,
  Heart
} from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"traveler" | "guide">("traveler")

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

          {/* Search Section */}
          <div className="max-w-4xl mx-auto animate-fade-in-up animation-delay-300">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-5 border-2 border-white/20">
              {/* Category Tabs */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm md:text-base font-semibold text-white hover:text-white hover:bg-white/20 rounded-lg px-3 py-1.5"
                  asChild
                >
                  <Link href="/auth/signin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    Search All
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm md:text-base font-semibold text-white hover:text-white hover:bg-white/20 rounded-lg px-3 py-1.5"
                  asChild
                >
                  <Link href="/auth/signin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                    Plan Trip
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm md:text-base font-semibold text-white hover:text-white hover:bg-white/20 rounded-lg px-3 py-1.5"
                  asChild
                >
                  <Link href="/auth/signin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Explore Places
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm md:text-base font-semibold text-white hover:text-white hover:bg-white/20 rounded-lg px-3 py-1.5"
                  asChild
                >
                  <Link href="/auth/signin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                    New Events
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm md:text-base font-semibold text-white hover:text-white hover:bg-white/20 rounded-lg px-3 py-1.5"
                  asChild
                >
                  <Link href="/auth/signin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    Exclusive Offers
                  </Link>
                </Button>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                  >
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Places to go, things to do, hotels..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-white/30 bg-white/20 focus:border-white/50 focus:bg-white/30 focus:outline-none text-sm text-white placeholder-white/60 font-medium"
                  />
                </div>
                <Button 
                  size="lg" 
                  className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-xl shadow-lg text-sm"
                  asChild
                >
                  <Link href="/auth/signin">
                    Search
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0 animate-fade-in-up animation-delay-400 mt-4">
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
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Shield className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Manual Verification</h3>
                  <p className="text-xs md:text-sm text-gray-600">Every guide is screened before approval.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Zap className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Direct Connection</h3>
                  <p className="text-xs md:text-sm text-gray-600">No middlemen agencies, just you and the guide.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Globe className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Local Secrets</h3>
                  <p className="text-xs md:text-sm text-gray-600">Access places only locals know about.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Smartphone className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Mobile First</h3>
                  <p className="text-xs md:text-sm text-gray-600">Seamless experience on any device.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Clock className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Real-Time Updates</h3>
                  <p className="text-xs md:text-sm text-gray-600">Instant notifications and booking confirmations.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Award className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Quality Assured</h3>
                  <p className="text-xs md:text-sm text-gray-600">Rated guides with verified reviews.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Heart className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Community Driven</h3>
                  <p className="text-xs md:text-sm text-gray-600">Built by travelers for travelers.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Shield className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Beta Support</h3>
                  <p className="text-xs md:text-sm text-gray-600">24/7 support team available during beta.</p>
                </CardContent>
              </Card>

              {/* Duplicate set for seamless loop */}
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Shield className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Manual Verification</h3>
                  <p className="text-xs md:text-sm text-gray-600">Every guide is screened before approval.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Zap className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Direct Connection</h3>
                  <p className="text-xs md:text-sm text-gray-600">No middlemen agencies, just you and the guide.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Globe className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Local Secrets</h3>
                  <p className="text-xs md:text-sm text-gray-600">Access places only locals know about.</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-w-[200px] md:min-w-[280px] flex-shrink-0">
                <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-amber-200 transition-all">
                    <Smartphone className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 uppercase tracking-wide">Mobile First</h3>
                  <p className="text-xs md:text-sm text-gray-600">Seamless experience on any device.</p>
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
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center">
                <Megaphone className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Advertise <span className="text-amber-500">With Us</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Reach thousands of travelers exploring Sri Lanka. Only 50 LKR per day!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="w-full sm:w-auto h-12 text-base px-8 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-xl" asChild>
                <Link href="/public/check-ad">
                  Submit Advertisement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-base px-8 border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold shadow-xl" asChild>
                <Link href="/public/check-ad">
                  Check Ad Status
                </Link>
              </Button>
            </div>
          </div>

          {/* Why Advertise With Us */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Targeted Audience</h3>
                <p className="text-sm text-gray-600">Reach travelers actively planning trips to Sri Lanka</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Affordable Pricing</h3>
                <p className="text-sm text-gray-600">Just 50 LKR per day with flexible payment options</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Wide Reach</h3>
                <p className="text-sm text-gray-600">Display your ads to thousands of active users</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}