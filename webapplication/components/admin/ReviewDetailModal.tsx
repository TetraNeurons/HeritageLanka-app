"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface ReviewDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  reviewerType: string;
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

export function ReviewDetailModal({
  open,
  onOpenChange,
  userId,
  userName,
}: ReviewDetailModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewerTypeFilter, setReviewerTypeFilter] = useState<string>("all");
  const [ratingRange, setRatingRange] = useState<number[]>([1, 5]);

  useEffect(() => {
    if (open && userId) {
      fetchReviews();
    }
  }, [open, userId, reviewerTypeFilter, ratingRange]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId,
        ...(reviewerTypeFilter !== "all" && { reviewerType: reviewerTypeFilter }),
        minRating: ratingRange[0].toString(),
        maxRating: ratingRange[1].toString(),
      });

      const response = await axios.get(`/api/admin/reviews?${params}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Reviews for {userName}</DialogTitle>
          <DialogDescription className="sr-only">
            View and filter all reviews for this user
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 py-4 border-b">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Reviewer Type</label>
            <Select value={reviewerTypeFilter} onValueChange={setReviewerTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="TRAVELER">Travelers</SelectItem>
                <SelectItem value="GUIDE">Guides</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">
              Rating Range: {ratingRange[0]} - {ratingRange[1]} stars
            </label>
            <Slider
              min={1}
              max={5}
              step={1}
              value={ratingRange}
              onValueChange={setRatingRange}
              className="mt-2"
            />
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showReviewer={true}
                  showReviewee={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No reviews found with the selected filters
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && reviews.length > 0 && (
          <div className="border-t pt-4 text-sm text-gray-600">
            Showing {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
