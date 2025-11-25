"use client";

import { useEffect, useState } from "react";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Star, MessageSquare } from "lucide-react";
import axios from "axios";
import { AppSidebar } from "@/components/guider/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  reviewer?: {
    name: string;
    email: string;
  };
  reviewee?: {
    name: string;
    email: string;
  };
  trip?: {
    country: string;
    fromDate: Date;
    toDate: Date;
  } | null;
}

export default function GuideReviewsPage() {
  const [reviewsGiven, setReviewsGiven] = useState<Review[]>([]);
  const [reviewsReceived, setReviewsReceived] = useState<Review[]>([]);
  const [loadingGiven, setLoadingGiven] = useState(true);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReviewsGiven();
    fetchReviewsReceived();
  }, []);

  const fetchReviewsGiven = async () => {
    try {
      const response = await axios.get("/api/guider/reviews?type=given");
      if (response.data.success) {
        setReviewsGiven(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews given:", error);
    } finally {
      setLoadingGiven(false);
    }
  };

  const fetchReviewsReceived = async () => {
    try {
      const response = await axios.get("/api/guider/reviews?type=received");
      if (response.data.success) {
        setReviewsReceived(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews received:", error);
    } finally {
      setLoadingReceived(false);
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      setDeleting(true);
      const response = await axios.delete(`/api/reviews/${reviewToDelete}`);
      
      if (response.data.success) {
        toast.success("Review deleted successfully");
        // Refresh reviews
        await fetchReviewsGiven();
      }
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.error || "Failed to delete review");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="lg:hidden mb-4">
                  <SidebarTrigger />
                </div>
                <h1 className="text-3xl font-bold font-poppins text-gray-900 mb-2">My Reviews</h1>
                <p className="text-gray-600 font-poppins">
                  View reviews you've given and received from travelers
                </p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reviews Given */}
                <div>
                  <div className="flex items-center gap-2 mb-4 bg-white/95 backdrop-blur-md border-2 border-white shadow-lg rounded-lg p-4">
                    <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-2 rounded-lg shadow-md">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold font-poppins text-gray-900">
                      Reviews Given
                    </h2>
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-poppins font-bold shadow-md">
                      {reviewsGiven.length}
                    </span>
                  </div>

                  {loadingGiven ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-lg p-6 animate-pulse"
                        >
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : reviewsGiven.length > 0 ? (
                    <div className="space-y-4">
                      {reviewsGiven.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          showReviewer={false}
                          showReviewee={true}
                          canDelete={true}
                          onDelete={() => handleDeleteClick(review.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-lg p-12 text-center">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-2">
                        No reviews given yet
                      </h3>
                      <p className="text-gray-500 font-poppins">
                        Complete a trip with a traveler to leave your first review
                      </p>
                    </div>
                  )}
                </div>

                {/* Reviews Received */}
                <div>
                  <div className="flex items-center gap-2 mb-4 bg-white/95 backdrop-blur-md border-2 border-white shadow-lg rounded-lg p-4">
                    <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-2 rounded-lg shadow-md">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold font-poppins text-gray-900">
                      Reviews Received
                    </h2>
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-poppins font-bold shadow-md">
                      {reviewsReceived.length}
                    </span>
                  </div>

                  {loadingReceived ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-lg p-6 animate-pulse"
                        >
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : reviewsReceived.length > 0 ? (
                    <div className="space-y-4">
                      {reviewsReceived.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          showReviewer={true}
                          showReviewee={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-lg p-12 text-center">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-2">
                        No reviews received yet
                      </h3>
                      <p className="text-gray-500 font-poppins">
                        Travelers will be able to review you after completing trips
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-md border-2 border-white shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-poppins text-xl">Delete Review</AlertDialogTitle>
            <AlertDialogDescription className="font-poppins">
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="font-poppins font-semibold border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="font-poppins font-bold bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
