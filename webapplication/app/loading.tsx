import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-amber-100 rounded-full animate-ping opacity-30"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="h-20 w-20 rounded-lg overflow-hidden animate-pulse" style={{ filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))' }}>
              <img src="/images/logo.png" alt="Heritage Lanka Logo" className="h-full w-full object-contain" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4 font-dancing-script">
          Heritage <span className="ml-1">Lanka</span>
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
          <p className="text-lg font-poppins">Loading your adventure...</p>
        </div>

        {/* Loading Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-600 to-orange-600 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
