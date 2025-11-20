"use client";

import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("trip_id");

  useEffect(() => {
    // Optional: You could fetch trip details here if needed
  }, [tripId]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
                <p className="text-gray-600">
                  Your payment has been processed successfully. Your trip is now ready to start.
                </p>
              </div>

              {/* Trip Info */}
              {tripId && (
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
                  <p>
                    You can now start your trip from the "Your Plans" page.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/traveler/plans")}
                  className="w-full"
                  size="lg"
                >
                  View Your Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push("/traveler/history")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  View Payment History
                </Button>
              </div>

              {/* Additional Info */}
              <p className="text-xs text-gray-500">
                A confirmation email has been sent to your registered email address.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}
