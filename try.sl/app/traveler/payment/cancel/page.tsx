"use client";

import { AppSidebar } from "@/components/traveler/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("trip_id");

  const handleRetryPayment = () => {
    if (tripId) {
      router.push("/traveler/plans");
    } else {
      router.push("/traveler/plans");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-6">
              {/* Cancel Icon */}
              <div className="flex justify-center">
                <div className="bg-orange-100 p-4 rounded-full">
                  <XCircle className="h-16 w-16 text-orange-600" />
                </div>
              </div>

              {/* Cancel Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
                <p className="text-gray-600">
                  Your payment was cancelled. No charges have been made to your account.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700 text-left space-y-2">
                <p className="font-medium">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Your trip remains in confirmed status</li>
                  <li>You can retry payment anytime</li>
                  <li>Payment is required before starting your trip</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleRetryPayment}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Payment
                </Button>
                <Button
                  onClick={() => router.push("/traveler/plans")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Plans
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500">
                Need help? Contact our support team for assistance with your payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}
