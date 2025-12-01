"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

interface Testimonial {
  id: string
  name: string | null
  satisfactionLevel: string
  feeling: string | null
  likedMost: string | null
  wouldRecommend: string | null
  createdAt: string
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/public/feedback")
      const data = await response.json()
      setTestimonials(data.testimonials || [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAvatarUrl = (name: string | null) => {
    const displayName = name || "Anonymous User"
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f59e0b&color=fff&size=128&bold=true`
  }

  const getSatisfactionStars = (level: string) => {
    const stars = level === "VERY_SATISFIED" ? 5 : level === "SATISFIED" ? 4 : 3
    return stars
  }

  if (isLoading) {
    return (
      <div className="py-20 px-6 md:px-8 lg:px-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-6 md:px-8 lg:px-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            What Our <span className="text-amber-500">Users Say</span>
          </h2>
          <p className="text-lg text-gray-600">
            Real feedback from real travelers and guides
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-amber-400 opacity-50" />
                </div>

                {/* Avatar and Name */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={getAvatarUrl(testimonial.name)}
                    alt={testimonial.name || "Anonymous"}
                    className="h-12 w-12 rounded-full border-2 border-amber-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {testimonial.name || "Anonymous User"}
                    </h4>
                    <div className="flex gap-1">
                      {Array.from({ length: getSatisfactionStars(testimonial.satisfactionLevel) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feedback Content */}
                {testimonial.likedMost && (
                  <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-4">
                    "{testimonial.likedMost}"
                  </p>
                )}

                {/* Feeling Badge */}
                {testimonial.feeling && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                    {testimonial.feeling === "HAPPY" && "😊"}
                    {testimonial.feeling === "COMFORTABLE" && "😌"}
                    {testimonial.feeling === "CONFIDENT" && "💪"}
                    {testimonial.feeling === "FRUSTRATED" && "😤"}
                    {testimonial.feeling === "CONFUSED" && "😕"}
                    <span className="capitalize">{testimonial.feeling.toLowerCase()}</span>
                  </div>
                )}

                {/* Recommendation */}
                {testimonial.wouldRecommend === "YES" && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Would recommend to others
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
