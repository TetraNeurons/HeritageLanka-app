"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, MapPin, Compass } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <Compass className="h-32 w-32 text-blue-600 animate-spin" />
            <MapPin className="h-16 w-16 text-red-500 absolute" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl sm:text-8xl font-bold text-gray-900 mb-4">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          Lost in Paradise?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Looks like you've wandered off the beaten path. This page doesn't exist in our Sri Lankan adventure map.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto opacity-50">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 h-20"></div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 h-20"></div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-4 h-20"></div>
        </div>

        {/* Footer Text */}
        <p className="mt-12 text-sm text-gray-500">
          Need help? Contact our support team or explore our{" "}
          <Link href="/traveler/places" className="text-blue-600 hover:underline">
            popular destinations
          </Link>
        </p>
      </div>
    </div>
  );
}
