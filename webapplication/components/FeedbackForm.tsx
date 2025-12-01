"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react"

export default function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    ageGroup: "",
    userType: "",
    satisfactionLevel: "",
    feeling: "",
    likedMost: "",
    improvements: "",
    hasMajorProblems: "NO",
    problemDescription: "",
    wouldRecommend: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hasMajorProblems: formData.hasMajorProblems === "YES",
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          ageGroup: "",
          userType: "",
          satisfactionLevel: "",
          feeling: "",
          likedMost: "",
          improvements: "",
          hasMajorProblems: "NO",
          problemDescription: "",
          wouldRecommend: "",
        })
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="bg-white border-2 border-green-200 shadow-xl">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-4">
            Your feedback has been submitted successfully. We appreciate your time!
          </p>
          <Button onClick={() => setIsSuccess(false)} variant="outline">
            Submit Another Response
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-2 border-gray-100 shadow-xl">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Share Your Feedback</h3>
            <p className="text-sm text-gray-600">Help us improve your experience</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Optional Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name (Optional)
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email (Optional)
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+94 XX XXX XXXX"
                className="mt-1"
              />
            </div>
          </div>

          {/* Age Group */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              What is your age group?
            </Label>
            <Select value={formData.ageGroup} onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-24">18–24</SelectItem>
                <SelectItem value="25-34">25–34</SelectItem>
                <SelectItem value="35-44">35–44</SelectItem>
                <SelectItem value="45+">45+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Type */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              What best describes you?
            </Label>
            <Select value={formData.userType} onValueChange={(value) => setFormData({ ...formData, userType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="BUSINESS_OWNER">Business owner</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Satisfaction Level */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              How satisfied are you with our system? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.satisfactionLevel}
              onValueChange={(value) => setFormData({ ...formData, satisfactionLevel: value })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VERY_SATISFIED" id="very-satisfied" />
                <Label htmlFor="very-satisfied" className="font-normal cursor-pointer">Very satisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SATISFIED" id="satisfied" />
                <Label htmlFor="satisfied" className="font-normal cursor-pointer">Satisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEUTRAL" id="neutral" />
                <Label htmlFor="neutral" className="font-normal cursor-pointer">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="UNSATISFIED" id="unsatisfied" />
                <Label htmlFor="unsatisfied" className="font-normal cursor-pointer">Unsatisfied</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VERY_UNSATISFIED" id="very-unsatisfied" />
                <Label htmlFor="very-unsatisfied" className="font-normal cursor-pointer">Very unsatisfied</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Feeling */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              How does our system make you feel?
            </Label>
            <Select value={formData.feeling} onValueChange={(value) => setFormData({ ...formData, feeling: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select feeling" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMFORTABLE">Comfortable</SelectItem>
                <SelectItem value="CONFIDENT">Confident</SelectItem>
                <SelectItem value="HAPPY">Happy</SelectItem>
                <SelectItem value="FRUSTRATED">Frustrated</SelectItem>
                <SelectItem value="CONFUSED">Confused</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liked Most */}
          <div>
            <Label htmlFor="likedMost" className="text-sm font-medium text-gray-700">
              What do you like most about the system?
            </Label>
            <Textarea
              id="likedMost"
              value={formData.likedMost}
              onChange={(e) => setFormData({ ...formData, likedMost: e.target.value })}
              placeholder="Tell us what you love..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Improvements */}
          <div>
            <Label htmlFor="improvements" className="text-sm font-medium text-gray-700">
              What should we improve?
            </Label>
            <Textarea
              id="improvements"
              value={formData.improvements}
              onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
              placeholder="Share your suggestions..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Major Problems */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Have you faced any major problems?
            </Label>
            <RadioGroup
              value={formData.hasMajorProblems}
              onValueChange={(value) => setFormData({ ...formData, hasMajorProblems: value })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="YES" id="problems-yes" />
                <Label htmlFor="problems-yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NO" id="problems-no" />
                <Label htmlFor="problems-no" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            {formData.hasMajorProblems === "YES" && (
              <Textarea
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                placeholder="Please describe the problem..."
                className="mt-3 min-h-[80px]"
              />
            )}
          </div>

          {/* Would Recommend */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Would you recommend our system to others?
            </Label>
            <RadioGroup
              value={formData.wouldRecommend}
              onValueChange={(value) => setFormData({ ...formData, wouldRecommend: value })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="YES" id="recommend-yes" />
                <Label htmlFor="recommend-yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MAYBE" id="recommend-maybe" />
                <Label htmlFor="recommend-maybe" className="font-normal cursor-pointer">Maybe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NO" id="recommend-no" />
                <Label htmlFor="recommend-no" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !formData.satisfactionLevel}
            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
