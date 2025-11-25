"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { 
  Megaphone,
  Copy,
  Check,
  Search,
  ArrowLeft
} from "lucide-react"

export default function CheckAdPage() {
  const [activeTab, setActiveTab] = useState<"submit" | "check">("submit")
  
  // Submit form state
  const [submitForm, setSubmitForm] = useState({
    email: "",
    imageUrl: "",
    description: "",
    redirectUrl: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [paymentRef, setPaymentRef] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [copied, setCopied] = useState(false)

  // Check status form state
  const [checkReference, setCheckReference] = useState("")
  const [checking, setChecking] = useState(false)
  const [adData, setAdData] = useState<any>(null)
  const [checkError, setCheckError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/public/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitForm),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitSuccess(true)
        setPaymentRef(data.paymentReference)
        setSubmitForm({ email: "", imageUrl: "", description: "", redirectUrl: "" })
      } else {
        setSubmitError(data.message || "Failed to submit advertisement")
      }
    } catch (error) {
      setSubmitError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setCheckError("")
    setAdData(null)

    try {
      const response = await fetch(`/api/public/advertisements/status?reference=${encodeURIComponent(checkReference)}`)
      const data = await response.json()

      if (data.success) {
        setAdData(data.advertisement)
      } else {
        setCheckError(data.message || "Advertisement not found")
      }
    } catch (error) {
      setCheckError("An error occurred. Please try again.")
    } finally {
      setChecking(false)
    }
  }

  const copyToClipboard = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(paymentRef)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: "secondary", label: "Pending Review" },
      ACTIVE: { variant: "default", label: "Active" },
      INACTIVE: { variant: "outline", label: "Inactive" },
      REJECTED: { variant: "destructive", label: "Rejected" },
    }
    const config = variants[status] || variants.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <section className="pt-32 pb-16 px-6 md:px-8 lg:px-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-4xl">
          {/* Back to Home */}
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-xl bg-amber-100 flex items-center justify-center">
                <Megaphone className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Advertise <span className="text-amber-500">With Us</span>
            </h1>
            <p className="text-lg text-gray-600">
              Reach thousands of travelers exploring Sri Lanka. Only 50 LKR per day!
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "submit" | "check")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="submit">Submit Advertisement</TabsTrigger>
              <TabsTrigger value="check">Check Status</TabsTrigger>
            </TabsList>

            {/* Submit Tab */}
            <TabsContent value="submit">
              {!submitSuccess ? (
                <Card className="bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-2xl">
                  <CardHeader className="pb-6 pt-6 px-8 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Submit Your Advertisement</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <Label htmlFor="email" className="text-base font-semibold">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={submitForm.email}
                          onChange={(e) => setSubmitForm({ ...submitForm, email: e.target.value })}
                          required
                          className="mt-2 h-12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="imageUrl" className="text-base font-semibold">Image URL *</Label>
                        <Input
                          id="imageUrl"
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={submitForm.imageUrl}
                          onChange={(e) => setSubmitForm({ ...submitForm, imageUrl: e.target.value })}
                          required
                          className="mt-2 h-12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-base font-semibold">Description * (Max 500 characters)</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your advertisement..."
                          value={submitForm.description}
                          onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                          maxLength={500}
                          rows={4}
                          required
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {submitForm.description.length}/500 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="redirectUrl" className="text-base font-semibold">Redirect URL *</Label>
                        <Input
                          id="redirectUrl"
                          type="url"
                          placeholder="https://your-website.com"
                          value={submitForm.redirectUrl}
                          onChange={(e) => setSubmitForm({ ...submitForm, redirectUrl: e.target.value })}
                          required
                          className="mt-2 h-12"
                        />
                      </div>

                      {submitError && (
                        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm font-medium">
                          {submitError}
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

                      <Button type="submit" className="w-full h-12 text-base font-bold" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Advertisement"}
                      </Button>
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
                          <li>Check your ad status using the "Check Status" tab</li>
                        </ol>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setSubmitSuccess(false)
                          setPaymentRef("")
                        }}
                      >
                        Submit Another Advertisement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Check Status Tab */}
            <TabsContent value="check">
              <Card className="bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-2xl">
                <CardHeader className="pb-6 pt-6 px-8 text-center">
                  <CardTitle className="text-2xl font-bold tracking-tight">Check Advertisement Status</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleCheckStatus} className="space-y-5">
                    <div>
                      <Label htmlFor="reference" className="text-base font-semibold">Payment Reference ID</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="reference"
                          type="text"
                          placeholder="AD-1234567890-ABCD"
                          value={checkReference}
                          onChange={(e) => setCheckReference(e.target.value)}
                          required
                          className="h-12"
                        />
                        <Button type="submit" disabled={checking} className="h-12 px-6">
                          {checking ? "Checking..." : <><Search className="h-4 w-4 mr-2" /> Check</>}
                        </Button>
                      </div>
                    </div>

                    {checkError && (
                      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm font-medium">
                        {checkError}
                      </div>
                    )}

                    {adData && (
                      <div className="space-y-4 mt-6">
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg">Advertisement Details</h4>
                            {getStatusBadge(adData.status)}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-600">Email</p>
                              <p className="text-base text-gray-900">{adData.email}</p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-600">Description</p>
                              <p className="text-base text-gray-900">{adData.description}</p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-600">Image URL</p>
                              <a href={adData.imageUrl} target="_blank" rel="noopener noreferrer" className="text-base text-blue-600 hover:underline break-all">
                                {adData.imageUrl}
                              </a>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-600">Redirect URL</p>
                              <a href={adData.redirectUrl} target="_blank" rel="noopener noreferrer" className="text-base text-blue-600 hover:underline break-all">
                                {adData.redirectUrl}
                              </a>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Views</p>
                                <p className="text-2xl font-bold text-gray-900">{adData.viewCount}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Submitted</p>
                                <p className="text-base text-gray-900">
                                  {new Date(adData.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {adData.status === "PENDING" && (
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                              <strong>Status: Pending Review</strong><br />
                              Your advertisement is awaiting admin approval. Please ensure payment has been completed with the reference ID.
                            </p>
                          </div>
                        )}

                        {adData.status === "ACTIVE" && (
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800">
                              <strong>Status: Active</strong><br />
                              Your advertisement is currently live and being displayed to travelers!
                            </p>
                          </div>
                        )}

                        {adData.status === "REJECTED" && (
                          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">
                              <strong>Status: Rejected</strong><br />
                              Your advertisement was not approved. Please contact support for more information.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}
