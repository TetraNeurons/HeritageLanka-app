"use client";

import { useEffect, useState } from "react";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Star, MessageSquare } from "lucide-react";
import axios from "axios";
import { AppSidebar } from "@/components/traveler/Sidebar";
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

export default function TravelerReviewsPage() {
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
      const response = await axios.get("/api/traveler/reviews?type=given");
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
      const response = await axios.get("/api/traveler/reviews?type=received");
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
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="hidden md:block mb-4">
                  <SidebarTrigger />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 font-poppins">My Reviews</h1>
                <p className="text-sm lg:text-base text-gray-700 font-medium">
                  View reviews you've given and received from guides
                </p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reviews Given */}
                <div>
                  <div className="flex items-center gap-3 mb-5 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border-2 border-gray-200">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                    <h2 className="text-base lg:text-lg font-bold text-gray-900 font-poppins">
                      Reviews Given
                    </h2>
                    <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-1 rounded-full text-xs lg:text-sm font-bold border-2 border-amber-200">
                      {reviewsGiven.length}
                    </span>
                  </div>

                  {loadingGiven ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white border rounded-lg p-6 animate-pulse"
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
                    <div className="bg-white/95 backdrop-blur-md border-2 border-gray-200 rounded-xl p-16 text-center shadow-xl">
                      <Star className="h-16 w-16 text-amber-300 mx-auto mb-6" />
                      <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 font-poppins">
                        No reviews given yet
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        Complete a trip with a guide to leave your first review
                      </p>
                    </div>
                  )}
                </div>

                {/* Reviews Received */}
                <div>
                  <div className="flex items-center gap-3 mb-5 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border-2 border-gray-200">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-base lg:text-lg font-bold text-gray-900 font-poppins">
                      Reviews Received
                    </h2>
                    <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 px-3 py-1 rounded-full text-xs lg:text-sm font-bold border-2 border-yellow-200">
                      {reviewsReceived.length}
                    </span>
                  </div>

                  {loadingReceived ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white border rounded-lg p-6 animate-pulse"
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
                    <div className="bg-white/95 backdrop-blur-md border-2 border-gray-200 rounded-xl p-16 text-center shadow-xl">
                      <Star className="h-16 w-16 text-amber-300 mx-auto mb-6" />
                      <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 font-poppins">
                        No reviews received yet
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        Guides will be able to review you after completing trips
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
        <AlertDialogContent className="bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base lg:text-lg font-bold font-poppins">Delete Review</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-2 font-semibold font-poppins">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 font-bold font-poppins shadow-lg"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
