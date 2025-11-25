"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/guider/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  MapPin, 
  Calendar, 
  Users, 
  Phone, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Star
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ReviewForm } from "@/components/reviews/ReviewForm";

interface TripLocation {
  id: string;
  title: string;
  address: string;
  district: string;
  dayNumber: number;
  visitOrder: number;
  estimatedDuration: string | null;
}

interface InProgressJob {
  id: string;
  traveler: {
    name: string;
    phone: string;
  };
  fromDate: string;
  toDate: string;
  numberOfPeople: number;
  country: string;
  totalDistance: number | null;
  status: string;
  verified: boolean;
  locations: TripLocation[];
  daysRemaining: number;
}

interface JobHistoryItem {
  id: string;
  traveler: {
    name: string;
    userId: string;
  };
  fromDate: string;
  toDate: string;
  numberOfPeople: number;
  country: string;
  status: string;
  completedAt: string;
}

interface JobStatistics {
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
}

interface JobsData {
  inProgress: InProgressJob[];
  history: JobHistoryItem[];
  statistics: JobStatistics;
}

export default function JobsPage() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [jobsData, setJobsData] = useState<JobsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [selectedJobForVerification, setSelectedJobForVerification] = useState<InProgressJob | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<JobHistoryItem | null>(null);
  const [reviewEligibility, setReviewEligibility] = useState<Record<string, any>>({});

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch jobs data
  useEffect(() => {
    fetchJobsData();
  }, []);

  useEffect(() => {
    // Check review eligibility for history jobs
    jobsData?.history.forEach((job) => {
      if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
        checkReviewEligibility(job.id);
      }
    });
  }, [jobsData]);

  const fetchJobsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/guider/jobs");
      const data = await res.json();

      if (data.success) {
        setJobsData(data.data);
      } else {
        setError(data.error || "Failed to load jobs");
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const toggleJobExpanded = (jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const filteredHistory = jobsData?.history.filter(job => {
    if (historyFilter === 'ALL') return true;
    return job.status === historyFilter;
  }) || [];

  const checkReviewEligibility = async (tripId: string) => {
    try {
      const response = await fetch(`/api/guider/trips/${tripId}/review-eligibility`);
      const data = await response.json();
      if (data.success) {
        setReviewEligibility((prev) => ({
          ...prev,
          [tripId]: data.eligibility,
        }));
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  const handleReviewClick = (job: JobHistoryItem) => {
    setSelectedJobForReview(job);
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedJobForReview) {
      throw new Error("Job information is missing");
    }

    try {
      const response = await fetch("/api/guider/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripId: selectedJobForReview.id,
          revieweeId: selectedJobForReview.traveler.userId,
          rating,
          comment: comment || "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Review submitted successfully!");
        // Refresh eligibility
        await checkReviewEligibility(selectedJobForReview.id);
        // Close dialog after a short delay
        setTimeout(() => {
          setReviewDialogOpen(false);
          setSelectedJobForReview(null);
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (error: any) {
      console.error("Review submission error:", error);
      const errorMessage = error.message || "Failed to submit review";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const canReview = (job: JobHistoryItem) => {
    if (job.status !== 'COMPLETED' && job.status !== 'CANCELLED') return false;
    const eligibility = reviewEligibility[job.id];
    return eligibility?.canReview === true;
  };

  const hasReviewed = (job: JobHistoryItem) => {
    const eligibility = reviewEligibility[job.id];
    return eligibility?.hasReviewed === true;
  };

  const handleVerifyOtpClick = (job: InProgressJob) => {
    setSelectedJobForVerification(job);
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setOtpDialogOpen(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Please enable location access to verify the trip');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleVerifyOtp = async () => {
    if (!selectedJobForVerification || !userLocation || !otpInput) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otpInput.length !== 4) {
      toast.error('OTP must be 4 digits');
      return;
    }

    try {
      setVerifying(true);
      const response = await fetch(`/api/guider/trips/${selectedJobForVerification.id}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otpInput,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setOtpDialogOpen(false);
        setOtpInput("");
        setSelectedJobForVerification(null);
        setUserLocation(null);
        // Refresh jobs data
        await fetchJobsData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchJobsData}>Retry</Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 sm:mb-6 gap-3">
              <div className="w-full sm:w-auto">
                <div className="lg:hidden mb-2"><SidebarTrigger /></div>
                <h1 className="text-xl sm:text-2xl font-bold font-poppins tracking-tight text-gray-900">Jobs</h1>
                <p className="text-gray-500 text-xs sm:text-sm font-poppins">{currentDate}</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-2xl sm:text-3xl font-light font-poppins text-gray-800">{currentTime}</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* In Progress Card */}
              <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">In Progress</p>
                      <p className="text-2xl sm:text-3xl font-bold font-poppins text-gray-900 mt-1">
                        {jobsData?.statistics.inProgressCount || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Card */}
              <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">Completed</p>
                      <p className="text-2xl sm:text-3xl font-bold font-poppins text-gray-900 mt-1">
                        {jobsData?.statistics.completedCount || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cancelled Card */}
              <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-poppins font-semibold text-gray-500 uppercase tracking-wider">Cancelled</p>
                      <p className="text-2xl sm:text-3xl font-bold font-poppins text-gray-900 mt-1">
                        {jobsData?.statistics.cancelledCount || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* In-Progress Jobs Section */}
            <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl mb-6 overflow-hidden">
              <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-poppins">
                  <div className="bg-white/20 p-1.5 rounded-md backdrop-blur-sm">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  In-Progress Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">{jobsData?.inProgress.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-poppins text-sm">No in-progress jobs</p>
                    <p className="text-gray-400 font-poppins text-xs mt-1">Your active trips will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobsData?.inProgress.map((job) => (
                      <div
                        key={job.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-amber-200 transition-all bg-white"
                      >
                        <div className="space-y-3">
                          {/* Job Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold font-poppins text-gray-900 text-base">{job.traveler.name}</h3>
                              <p className="text-sm font-poppins text-gray-500 mt-1">{job.country}</p>
                            </div>
                            <Badge className={job.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-poppins' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-poppins'}>
                              {job.status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'CONFIRMED'}
                            </Badge>
                          </div>

                          {/* Trip Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span className="font-poppins">{formatDate(job.fromDate)} - {formatDate(job.toDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span className="font-poppins">{job.numberOfPeople} {job.numberOfPeople === 1 ? "person" : "people"}</span>
                            </div>
                            {job.totalDistance && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span className="font-poppins">{job.totalDistance.toFixed(1)} km</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span className="font-poppins">{job.daysRemaining} days remaining</span>
                            </div>
                          </div>

                          {/* Contact Info and Action Buttons */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <a 
                                href={`tel:${job.traveler.phone}`} 
                                className="text-sm font-poppins font-medium text-amber-600 hover:underline"
                              >
                                {job.traveler.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              {job.status === 'IN_PROGRESS' && !job.verified && (
                                <Button
                                  size="sm"
                                  onClick={() => handleVerifyOtpClick(job)}
                                  className="h-10 font-poppins font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                                >
                                  <Shield className="h-4 w-4 mr-1" />
                                  Verify OTP
                                </Button>
                              )}
                              {job.status === 'IN_PROGRESS' && job.verified && (
                                <>
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-poppins">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                  <Button
                                    size="sm"
                                    onClick={() => window.location.href = `/guider/trip-tracker/${job.id}`}
                                    className="h-10 font-poppins font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                                  >
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Track Trip
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Expandable Locations */}
                          {job.locations.length > 0 && (
                            <div className="pt-2 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleJobExpanded(job.id)}
                                className="w-full justify-between hover:bg-amber-50 transition-colors duration-200 font-poppins"
                              >
                                <span className="text-sm font-medium">
                                  {job.locations.length} location{job.locations.length !== 1 ? "s" : ""} planned
                                </span>
                                {expandedJobs.has(job.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>

                              {expandedJobs.has(job.id) && (
                                <div className="mt-3 space-y-2 animate-fadeIn">
                                  {job.locations.map((location, idx) => (
                                    <div
                                      key={location.id}
                                      className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm"
                                    >
                                      <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="font-poppins font-medium text-gray-900">{location.title}</p>
                                          <p className="font-poppins text-gray-600 text-xs mt-1">{location.address}</p>
                                          <div className="flex items-center gap-3 mt-2 text-xs font-poppins text-gray-500">
                                            <span>Day {location.dayNumber}</span>
                                            <span>•</span>
                                            <span>Stop {location.visitOrder}</span>
                                            {location.estimatedDuration && (
                                              <>
                                                <span>•</span>
                                                <span>{location.estimatedDuration}</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job History Section */}
            <Card className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-poppins">
                    <div className="bg-gradient-to-br from-gray-400 to-gray-600 p-1.5 rounded-md shadow-md">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    Job History
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={historyFilter === 'ALL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('ALL')}
                      className={`transition-all duration-200 font-poppins font-semibold ${historyFilter === 'ALL' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'border-2'}`}
                    >
                      All
                    </Button>
                    <Button
                      variant={historyFilter === 'COMPLETED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('COMPLETED')}
                      className={`transition-all duration-200 font-poppins font-semibold ${historyFilter === 'COMPLETED' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : 'border-2'}`}
                    >
                      Completed
                    </Button>
                    <Button
                      variant={historyFilter === 'CANCELLED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('CANCELLED')}
                      className={`transition-all duration-200 font-poppins font-semibold ${historyFilter === 'CANCELLED' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' : 'border-2'}`}
                    >
                      Cancelled
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-poppins text-sm">No job history</p>
                    <p className="text-gray-400 font-poppins text-xs mt-1">
                      {historyFilter === 'ALL' 
                        ? 'Your completed and cancelled trips will appear here'
                        : `No ${historyFilter.toLowerCase()} trips found`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((job) => (
                      <div
                        key={job.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:bg-amber-50 hover:border-amber-200 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold font-poppins text-gray-900">{job.traveler.name}</h3>
                              <Badge 
                                variant={job.status === 'COMPLETED' ? 'default' : 'destructive'}
                                className={job.status === 'COMPLETED' ? 'bg-gradient-to-r from-green-500 to-emerald-500 font-poppins' : 'bg-gradient-to-r from-red-500 to-rose-500 font-poppins'}
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <p className="text-sm font-poppins text-gray-600">{job.country}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1 font-poppins">
                                <Calendar className="h-3 w-3" />
                                {formatDate(job.fromDate)} - {formatDate(job.toDate)}
                              </span>
                              <span className="flex items-center gap-1 font-poppins">
                                <Users className="h-3 w-3" />
                                {job.numberOfPeople} {job.numberOfPeople === 1 ? "person" : "people"}
                              </span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex flex-col gap-2">
                            <div>
                              <p className="text-xs font-poppins text-gray-400">Completed</p>
                              <p className="text-sm font-poppins text-gray-600">{formatDate(job.completedAt)}</p>
                            </div>
                            
                            {/* Review Button */}
                            {canReview(job) && (
                              <Button
                                size="sm"
                                onClick={() => handleReviewClick(job)}
                                className="h-10 font-poppins font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg"
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Write Review
                              </Button>
                            )}

                            {/* Review Submitted Badge */}
                            {hasReviewed(job) && (
                              <div className="flex items-center justify-center gap-2 text-sm font-poppins text-green-600 bg-green-50 border-2 border-green-200 rounded-lg px-3 py-2 shadow-md">
                                <CheckCircle className="h-4 w-4" />
                                Review Submitted
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-md border-2 border-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-poppins text-xl">
              <Shield className="h-5 w-5 text-green-600" />
              Verify Trip Start
            </DialogTitle>
            <DialogDescription className="font-poppins">
              Enter the 4-digit OTP provided by {selectedJobForVerification?.traveler.name} to verify and start the trip
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="font-poppins font-semibold">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                value={otpInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtpInput(value);
                }}
                className="text-center text-2xl tracking-widest font-bold font-poppins border-2 h-14 shadow-lg"
                disabled={verifying}
              />
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-4 rounded-lg text-sm text-gray-700">
              <p className="font-poppins font-semibold mb-2">Important:</p>
              <ul className="list-disc list-inside space-y-1 text-xs font-poppins">
                <li>You must be near the traveler's location</li>
                <li>The OTP is valid for 30 minutes</li>
                <li>Your location will be verified automatically</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOtpDialogOpen(false);
                setOtpInput("");
                setSelectedJobForVerification(null);
                setUserLocation(null);
              }}
              disabled={verifying}
              className="font-poppins font-semibold border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyOtp}
              disabled={verifying || otpInput.length !== 4}
              className="font-poppins font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify & Start
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-md border-2 border-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-poppins text-xl">
              <Star className="h-5 w-5 text-yellow-500" />
              Review Traveler
            </DialogTitle>
            <DialogDescription className="font-poppins">
              Share your experience with {selectedJobForReview?.traveler.name}
            </DialogDescription>
          </DialogHeader>
          
          <ReviewForm
            onSubmit={handleReviewSubmit}
            onCancel={() => {
              setReviewDialogOpen(false);
              setSelectedJobForReview(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
