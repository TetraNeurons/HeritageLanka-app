"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/admin/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Filter,
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  Megaphone,
  Eye,
  Brain,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Trip {
  id: string;
  traveler: {
    name: string;
    email: string;
  };
  guide: {
    name: string;
    email: string;
  } | null;
  status: string;
  needsGuide: boolean;
  fromDate: string;
  toDate: string;
  country: string;
  numberOfPeople: number;
}

interface APIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCredits: number;
  avgResponseTime: number;
  errorRate: number;
}

interface CategoryStat {
  category: string;
  count: number;
  credits: number;
}

interface TopUser {
  userId: string;
  userName: string;
  userEmail: string;
  requestCount: number;
  creditsUsed: number;
}

interface RecentError {
  id: string;
  query: string;
  errorMessage: string;
  createdAt: string;
  userName: string;
}

interface AdAnalytics {
  totalAds: number;
  activeAds: number;
  pendingAds: number;
  totalViews: number;
  revenueEstimate: number;
}

export default function AdminDashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [apiStats, setApiStats] = useState<APIUsageStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [apiLoading, setApiLoading] = useState(true);
  const [adAnalytics, setAdAnalytics] = useState<AdAnalytics | null>(null);
  const [adLoading, setAdLoading] = useState(true);
  const [aiStats, setAiStats] = useState<{ totalRequests: number; successRate: number; totalTokens: number } | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
    fetchAPIUsage();
    fetchAdAnalytics();
    fetchAIStats();
  }, [filter, timeRange]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.append("filter", filter);

      const url = `/api/admin/guide-assignments${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTrips(data.trips);
      } else {
        console.error("Failed to fetch trips:", data.error);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAPIUsage = async () => {
    try {
      setApiLoading(true);
      const response = await fetch(`/api/admin/api-usage?timeRange=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setApiStats(data.stats);
        setCategoryStats(data.categoryBreakdown);
        setTopUsers(data.topUsers);
        setRecentErrors(data.recentErrors);
      } else {
        console.error("Failed to fetch API usage:", data.error);
      }
    } catch (error) {
      console.error("Error fetching API usage:", error);
    } finally {
      setApiLoading(false);
    }
  };

  const fetchAdAnalytics = async () => {
    try {
      setAdLoading(true);
      const response = await fetch("/api/admin/advertisements/analytics");
      const data = await response.json();

      if (data.success) {
        setAdAnalytics({
          totalAds: data.totalAds,
          activeAds: data.activeAds,
          pendingAds: data.pendingAds,
          totalViews: data.totalViews,
          revenueEstimate: data.revenueEstimate,
        });
      } else {
        console.error("Failed to fetch ad analytics:", data.error);
      }
    } catch (error) {
      console.error("Error fetching ad analytics:", error);
    } finally {
      setAdLoading(false);
    }
  };

  const fetchAIStats = async () => {
    try {
      setAiLoading(true);
      const response = await fetch(`/api/admin/ai-analytics?timeRange=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setAiStats({
          totalRequests: data.stats.totalRequests,
          successRate: data.stats.successRate,
          totalTokens: data.stats.totalTokens,
        });
      } else {
        console.error("Failed to fetch AI stats:", data.error);
      }
    } catch (error) {
      console.error("Error fetching AI stats:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; className: string }> = {
      PLANNING: { label: "Planning", variant: "secondary", className: "bg-gray-100 text-gray-700" },
      CONFIRMED: { label: "Confirmed", variant: "default", className: "bg-blue-100 text-blue-700" },
      IN_PROGRESS: { label: "In Progress", variant: "default", className: "bg-green-100 text-green-700" },
      COMPLETED: { label: "Completed", variant: "outline", className: "bg-gray-50 text-gray-600" },
      CANCELLED: { label: "Cancelled", variant: "destructive", className: "bg-red-100 text-red-700" },
    };

    const config = statusConfig[status] || statusConfig.PLANNING;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const tripsNeedingGuide = trips.filter(t => t.needsGuide && !t.guide && t.status === 'PLANNING');
  const tripsWithGuide = trips.filter(t => t.guide);
  const tripsWithoutGuide = trips.filter(t => !t.guide);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-50">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="lg:hidden mb-4">
                <SidebarTrigger />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2 font-poppins">Monitor guide assignments and trip statuses</p>
            </div>

            {/* API Health Overview with Accordions */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl mb-6">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-poppins text-gray-900">API Health Overview</h2>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {/* Serper API Accordion */}
                  <AccordionItem value="serper">
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-semibold">Serper API (Nearby Places)</div>
                          {apiStats && (
                            <div className="text-sm text-gray-500">
                              {apiStats.totalRequests} requests • {apiStats.errorRate.toFixed(1)}% error rate
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                {apiLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : apiStats ? (
                  <div className="space-y-6">
                    {/* API Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 mb-1">Total Requests</div>
                        <div className="text-2xl font-bold text-blue-900">{apiStats.totalRequests}</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 mb-1">Successful</div>
                        <div className="text-2xl font-bold text-green-900">{apiStats.successfulRequests}</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm text-red-600 mb-1">Failed</div>
                        <div className="text-2xl font-bold text-red-900">{apiStats.failedRequests}</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 mb-1">Credits Used</div>
                        <div className="text-2xl font-bold text-purple-900">{apiStats.totalCredits}</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-sm text-orange-600 mb-1">Avg Response</div>
                        <div className="text-2xl font-bold text-orange-900">{apiStats.avgResponseTime}ms</div>
                      </div>
                    </div>

                    {/* Error Rate Alert */}
                    {apiStats.errorRate > 5 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-red-900">High Error Rate Detected</div>
                          <div className="text-sm text-red-700">
                            Current error rate is {apiStats.errorRate.toFixed(2)}% (threshold: 5%)
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category Breakdown */}
                    {categoryStats.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Requests by Category</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {categoryStats.map((cat) => (
                            <div key={cat.category} className="border rounded-lg p-3">
                              <div className="text-sm text-gray-600 capitalize mb-1">{cat.category}</div>
                              <div className="text-lg font-bold text-gray-900">{cat.count}</div>
                              <div className="text-xs text-gray-500">{cat.credits} credits</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Users */}
                    {topUsers.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Top Users by Requests</h3>
                        <div className="space-y-2">
                          {topUsers.slice(0, 5).map((user, index) => (
                            <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{user.userName}</div>
                                  <div className="text-xs text-gray-500">{user.userEmail}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">{user.requestCount} requests</div>
                                <div className="text-xs text-gray-500">{user.creditsUsed} credits</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Errors */}
                    {recentErrors.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Recent Errors
                        </h3>
                        <div className="space-y-2">
                          {recentErrors.slice(0, 5).map((error) => (
                            <div key={error.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="font-medium text-red-900 text-sm">{error.userName}</div>
                                <div className="text-xs text-red-600">
                                  {new Date(error.createdAt).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-sm text-gray-700 mb-1">Query: {error.query}</div>
                              <div className="text-xs text-red-700">{error.errorMessage}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No API usage data available
                      </div>
                    )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Gemini AI Accordion */}
                  <AccordionItem value="gemini">
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="font-semibold">Gemini AI (Travel Planning)</div>
                          {aiStats && (
                            <div className="text-sm text-gray-500">
                              {aiStats.totalRequests} requests • {aiStats.successRate.toFixed(1)}% success rate
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {aiLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                        </div>
                      ) : aiStats ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="text-sm text-purple-600 mb-1">Total Requests</div>
                              <div className="text-2xl font-bold text-purple-900">{aiStats.totalRequests}</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="text-sm text-green-600 mb-1">Success Rate</div>
                              <div className="text-2xl font-bold text-green-900">{aiStats.successRate.toFixed(1)}%</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="text-sm text-blue-600 mb-1">Total Tokens</div>
                              <div className="text-2xl font-bold text-blue-900">{aiStats.totalTokens}</div>
                            </div>
                          </div>
                          <div className="pt-2">
                            <a
                              href="/admin/ai-analytics"
                              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                            >
                              View detailed AI analytics →
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No AI usage data available
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Advertisement Analytics Card */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl mb-6">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold font-poppins text-gray-900 flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-purple-600" />
                  Advertisement Analytics
                </h2>
              </div>
              <div className="p-6">
                {adLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : adAnalytics ? (
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600 mb-1">Total Ads</div>
                      <div className="text-2xl font-bold text-purple-900">{adAnalytics.totalAds}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Active Ads</div>
                      <div className="text-2xl font-bold text-green-900">{adAnalytics.activeAds}</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm text-yellow-600 mb-1">Pending</div>
                      <div className="text-2xl font-bold text-yellow-900">{adAnalytics.pendingAds}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Total Views
                      </div>
                      <div className="text-2xl font-bold text-blue-900">{adAnalytics.totalViews}</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="text-sm text-emerald-600 mb-1">Est. Revenue</div>
                      <div className="text-2xl font-bold text-emerald-900">{adAnalytics.revenueEstimate} LKR</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No advertisement data available
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Total Trips</div>
                      <div className="text-3xl font-bold font-poppins text-gray-900">{trips.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-2xl shadow-lg">
                      <MapPin className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Needs Guide</div>
                      <div className="text-3xl font-bold font-poppins text-orange-600">{tripsNeedingGuide.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg">
                      <AlertCircle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-poppins font-medium text-gray-600 mb-2">With Guide</div>
                      <div className="text-3xl font-bold font-poppins text-green-600">{tripsWithGuide.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl shadow-lg">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Without Guide</div>
                      <div className="text-3xl font-bold font-poppins text-gray-600">{tripsWithoutGuide.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-400 to-gray-600 p-4 rounded-2xl shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trips Needing Guide - Prominent Display */}
            {tripsNeedingGuide.length > 0 && (
              <div className="bg-orange-50/80 backdrop-blur-md border-2 border-orange-200 shadow-xl rounded-2xl mb-8">
                <div className="p-6 border-b border-orange-200">
                  <h2 className="text-xl font-bold font-poppins text-orange-900 flex items-center gap-2">
                    <AlertCircle className="h-6 w-6" />
                    Trips Needing Guide Assignment ({tripsNeedingGuide.length})
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {tripsNeedingGuide.slice(0, 5).map((trip) => (
                      <div key={trip.id} className="bg-white p-4 rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-gray-900">{trip.country}</span>
                              <Badge variant="secondary" className="text-xs">
                                {trip.numberOfPeople} {trip.numberOfPeople === 1 ? "person" : "people"}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                <span>Traveler: {trip.traveler.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(trip.fromDate)} - {formatDate(trip.toDate)}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(trip.status)}
                        </div>
                      </div>
                    ))}
                    {tripsNeedingGuide.length > 5 && (
                      <p className="text-sm text-gray-500 text-center pt-2">
                        And {tripsNeedingGuide.length - 5} more trips needing guide assignment
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* All Trips Table */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-poppins text-gray-900">All Trips & Guide Assignments</h2>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter trips" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Trips</SelectItem>
                        <SelectItem value="needs-guide">Needs Guide</SelectItem>
                        <SelectItem value="assigned">With Guide</SelectItem>
                        <SelectItem value="unassigned">Without Guide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {trips.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No trips match the selected filter</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Traveler</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Guide</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Needs Guide</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trips.map((trip) => (
                            <TableRow key={trip.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{trip.traveler.name}</div>
                                  <div className="text-xs text-gray-500">{trip.traveler.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{trip.country}</div>
                                    <div className="text-xs text-gray-500">
                                      {trip.numberOfPeople} {trip.numberOfPeople === 1 ? "person" : "people"}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {formatDate(trip.fromDate)} - {formatDate(trip.toDate)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {trip.guide ? (
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-green-600" />
                                    <div>
                                      <div className="font-medium text-sm">{trip.guide.name}</div>
                                      <div className="text-xs text-gray-500">{trip.guide.email}</div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400 italic">Not assigned</span>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(trip.status)}</TableCell>
                              <TableCell>
                                {trip.needsGuide ? (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                    Yes
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">No</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                      {trips.map((trip) => (
                        <Card key={trip.id}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-gray-900">{trip.traveler.name}</div>
                                <div className="text-xs text-gray-500">{trip.traveler.email}</div>
                              </div>
                              {getStatusBadge(trip.status)}
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{trip.country}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(trip.fromDate)} - {formatDate(trip.toDate)}</span>
                              </div>
                            </div>

                            {trip.guide && (
                              <div className="pt-3 border-t">
                                <div className="flex items-center gap-2 text-sm">
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                  <div>
                                    <div className="font-medium">{trip.guide.name}</div>
                                    <div className="text-xs text-gray-500">{trip.guide.email}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {!trip.guide && trip.needsGuide && (
                              <div className="pt-3 border-t">
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Needs Guide Assignment
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
