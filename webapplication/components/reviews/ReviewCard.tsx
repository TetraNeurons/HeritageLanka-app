"use client";

import { Star, Edit, MapPin, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ReviewCardProps {
  review: {
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
  };
  showReviewer?: boolean;
  showReviewee?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({
  review,
  showReviewer = true,
  showReviewee = true,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const displayName = showReviewer
    ? review.reviewer?.name
    : review.reviewee?.name;

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {displayName?.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Name and Date */}
          <div>
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(review.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canEdit && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-gray-600 hover:text-blue-600"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-gray-600 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= review.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {review.rating}/5
        </span>
      </div>

      {/* Comment */}
      {review.comment ? (
        <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
      ) : (
        <p className="text-gray-400 italic mb-4">No comment provided</p>
      )}

      {/* Trip Info */}
      {review.trip && (
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{review.trip.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(review.trip.fromDate), "MMM d")} -{" "}
                {format(new Date(review.trip.toDate), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
