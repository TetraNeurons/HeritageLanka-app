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
  XCircle
} from "lucide-react";

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
  locations: TripLocation[];
  daysRemaining: number;
}

interface JobHistoryItem {
  id: string;
  traveler: {
    name: string;
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
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Jobs</h1>
                <p className="text-gray-500 text-xs sm:text-sm">{currentDate}</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-2xl sm:text-3xl font-light text-gray-800">{currentTime}</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* In Progress Card */}
              <Card className="shadow-sm border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">In Progress</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                        {jobsData?.statistics.inProgressCount || 0}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Card */}
              <Card className="shadow-sm border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Completed</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                        {jobsData?.statistics.completedCount || 0}
                      </p>
                    </div>
                    <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cancelled Card */}
              <Card className="shadow-sm border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cancelled</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                        {jobsData?.statistics.cancelledCount || 0}
                      </p>
                    </div>
                    <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
                      <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* In-Progress Jobs Section */}
            <Card className="shadow-sm border-gray-100 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="bg-blue-100 p-1.5 rounded-md">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  In-Progress Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobsData?.inProgress.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No in-progress jobs</p>
                    <p className="text-gray-400 text-xs mt-1">Your active trips will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobsData?.inProgress.map((job) => (
                      <div
                        key={job.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                      >
                        <div className="space-y-3">
                          {/* Job Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base">{job.traveler.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{job.country}</p>
                            </div>
                            <Badge className="bg-blue-600 text-white">IN PROGRESS</Badge>
                          </div>

                          {/* Trip Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(job.fromDate)} - {formatDate(job.toDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{job.numberOfPeople} {job.numberOfPeople === 1 ? "person" : "people"}</span>
                            </div>
                            {job.totalDistance && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{job.totalDistance.toFixed(1)} km</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{job.daysRemaining} days remaining</span>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a 
                              href={`tel:${job.traveler.phone}`} 
                              className="text-sm font-medium text-blue-600 hover:underline"
                            >
                              {job.traveler.phone}
                            </a>
                          </div>

                          {/* Expandable Locations */}
                          {job.locations.length > 0 && (
                            <div className="pt-2 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleJobExpanded(job.id)}
                                className="w-full justify-between hover:bg-gray-50 transition-colors duration-200"
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
                                      className="p-3 bg-gray-50 rounded-lg text-sm"
                                    >
                                      <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900">{location.title}</p>
                                          <p className="text-gray-600 text-xs mt-1">{location.address}</p>
                                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
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
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="bg-gray-100 p-1.5 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    Job History
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={historyFilter === 'ALL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('ALL')}
                      className="transition-all duration-200"
                    >
                      All
                    </Button>
                    <Button
                      variant={historyFilter === 'COMPLETED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('COMPLETED')}
                      className="transition-all duration-200"
                    >
                      Completed
                    </Button>
                    <Button
                      variant={historyFilter === 'CANCELLED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('CANCELLED')}
                      className="transition-all duration-200"
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
                    <p className="text-gray-500 text-sm">No job history</p>
                    <p className="text-gray-400 text-xs mt-1">
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
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{job.traveler.name}</h3>
                              <Badge 
                                variant={job.status === 'COMPLETED' ? 'default' : 'destructive'}
                                className={job.status === 'COMPLETED' ? 'bg-green-600' : 'bg-red-600'}
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{job.country}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(job.fromDate)} - {formatDate(job.toDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {job.numberOfPeople} {job.numberOfPeople === 1 ? "person" : "people"}
                              </span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-400">Completed</p>
                            <p className="text-sm text-gray-600">{formatDate(job.completedAt)}</p>
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
    </SidebarProvider>
  );
}
