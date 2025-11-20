"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
  initialRating?: number;
  initialComment?: string;
  isEdit?: boolean;
}

export function ReviewForm({
  onSubmit,
  onCancel,
  initialRating = 0,
  initialComment = "",
  isEdit = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (comment.length > 500) {
      setError("Comment must not exceed 500 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(rating, comment);
      setSuccess(true);
      
      if (!isEdit) {
        // Reset form for new reviews
        setRating(0);
        setComment("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (success && !isEdit) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-lg font-semibold mb-2">
          Review submitted successfully!
        </div>
        <p className="text-gray-600">Thank you for your feedback.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {rating} star{rating !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Comment (Optional)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          maxLength={500}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1 text-right">
          {comment.length}/500 characters
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Success Message for Edit */}
      {success && isEdit && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Review updated successfully!
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || rating === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Submitting..." : isEdit ? "Update Review" : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
