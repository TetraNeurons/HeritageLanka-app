"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/admin/Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { MessageSquare, CheckCircle, XCircle, Eye, EyeOff, Loader2 } from "lucide-react"

interface Feedback {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  ageGroup: string | null
  userType: string | null
  satisfactionLevel: string
  feeling: string | null
  likedMost: string | null
  improvements: string | null
  hasMajorProblems: boolean
  problemDescription: string | null
  wouldRecommend: string | null
  isApproved: boolean
  isPublic: boolean
  createdAt: string
}

export default function AdminFeedbackPage() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch("/api/admin/feedback")
      if (response.status === 401) {
        router.push("/auth/signin")
        return
      }
      const data = await response.json()
      setFeedbacks(data.feedbacks || [])
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFeedbackStatus = async (id: string, updates: { isApproved?: boolean; isPublic?: boolean }) => {
    setUpdatingId(id)
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchFeedbacks()
      }
    } catch (error) {
      console.error("Error updating feedback:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  const getSatisfactionBadge = (level: string) => {
    const colors = {
      VERY_SATISFIED: "bg-green-100 text-green-800",
      SATISFIED: "bg-blue-100 text-blue-800",
      NEUTRAL: "bg-gray-100 text-gray-800",
      UNSATISFIED: "bg-orange-100 text-orange-800",
      VERY_UNSATISFIED: "bg-red-100 text-red-800",
    }
    return colors[level as keyof typeof colors] || colors.NEUTRAL
  }

  const pendingFeedbacks = feedbacks.filter(f => !f.isApproved)
  const approvedFeedbacks = feedbacks.filter(f => f.isApproved)

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="hidden md:block mb-4">
                <SidebarTrigger />
              </div>
              <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  System Feedback Management
                </h1>
                <p className="text-gray-600 mt-2 font-poppins">Review and manage user feedback and testimonials</p>
              </div>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingFeedbacks.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedFeedbacks.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({feedbacks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingFeedbacks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No pending feedback to review
              </CardContent>
            </Card>
          ) : (
            pendingFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                onUpdate={updateFeedbackStatus}
                isUpdating={updatingId === feedback.id}
                getSatisfactionBadge={getSatisfactionBadge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedFeedbacks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No approved feedback yet
              </CardContent>
            </Card>
          ) : (
            approvedFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                onUpdate={updateFeedbackStatus}
                isUpdating={updatingId === feedback.id}
                getSatisfactionBadge={getSatisfactionBadge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {feedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              onUpdate={updateFeedbackStatus}
              isUpdating={updatingId === feedback.id}
              getSatisfactionBadge={getSatisfactionBadge}
            />
          ))}
        </TabsContent>
      </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function FeedbackCard({
  feedback,
  onUpdate,
  isUpdating,
  getSatisfactionBadge,
}: {
  feedback: Feedback
  onUpdate: (id: string, updates: { isApproved?: boolean; isPublic?: boolean }) => void
  isUpdating: boolean
  getSatisfactionBadge: (level: string) => string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {feedback.name || "Anonymous User"}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={getSatisfactionBadge(feedback.satisfactionLevel)}>
                {feedback.satisfactionLevel.replace(/_/g, " ")}
              </Badge>
              {feedback.feeling && (
                <Badge variant="outline">{feedback.feeling}</Badge>
              )}
              {feedback.isApproved && (
                <Badge className="bg-green-100 text-green-800">Approved</Badge>
              )}
              {feedback.isPublic && (
                <Badge className="bg-blue-100 text-blue-800">Public</Badge>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(feedback.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Info */}
        {(feedback.email || feedback.phone) && (
          <div className="text-sm space-y-1">
            {feedback.email && <p className="text-gray-600">Email: {feedback.email}</p>}
            {feedback.phone && <p className="text-gray-600">Phone: {feedback.phone}</p>}
          </div>
        )}

        {/* Demographics */}
        <div className="flex gap-4 text-sm text-gray-600">
          {feedback.ageGroup && <span>Age: {feedback.ageGroup}</span>}
          {feedback.userType && <span>Type: {feedback.userType}</span>}
        </div>

        {/* Feedback Content */}
        {feedback.likedMost && (
          <div>
            <p className="font-semibold text-sm mb-1">What they liked:</p>
            <p className="text-gray-700">{feedback.likedMost}</p>
          </div>
        )}

        {feedback.improvements && (
          <div>
            <p className="font-semibold text-sm mb-1">Suggested improvements:</p>
            <p className="text-gray-700">{feedback.improvements}</p>
          </div>
        )}

        {feedback.hasMajorProblems && feedback.problemDescription && (
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="font-semibold text-sm text-red-800 mb-1">Reported Problem:</p>
            <p className="text-red-700">{feedback.problemDescription}</p>
          </div>
        )}

        {feedback.wouldRecommend && (
          <div className="text-sm">
            <span className="font-semibold">Would recommend:</span>{" "}
            <span className={
              feedback.wouldRecommend === "YES" ? "text-green-600" :
              feedback.wouldRecommend === "NO" ? "text-red-600" :
              "text-gray-600"
            }>
              {feedback.wouldRecommend}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {!feedback.isApproved && (
            <Button
              size="sm"
              onClick={() => onUpdate(feedback.id, { isApproved: true, isPublic: true })}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
              Approve & Publish
            </Button>
          )}
          
          {feedback.isApproved && !feedback.isPublic && (
            <Button
              size="sm"
              onClick={() => onUpdate(feedback.id, { isPublic: true })}
              disabled={isUpdating}
              variant="outline"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 mr-1" />}
              Make Public
            </Button>
          )}
          
          {feedback.isPublic && (
            <Button
              size="sm"
              onClick={() => onUpdate(feedback.id, { isPublic: false })}
              disabled={isUpdating}
              variant="outline"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4 mr-1" />}
              Hide from Public
            </Button>
          )}
          
          {feedback.isApproved && (
            <Button
              size="sm"
              onClick={() => onUpdate(feedback.id, { isApproved: false, isPublic: false })}
              disabled={isUpdating}
              variant="destructive"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
              Unapprove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
