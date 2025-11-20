"use client";

import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Users,
  Receipt,
  CheckCircle,
  Clock,
  Ticket,
} from "lucide-react";

interface TripPayment {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  type: 'trip';
  trip: {
    id: string;
    fromDate: string;
    toDate: string;
    country: string;
    status: string;
    numberOfPeople: number;
    totalDistance: number | null;
  };
}

interface EventPayment {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  type: 'event';
  event: {
    id: string;
    title: string;
    date: string;
    place: string;
    ticketQuantity: number;
  };
}

type Payment = TripPayment | EventPayment;

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/traveler/payments");
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
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Payment History</h1>
                  <p className="text-gray-600 mt-1">Track all your trip payments and event tickets</p>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {payments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment history</h3>
                  <p className="text-gray-600 text-center">
                    Your payment transactions will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table View */}
                <Card className="hidden lg:block">
                  <CardHeader>
                    <CardTitle className="text-lg">All Payments ({payments.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Date/Info</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {payment.type === 'trip' ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Trip
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  Event
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {payment.type === 'trip' ? (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{payment.trip.country}</div>
                                    <div className="text-xs text-gray-500">
                                      Status: {payment.trip.status}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-purple-600" />
                                  <div>
                                    <div className="font-medium">{payment.event.title}</div>
                                    <div className="text-xs text-gray-500">
                                      {payment.event.place}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {payment.type === 'trip' ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span>
                                    {formatDate(payment.trip.fromDate)} - {formatDate(payment.trip.toDate)}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    <span>{payment.event.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Users className="h-3 w-3 text-gray-400" />
                                    <span>{payment.event.ticketQuantity} ticket(s)</span>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(payment.amount)}
                              </span>
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

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4 space-y-3">
                        {/* Payment Type Badge */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {payment.type === 'trip' ? (
                              <>
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <div>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-1">
                                    Trip
                                  </Badge>
                                  <div className="font-semibold text-gray-900">
                                    {payment.trip.country}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {payment.trip.status}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <Calendar className="h-5 w-5 text-purple-600" />
                                <div>
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mb-1">
                                    Event
                                  </Badge>
                                  <div className="font-semibold text-gray-900">
                                    {payment.event.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {payment.event.place}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                          {payment.type === 'trip' ? (
                            <>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDate(payment.trip.fromDate)} - {formatDate(payment.trip.toDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>
                                  {payment.trip.numberOfPeople}{" "}
                                  {payment.trip.numberOfPeople === 1 ? "person" : "people"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{payment.event.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>
                                  {payment.event.ticketQuantity}{" "}
                                  {payment.event.ticketQuantity === 1 ? "ticket" : "tickets"}
                                </span>
                              </div>
                            </>
                          )}
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

                {/* Summary Card */}
                <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Total Payments</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {payments.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Completed</div>
                        <div className="text-2xl font-bold text-green-600">
                          {payments.filter((p) => p.status === "PAID").length}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Total Spent</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(
                            payments
                              .filter((p) => p.status === "PAID")
                              .reduce((sum, p) => sum + p.amount, 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
