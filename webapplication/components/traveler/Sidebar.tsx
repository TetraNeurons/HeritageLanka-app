"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

import {
  Home,
  Plane,
  Map,
  History,
  LogOut,
  PhoneCall,
  Shield,
  Ambulance,
  CarFront,
  Flame,
  Ship,
  TicketPercent,
  PlaneLanding,
  Star,
  LayoutDashboard,
  MapPin,
  Calendar,
  BookOpen,
  Menu,
  X,
  Globe,
} from "lucide-react";

import axios from "axios";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/Avatar";

const PROFILE_CACHE_KEY = "user_profile_cache";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Plane, label: "Plan Trip", href: "/traveler/plan" },
  { icon: PlaneLanding, label: "My Trips", href: "/traveler/plans" },
  { icon: Map, label: "Explore Places", href: "/traveler/places" },
  { icon: TicketPercent, label: "Events & Offers", href: "/traveler/events" },
  { icon: Star, label: "My Reviews", href: "/traveler/reviews" },
  { icon: History, label: "Payment History", href: "/traveler/history" },
];

export function AppSidebar() {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<{
    id: string;
    name: string;
    profileImageUrl: string | null;
  } | null>(null);

  // Fetch user profile with localStorage caching
  useEffect(() => {
    async function fetchProfile() {
      // Try to get cached profile from localStorage
      try {
        const cachedData = localStorage.getItem(PROFILE_CACHE_KEY);
        if (cachedData) {
          const cachedProfile = JSON.parse(cachedData);
          setUserProfile(cachedProfile);
          return;
        }
      } catch (error) {
        console.error("Failed to parse cached profile:", error);
      }

      // Fetch from API if no cache
      try {
        const response = await axios.get("/api/profile/me");
        if (response.data.success) {
          const profile = {
            id: response.data.profile.id,
            name: response.data.profile.name,
            profileImageUrl: response.data.profile.profileImageUrl,
          };
          // Cache the profile in localStorage
          localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }
    fetchProfile();
  }, []);

  async function handleSignOut() {
    try {
      setLoading(true);
      await axios.post("/api/auth/signout");
      // Clear cached profile from localStorage on sign out
      localStorage.removeItem(PROFILE_CACHE_KEY);
      window.location.href = "/auth/signin";
    } finally {
      setLoading(false);
    }
  }

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar className="w-64 hidden md:flex border-r">
        <SidebarHeader className="p-5 border-b">
          <a href="/" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
              <img src="/images/logo.png" alt="Heritage Lanka Logo" className="h-7 w-7 object-contain brightness-0 invert" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 font-dancing-script leading-tight">Heritage Lanka</h2>
              <p className="text-xs text-gray-500 font-poppins">Traveler</p>
            </div>
          </a>
          
          {/* User Avatar */}
          {userProfile && (
            <a href="/traveler/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              <Avatar
                imageUrl={userProfile.profileImageUrl}
                name={userProfile.name}
                size="md"
                clickable={false}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-poppins text-gray-900 truncate">
                  {userProfile.name}
                </p>
                <p className="text-xs text-gray-500 font-poppins">View Profile</p>
              </div>
            </a>
          )}
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all font-poppins ${
                      isActive(item.href)
                        ? "bg-amber-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        {/* Emergency Button */}
        <div className="px-3 mb-3">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg w-full transition-colors font-poppins">
                <PhoneCall className="h-4 w-4" />
                Emergency Help
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-md p-6 rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Emergency Services
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Emergency contact numbers for tourists in Sri Lanka
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Tourist Police */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Tourist Police</span>
                  </div>
                  <a href="tel:1912">
                    <Button variant="outline" className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4" />
                      1912
                    </Button>
                  </a>
                </div>

                {/* Ambulance */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Ambulance className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Suwaseriya Ambulance</span>
                  </div>
                  <a href="tel:1990">
                    <Button variant="outline" className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4" />
                      1990
                    </Button>
                  </a>
                </div>

                {/* Police Emergency */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CarFront className="h-5 w-5 text-black" />
                    <span className="font-medium">Police Emergency</span>
                  </div>
                  <a href="tel:118">
                    <Button variant="outline" className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4" />
                      118
                    </Button>
                  </a>
                </div>

                {/* Fire Rescue */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Fire Rescue</span>
                  </div>
                  <a href="tel:110">
                    <Button variant="outline" className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4" />
                      110
                    </Button>
                  </a>
                </div>

                {/* Coast Guard */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Ship className="h-5 w-5 text-blue-800" />
                    <span className="font-medium">Coast Guard</span>
                  </div>
                  <a href="tel:117">
                    <Button variant="outline" className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4" />
                      117
                    </Button>
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <SidebarFooter className="p-3 border-t">
          <div className="space-y-2">
            {/* Home Page Link */}
            <a
              href="/"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-poppins border border-blue-200"
            >
              <Globe className="h-4 w-4" />
              Visit Home Page
            </a>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-poppins border border-red-200"
            >
              <LogOut className="h-4 w-4" />
              {loading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Bottom App Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t-2 border-gray-200 shadow-2xl">
        <nav className="flex items-center justify-around px-2 py-3 max-w-screen-xl mx-auto">
          {/* Home */}
          <a
            href="/traveler/dashboard"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive("/traveler/dashboard")
                ? "bg-amber-100 text-amber-700"
                : "text-gray-600 hover:text-amber-600"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-medium font-poppins">Home</span>
          </a>

          {/* Plan Trip */}
          <a
            href="/traveler/plan"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive("/traveler/plan")
                ? "bg-amber-100 text-amber-700"
                : "text-gray-600 hover:text-amber-600"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-medium font-poppins">Plan</span>
          </a>

          {/* Center More Button - placed in middle */}
          <div className="flex-0 px-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="More"
              className="-mt-6 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-transform transform-gpu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="text-center mt-1">
              <span className="text-xs font-medium font-poppins text-gray-700">More</span>
            </div>
          </div>

          {/* My Trips */}
          <a
            href="/traveler/plans"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive("/traveler/plans")
                ? "bg-amber-100 text-amber-700"
                : "text-gray-600 hover:text-amber-600"
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium font-poppins">My Trips</span>
          </a>

          {/* Events */}
          <a
            href="/traveler/events"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive("/traveler/events")
                ? "bg-amber-100 text-amber-700"
                : "text-gray-600 hover:text-amber-600"
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium font-poppins">Events</span>
          </a>
        </nav>

        {/* Menu Popup */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
            <div className="p-2">
              {/* Places */}
              <a
                href="/traveler/places"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive("/traveler/places")
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium font-poppins">Explore Places</span>
              </a>

              {/* Reviews */}
              <a
                href="/traveler/reviews"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive("/traveler/reviews")
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <Star className="h-5 w-5" />
                <span className="text-sm font-medium font-poppins">My Reviews</span>
              </a>

              {/* History */}
              <a
                href="/traveler/history"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive("/traveler/history")
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <History className="h-5 w-5" />
                <span className="text-sm font-medium font-poppins">Payment History</span>
              </a>

              {/* Emergency */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50">
                    <PhoneCall className="h-5 w-5" />
                    <span className="text-sm font-medium font-poppins">Emergency Help</span>
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-md p-4 rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                      Emergency Services
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Emergency contact numbers for tourists in Sri Lanka
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 mt-3">
                    {/* Tourist Police */}
                    <div className="flex items-center justify-between p-2.5 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Tourist Police</span>
                      </div>
                      <a href="tel:1912">
                        <Button variant="outline" className="flex items-center gap-1.5 h-8 text-xs">
                          <PhoneCall className="h-3 w-3" />
                          1912
                        </Button>
                      </a>
                    </div>

                    {/* Ambulance */}
                    <div className="flex items-center justify-between p-2.5 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Ambulance className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Ambulance</span>
                      </div>
                      <a href="tel:1990">
                        <Button variant="outline" className="flex items-center gap-1.5 h-8 text-xs">
                          <PhoneCall className="h-3 w-3" />
                          1990
                        </Button>
                      </a>
                    </div>

                    {/* Police Emergency */}
                    <div className="flex items-center justify-between p-2.5 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CarFront className="h-4 w-4 text-black" />
                        <span className="text-sm font-medium">Police</span>
                      </div>
                      <a href="tel:118">
                        <Button variant="outline" className="flex items-center gap-1.5 h-8 text-xs">
                          <PhoneCall className="h-3 w-3" />
                          118
                        </Button>
                      </a>
                    </div>

                    {/* Fire Rescue */}
                    <div className="flex items-center justify-between p-2.5 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Fire Rescue</span>
                      </div>
                      <a href="tel:110">
                        <Button variant="outline" className="flex items-center gap-1.5 h-8 text-xs">
                          <PhoneCall className="h-3 w-3" />
                          110
                        </Button>
                      </a>
                    </div>

                    {/* Coast Guard */}
                    <div className="flex items-center justify-between p-2.5 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-blue-800" />
                        <span className="text-sm font-medium">Coast Guard</span>
                      </div>
                      <a href="tel:117">
                        <Button variant="outline" className="flex items-center gap-1.5 h-8 text-xs">
                          <PhoneCall className="h-3 w-3" />
                          117
                        </Button>
                      </a>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Home Page */}
              <a
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-blue-600 bg-blue-50 hover:bg-blue-100 mt-2 border-t pt-4 border-blue-200"
                onClick={() => setMenuOpen(false)}
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium font-poppins">Visit Home Page</span>
              </a>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium font-poppins">
                  {loading ? "Signing out..." : "Sign Out"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
