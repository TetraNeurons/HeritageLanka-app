"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/admin/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AIStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  avgResponseTime: number;
}

interface WorkflowStat {
  workflowType: string;
  count: number;
  successRate: number;
}

interface TopUser {
  userId: string;
  userName: string;
  userEmail: string;
  requestCount: number;
  successRate: number;
}

interface RecentFailure {
  id: string;
  userName: string;
  workflowType: string;
  errorMessage: string;
  promptText: string;
  createdAt: string;
}

interface TimeSeriesPoint {
  date: string;
  requests: number;
  successes: number;
  failures: number;
}

export default function AIAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [stats, setStats] = useState<AIStats | null>(null);
  const [workflowBreakdown, setWorkflowBreakdown] = useState<WorkflowStat[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentFailures, setRecentFailures] = useState<RecentFailure[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [expandedFailures, setExpandedFailures] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/ai-analytics?timeRange=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setWorkflowBreakdown(data.workflowBreakdown);
        setTopUsers(data.topUsers);
        setRecentFailures(data.recentFailures);
        setTimeSeriesData(data.timeSeriesData);
      } else {
        console.error("Failed to fetch AI analytics:", data.error);
      }
    } catch (error) {
      console.error("Error fetching AI analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (!stats || stats.totalRequests === 0) {
      return { status: "unknown", color: "gray", label: "No Data" };
    }
    
    if (stats.successRate >= 90) {
      return { status: "healthy", color: "green", label: "Healthy" };
    } else if (stats.successRate >= 75) {
      return { status: "warning", color: "yellow", label: "Warning" };
    } else {
      return { status: "critical", color: "red", label: "Critical" };
    }
  };

  const toggleFailure = (id: string) => {
    const newExpanded = new Set(expandedFailures);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFailures(newExpanded);
  };

  const health = getHealthStatus();

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
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
              <div className="hidden md:block mb-4">
                <SidebarTrigger />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">AI Workflow Analytics</h1>
                  <p className="text-gray-600 mt-2 font-poppins">Monitor Gemini AI performance and usage</p>
                </div>
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

            {/* Health Status Card */}
            {stats && stats.totalRequests > 0 && (
              <div className={`mb-8 bg-${health.color}-50/80 backdrop-blur-md border-2 border-${health.color}-200 shadow-xl rounded-2xl`}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${health.color}-400 to-${health.color}-600 flex items-center justify-center shadow-lg`}>
                        {health.status === "healthy" && <CheckCircle className={`h-8 w-8 text-${health.color}-600`} />}
                        {health.status === "warning" && <AlertCircle className={`h-8 w-8 text-${health.color}-600`} />}
                        {health.status === "critical" && <XCircle className={`h-8 w-8 text-${health.color}-600`} />}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">System Health</div>
                        <div className={`text-2xl font-bold text-${health.color}-900`}>{health.label}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1 font-poppins">Success Rate</div>
                      <div className={`text-3xl font-bold font-poppins text-${health.color}-900`}>
                        {stats.successRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            {stats && stats.totalRequests > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Total Requests</div>
                    <div className="text-3xl font-bold font-poppins text-gray-900">{stats.totalRequests}</div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
                        <CheckCircle className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Successful</div>
                    <div className="text-3xl font-bold font-poppins text-green-900">{stats.successfulRequests}</div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl">
                        <XCircle className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Failed</div>
                    <div className="text-3xl font-bold font-poppins text-red-900">{stats.failedRequests}</div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl">
                        <Clock className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Avg Response</div>
                    <div className="text-3xl font-bold font-poppins text-orange-900">{stats.avgResponseTime}ms</div>
                  </div>
                </div>
              </div>
            )}

            {/* Request Volume Chart */}
            {timeSeriesData.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden mb-8">
                <div className="p-6">
                  <h3 className="text-xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">Request Volume Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="requests" stroke="#3b82f6" name="Total Requests" strokeWidth={2} />
                      <Line type="monotone" dataKey="successes" stroke="#10b981" name="Successful" strokeWidth={2} />
                      <Line type="monotone" dataKey="failures" stroke="#ef4444" name="Failed" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Workflow Breakdown Chart */}
            {workflowBreakdown.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden mb-8">
                <div className="p-6">
                  <h3 className="text-xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">Workflow Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workflowBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="workflowType" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Total Requests" />
                      <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Token Usage Chart */}
            {timeSeriesData.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden mb-8">
                <div className="p-6">
                  <h3 className="text-xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">Token Usage Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="tokens" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} name="Tokens Used" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Top Users Table */}
            {topUsers.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden mb-8">
                <div className="p-6">
                  <h3 className="text-xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6">Top Users by Requests</h3>
                  <div className="space-y-2">
                    {topUsers.map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-10 h-10 flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.userName}</div>
                            <div className="text-sm text-gray-500">{user.userEmail}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{user.requestCount} requests</div>
                          <div className="text-sm text-gray-500">
                            {user.successRate.toFixed(1)}% success
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Failures */}
            {recentFailures.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Recent Failures
                  </h3>
                  <div className="space-y-3">
                    {recentFailures.map((failure) => (
                      <div key={failure.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-red-900">{failure.userName}</div>
                            <Badge variant="outline" className="mt-1">
                              {failure.workflowType}
                            </Badge>
                          </div>
                          <div className="text-xs text-red-600">
                            {new Date(failure.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-red-700 mb-2">{failure.errorMessage}</div>
                        <button
                          onClick={() => toggleFailure(failure.id)}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                        >
                          {expandedFailures.has(failure.id) ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              Hide prompt
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              Show prompt
                            </>
                          )}
                        </button>
                        {expandedFailures.has(failure.id) && (
                          <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700 font-mono overflow-x-auto">
                            {failure.promptText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Data State */}
            {stats && stats.totalRequests === 0 && (
              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-12 text-center">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold font-poppins text-gray-900 mb-2">No AI Usage Data</h3>
                  <p className="text-gray-500">
                    No AI workflow executions found for the selected time range.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
