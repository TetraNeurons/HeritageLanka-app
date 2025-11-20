"use client";

import { AppSidebar } from "@/components/admin/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Calendar,
  CreditCard,
  MapPin,
  Receipt,
  Filter,
  CheckCircle,
  Clock,
  DollarSign,
  Ticket,
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  type?: 'trip' | 'event';
  traveler: {
    id: string;
    name: string;
    email: string;
  } | null;
  trip?: {
    id: string;
    fromDate: string;
    toDate: string;
    country: string;
    status: string;
    numberOfPeople: number;
    totalDistance: number | null;
  } | null;
  event?: {
    id: string;
    title: string;
    date: string;
    place: string;
  } | null;
  ticketQuantity?: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, typeFilter, fromDate, toDate]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      const url = `/api/admin/payments${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments);
      } else {
        console.error("Failed to fetch payments:", data.error);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    if (status === "PAID") {
      return (
        <Badge variant="default" className="bg-green-600 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const getTotalRevenue = () => {
    return payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);
  };

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
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Payment History</h1>
                  <p className="text-gray-600 mt-1">Monitor all payment transactions</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Payments</div>
                    <div className="text-2xl font-bold text-gray-900">{payments.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Completed</div>
                    <div className="text-2xl font-bold text-green-600">
                      {payments.filter((p) => p.status === "PAID").length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(getTotalRevenue())}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Pending Amount</div>
                    <div className="text-xl font-bold text-orange-600">
                      {formatCurrency(getPendingAmount())}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="trip">Trip Payments</SelectItem>
                      <SelectItem value="event">Event Tickets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      placeholder="From date"
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      placeholder="To date"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            {payments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
                  <p className="text-gray-600 text-center">
                    No payments match the selected filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table */}
                <Card className="hidden lg:block">
                  <CardHeader>
                    <CardTitle className="text-lg">All Payments ({payments.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Traveler</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Date/Quantity</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {payment.type === 'event' ? (
                                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                  <Ticket className="h-3 w-3" />
                                  Event
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                  <MapPin className="h-3 w-3" />
                                  Trip
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {payment.traveler && (
                                <div>
                                  <div className="font-medium">{payment.traveler.name}</div>
                                  <div className="text-xs text-gray-500">{payment.traveler.email}</div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {payment.type === 'event' && payment.event ? (
                                <div className="flex items-center gap-2">
                                  <Ticket className="h-4 w-4 text-purple-600" />
                                  <div>
                                    <div className="font-medium">{payment.event.title}</div>
                                    <div className="text-xs text-gray-500">{payment.event.place}</div>
                                  </div>
                                </div>
                              ) : payment.trip ? (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{payment.trip.country}</div>
                                    <div className="text-xs text-gray-500">
                                      {payment.trip.numberOfPeople} {payment.trip.numberOfPeople === 1 ? "person" : "people"}
                                      {payment.trip.totalDistance && ` • ${Math.round(payment.trip.totalDistance)} km`}
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              {payment.type === 'event' && payment.event ? (
                                <div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    <span>{payment.event.date}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {payment.ticketQuantity} {payment.ticketQuantity === 1 ? "ticket" : "tickets"}
                                  </div>
                                </div>
                              ) : payment.trip ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span>
                                    {formatDate(payment.trip.fromDate)} - {formatDate(payment.trip.toDate)}
                                  </span>
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(payment.amount)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell>
                              {payment.status === "PAID" && payment.paidAt ? (
                                <span className="text-sm text-gray-600">
                                  {formatDate(payment.paidAt)}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500 italic">
                                  Awaiting payment
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            {payment.traveler && (
                              <>
                                <div className="font-semibold text-gray-900">{payment.traveler.name}</div>
                                <div className="text-xs text-gray-500">{payment.traveler.email}</div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            {getStatusBadge(payment.status)}
                            {payment.type === 'event' ? (
                              <Badge variant="secondary" className="text-xs">
                                <Ticket className="h-3 w-3 mr-1" />
                                Event
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                Trip
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                          {payment.type === 'event' && payment.event ? (
                            <>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Ticket className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">{payment.event.title}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{payment.event.place}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{payment.event.date}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.ticketQuantity} {payment.ticketQuantity === 1 ? "ticket" : "tickets"}
                              </div>
                            </>
                          ) : payment.trip ? (
                            <>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{payment.trip.country}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDate(payment.trip.fromDate)} - {formatDate(payment.trip.toDate)}
                                </span>
                              </div>
                            </>
                          ) : null}
                        </div>

                        {/* Payment Info */}
                        <div className="pt-3 border-t flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Amount</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">
                              {payment.status === "PAID" ? "Paid on" : "Created on"}
                            </div>
                            <div className="text-sm text-gray-700">
                              {payment.status === "PAID" && payment.paidAt
                                ? formatDate(payment.paidAt)
                                : formatDate(payment.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
