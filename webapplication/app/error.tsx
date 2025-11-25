"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-red-100 rounded-full animate-pulse"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <AlertTriangle className="h-32 w-32 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          We encountered an unexpected error while processing your request.
        </p>
        
        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 mb-8 p-4 bg-gray-100 rounded-lg text-left max-w-xl mx-auto">
            <p className="text-sm font-mono text-red-600 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8">
          Don't worry, our team has been notified and we're working on it.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={reset}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg max-w-xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-2">Need immediate help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If this problem persists, please contact our support team with the error details.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <span className="text-gray-600">Email:</span>
            <a href="mailto:support@heritagelanka.com" className="text-blue-600 hover:underline">
              support@heritagelanka.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
