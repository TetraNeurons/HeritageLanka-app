"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Loader2, Eye, Calendar, CheckCircle, Clock, XCircle, Power } from "lucide-react";

type AdStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";

interface AdStatusData {
  status: AdStatus;
  viewCount: number;
  submittedAt: string;
}

export default function CheckAdPage() {
  const [paymentRef, setPaymentRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [adData, setAdData] = useState<AdStatusData | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAdData(null);

    try {
      const response = await fetch(`/api/public/advertisements/status?ref=${encodeURIComponent(paymentRef)}`);
      const data = await response.json();

      if (data.success) {
        setAdData({
          status: data.status,
          viewCount: data.viewCount,
          submittedAt: data.submittedAt,
        });
      } else {
        setError(data.message || "Advertisement not found");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: AdStatus) => {
    const statusConfig: Record<AdStatus, { icon: any; color: string; label: string; description: string }> = {
      PENDING: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending Review",
        description: "Your advertisement is awaiting admin approval. This usually takes 24-48 hours.",
      },
      ACTIVE: {
        icon: CheckCircle,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Active",
        description: "Your advertisement is live and being displayed to travelers!",
      },
      INACTIVE: {
        icon: Power,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Inactive",
        description: "Your advertisement has been deactivated by an administrator.",
      },
      REJECTED: {
        icon: XCircle,
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Rejected",
        description: "Your advertisement was not approved. Please contact support for more information.",
      },
    };

    return statusConfig[status];
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-16 px-6 md:px-8 lg:px-12">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Check Your Advertisement</h1>
            <p className="text-muted-foreground text-lg">
              Enter your payment reference ID to check the status and performance of your advertisement
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Advertisement Status Checker</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="paymentRef">Payment Reference ID</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="paymentRef"
                      type="text"
                      placeholder="AD-1234567890-XXXX"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit" disabled={loading || !paymentRef}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </form>

              {adData && (
                <div className="mt-6 space-y-4">
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Status</h3>
                      <Badge className={`${getStatusInfo(adData.status).color} border`} variant="outline">
                        {getStatusInfo(adData.status).label}
                      </Badge>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        {(() => {
                          const StatusIcon = getStatusInfo(adData.status).icon;
                          return <StatusIcon className="h-5 w-5 mt-0.5 text-gray-600" />;
                        })()}
                        <p className="text-sm text-gray-700">
                          {getStatusInfo(adData.status).description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm font-medium">Total Views</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{adData.viewCount}</div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">Submitted</span>
                        </div>
                        <div className="text-sm font-semibold text-purple-900">
                          {new Date(adData.submittedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Want to advertise with us?
            </p>
            <Button variant="outline" asChild>
              <Link href="/">Submit New Advertisement</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
