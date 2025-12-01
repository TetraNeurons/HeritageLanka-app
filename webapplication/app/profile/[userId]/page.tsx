"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/Avatar";
import { Loader2, MapPin, Star, Calendar, CheckCircle, Clock, XCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerRole: string;
  createdAt: string;
}

interface ProfileData {
  id: string;
  name: string;
  role: string;
  languages: string[];
  profileImageUrl: string | null;
  bio: string | null;
  createdAt: string;
  roleData: {
    country?: string;
    rating: number;
    totalReviews: number;
    completedTrips: number;
    verificationStatus?: string;
    isLegacyVerified?: boolean;
    verifiedAt?: string | null;
  } | null;
  reviews: Review[];
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchCurrentUser();
  }, [userId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/api/profile/me");
      if (response.data.success) {
        setCurrentUserId(response.data.profile.id);
      }
    } catch (error) {
      // User might not be logged in or error occurred
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/profile/${userId}`);
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      toast.error(error.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Profile not found</p>
            <Button
              onClick={() => router.back()}
              className="mt-4"
              variant="outline"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderVerificationBadge = () => {
    if (profile.role !== "GUIDE" || !profile.roleData) return null;

    const { verificationStatus, isLegacyVerified } = profile.roleData;

    if (isLegacyVerified) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified (Legacy)
        </Badge>
      );
    }

    if (verificationStatus === "VERIFIED") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }

    if (verificationStatus === "PENDING") {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending Verification
        </Badge>
      );
    }

    if (verificationStatus === "REJECTED") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Not Verified
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <Card className="mb-6 bg-white/95 backdrop-blur-md shadow-xl border-2 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <Avatar
                imageUrl={profile.profileImageUrl}
                name={profile.name}
                size="lg"
                clickable={false}
                className="h-24 w-24"
              />

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 font-poppins">
                    {profile.name}
                  </h1>
                  {renderVerificationBadge()}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-3">
                  <Badge variant="secondary" className="capitalize">
                    {profile.role.toLowerCase()}
                  </Badge>
                  
                  {profile.roleData && (
                    <>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium">
                          {profile.roleData.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({profile.roleData.totalReviews} reviews)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.roleData.completedTrips} trips completed</span>
                      </div>
                    </>
                  )}

                  {profile.roleData?.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.roleData.country}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
                  </span>
                </div>

                {/* Languages */}
                {profile.languages && profile.languages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                    {profile.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Edit Button */}
                {isOwnProfile && (
                  <Button
                    onClick={() => router.push(`/${profile.role.toLowerCase()}/profile`)}
                    className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-2 font-poppins">About</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Card */}
        <Card className="bg-white/95 backdrop-blur-md shadow-xl border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="font-poppins">Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No reviews yet
              </p>
            ) : (
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b last:border-b-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.reviewerName}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {review.reviewerRole.toLowerCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
