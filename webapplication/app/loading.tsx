import { Loader2, Globe } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full animate-ping opacity-30"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <Globe className="h-20 w-20 text-blue-600 animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Heritage Lanka
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-lg">Loading your adventure...</p>
        </div>

        {/* Loading Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-green-600 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
