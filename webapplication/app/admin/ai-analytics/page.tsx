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
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="lg:hidden mb-4">
                <SidebarTrigger />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">AI Workflow Analytics</h1>
                  <p className="text-gray-600 mt-1">Monitor Gemini AI performance and usage</p>
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
              <Card className={`mb-6 border-${health.color}-200 bg-${health.color}-50`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full bg-${health.color}-100 flex items-center justify-center`}>
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
                      <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                      <div className={`text-3xl font-bold text-${health.color}-900`}>
                        {stats.successRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Metrics */}
            {stats && stats.totalRequests > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Total Requests</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalRequests}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Successful</div>
                    <div className="text-2xl font-bold text-green-900">{stats.successfulRequests}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Failed</div>
                    <div className="text-2xl font-bold text-red-900">{stats.failedRequests}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Avg Response</div>
                    <div className="text-2xl font-bold text-orange-900">{stats.avgResponseTime}ms</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts Grid */}
            {(timeSeriesData.length > 0 || workflowBreakdown.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Request Volume Chart */}
                {timeSeriesData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Request Volume Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                )}

                {/* Workflow Breakdown */}
                {workflowBreakdown.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Workflow Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {workflowBreakdown.map((workflow) => (
                          <div key={workflow.workflowType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">{workflow.workflowType}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-600">{workflow.count} requests</div>
                                <div className="text-gray-300">•</div>
                                <div className={`text-sm font-medium ${
                                  workflow.successRate >= 90 ? 'text-green-600' : 
                                  workflow.successRate >= 75 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {workflow.successRate.toFixed(1)}% success
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <div className="text-xl font-bold text-blue-700">{workflow.count}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Top Users Table */}
            {topUsers.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Top Users by Requests</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}

            {/* Recent Failures */}
            {recentFailures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Recent Failures
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}

            {/* No Data State */}
            {stats && stats.totalRequests === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Usage Data</h3>
                  <p className="text-gray-500">
                    No AI workflow executions found for the selected time range.
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}