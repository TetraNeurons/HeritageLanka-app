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
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 flex items-center gap-1 font-semibold shadow-md">
          <CheckCircle className="h-3 w-3" />
          Paid
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-2 border-gray-300 flex items-center gap-1 font-semibold">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
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
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-4 rounded-xl shadow-lg">
                  <Receipt className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-poppins">Payment History</h1>
                  <p className="text-sm lg:text-base text-gray-700 mt-2 font-medium">Track all your trip payments and event tickets</p>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {payments.length === 0 ? (
              <Card className="border-dashed border-2 bg-white/95 backdrop-blur-md shadow-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CreditCard className="h-20 w-20 text-amber-300 mb-6" />
                  <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 font-poppins">No payment history</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Your payment transactions will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table View */}
                <Card className="hidden lg:block bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base lg:text-lg font-bold font-poppins">All Payments ({payments.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2 border-gray-200">
                          <TableHead className="font-bold font-poppins text-gray-900">Type</TableHead>
                          <TableHead className="font-bold font-poppins text-gray-900">Details</TableHead>
                          <TableHead className="font-bold font-poppins text-gray-900">Date/Info</TableHead>
                          <TableHead className="font-bold font-poppins text-gray-900">Amount</TableHead>
                          <TableHead className="font-bold font-poppins text-gray-900">Status</TableHead>
                          <TableHead className="font-bold font-poppins text-gray-900">Payment Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-amber-50 transition-colors">
                            <TableCell>
                              {payment.type === 'trip' ? (
                                <Badge variant="outline" className="bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border-2 border-amber-200 font-semibold">
                                  Trip
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 border-2 border-purple-200 font-semibold">
                                  Event
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {payment.type === 'trip' ? (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-amber-600" />
                                  <div>
                                    <div className="font-semibold font-poppins">{payment.trip.country}</div>
                                    <div className="text-xs text-gray-600 font-medium">
                                      Status: {payment.trip.status}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-purple-600" />
                                  <div>
                                    <div className="font-semibold font-poppins">{payment.event.title}</div>
                                    <div className="text-xs text-gray-600 font-medium">
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
                              <span className="font-bold text-base lg:text-lg text-gray-900 font-poppins">
                                {formatCurrency(payment.amount)}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell>
                              {payment.status === "PAID" && payment.paidAt ? (
                                <span className="text-xs lg:text-sm text-gray-700 font-medium font-poppins">
                                  {formatDate(payment.paidAt)}
                                </span>
                              ) : (
                                <span className="text-xs lg:text-sm text-gray-500 italic font-medium">
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
                    <Card key={payment.id} className="bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all">
                      <CardContent className="p-5 space-y-3">
                        {/* Payment Type Badge */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {payment.type === 'trip' ? (
                              <>
                                <MapPin className="h-6 w-6 text-amber-600" />
                                <div>
                                  <Badge variant="outline" className="bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border-2 border-amber-200 mb-1 font-semibold">
                                    Trip
                                  </Badge>
                                  <div className="font-bold text-sm lg:text-base text-gray-900 font-poppins">
                                    {payment.trip.country}
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    {payment.trip.status}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <Calendar className="h-6 w-6 text-purple-600" />
                                <div>
                                  <Badge variant="outline" className="bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 border-2 border-purple-200 mb-1 font-semibold">
                                    Event
                                  </Badge>
                                  <div className="font-bold text-sm lg:text-base text-gray-900 font-poppins">
                                    {payment.event.title}
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
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
                              <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <Calendar className="h-4 w-4 text-amber-600" />
                                <span className="font-poppins">
                                  {formatDate(payment.trip.fromDate)} - {formatDate(payment.trip.toDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <Users className="h-4 w-4 text-amber-600" />
                                <span className="font-poppins">
                                  {payment.trip.numberOfPeople}{" "}
                                  {payment.trip.numberOfPeople === 1 ? "person" : "people"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <Calendar className="h-4 w-4 text-purple-600" />
                                <span className="font-poppins">{payment.event.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <Users className="h-4 w-4 text-purple-600" />
                                <span className="font-poppins">
                                  {payment.event.ticketQuantity}{" "}
                                  {payment.event.ticketQuantity === 1 ? "ticket" : "tickets"}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Payment Info */}
                        <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-between">
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
                        <div className="text-xs lg:text-sm text-gray-600 mb-1">Total Payments</div>
                        <div className="text-xl lg:text-2xl font-bold text-gray-900">
                          {payments.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs lg:text-sm text-gray-600 mb-1">Completed</div>
                        <div className="text-xl lg:text-2xl font-bold text-green-600">
                          {payments.filter((p) => p.status === "PAID").length}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs lg:text-sm text-gray-600 mb-1">Total Spent</div>
                        <div className="text-xl lg:text-2xl font-bold text-gray-900">
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
