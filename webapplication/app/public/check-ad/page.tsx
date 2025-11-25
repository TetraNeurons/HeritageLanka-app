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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Custom Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gray-200 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden" style={{ filter: 'drop-shadow(0 0 6px rgba(100, 100, 100, 0.4))' }}>
                <img src="/images/logo_whitebg.png" alt="Heritage Lanka Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900 font-dancing-script">
                Heritage <span className="ml-2">Lanka</span>
              </span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 font-poppins font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-poppins font-bold shadow-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-24 px-6 md:px-8 lg:px-12">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-poppins">
              Check Your <span className="text-amber-500">Advertisement</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Enter your payment reference ID to check the status and performance of your advertisement
            </p>
          </div>

          <Card className="bg-white/95 backdrop-blur-md border-2 border-gray-100 shadow-2xl">
            <CardHeader className="pb-6 pt-8 px-8 text-center">
              <CardTitle className="text-2xl font-bold font-poppins">Advertisement Status Checker</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="paymentRef" className="text-base font-semibold">Payment Reference ID</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="paymentRef"
                      type="text"
                      placeholder="AD-1234567890-XXXX"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      required
                      className="flex-1 h-12"
                    />
                    <Button type="submit" disabled={loading || !paymentRef} className="h-12 bg-amber-500 hover:bg-amber-600 text-white font-poppins font-bold shadow-xl">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Search className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}
              </form>

              {adData && (
                <div className="mt-8 space-y-6">
                  <div className="border-t-2 border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-xl font-poppins">Status</h3>
                      <Badge className={`${getStatusInfo(adData.status).color} border-2 text-base px-4 py-1.5`} variant="outline">
                        {getStatusInfo(adData.status).label}
                      </Badge>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 mb-6 border-2 border-amber-100">
                      <div className="flex items-start gap-3">
                        {(() => {
                          const StatusIcon = getStatusInfo(adData.status).icon;
                          return <StatusIcon className="h-6 w-6 mt-0.5 text-amber-600" />;
                        })()}
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {getStatusInfo(adData.status).description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                        <div className="flex items-center gap-2 text-blue-600 mb-3">
                          <Eye className="h-5 w-5" />
                          <span className="text-sm font-semibold">Total Views</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-900">{adData.viewCount}</div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                        <div className="flex items-center gap-2 text-purple-600 mb-3">
                          <Calendar className="h-5 w-5" />
                          <span className="text-sm font-semibold">Submitted</span>
                        </div>
                        <div className="text-base font-bold text-purple-900">
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
            <p className="text-sm text-gray-600 mb-4 font-medium">
              Want to advertise with us?
            </p>
            <Button variant="outline" className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-poppins font-semibold shadow-lg" asChild>
              <Link href="/">Submit New Advertisement</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
