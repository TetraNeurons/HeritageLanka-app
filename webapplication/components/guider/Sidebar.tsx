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
  PlaneTakeoff,
  LogOut,
  Star,
  Menu,
  Briefcase,
  X,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import axios from "axios";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/Avatar";

const PROFILE_CACHE_KEY = "user_profile_cache";


const menuItems = [
  { icon: Home, label: "Dashboard", href: "/guider/dashboard" },
  { icon: PlaneTakeoff, label: "My Jobs", href: "/guider/jobs" },
  { icon: Star, label: "My Reviews", href: "/guider/reviews" },
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
              <img 
                src="/images/logo.png" 
                alt="Heritage Lanka" 
                className="h-7 w-7 object-contain brightness-0 invert"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 font-dancing-script leading-tight">Heritage Lanka</h2>
              <p className="text-xs text-gray-500 font-poppins">Guide</p>
            </div>
          </a>
          
          {/* User Avatar */}
          {userProfile && (
            <a href="/guider/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
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
          {/* Dashboard */}
          <a
            href="/guider/dashboard"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive("/guider/dashboard")
                ? "bg-amber-100 text-amber-700"
                : "text-gray-600 hover:text-amber-600"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium font-poppins">Home</span>
          </a>

          {/* My Jobs */}
          <a
            href="/guider/jobs"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive("/guider/jobs")
                ? "bg-amber-100 text-amber-700"
                : "text-gray-600 hover:text-amber-600"
            }`}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs font-medium font-poppins">Jobs</span>
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

          {/* My Reviews */}
          <a
            href="/guider/reviews"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive("/guider/reviews")
                ? "bg-amber-100 text-amber-700"
                : "text-gray-600 hover:text-amber-600"
            }`}
          >
            <Star className="h-5 w-5" />
            <span className="text-xs font-medium font-poppins">Reviews</span>
          </a>

          {/* Placeholder for symmetry */}
          <div className="min-w-[64px] opacity-0">
            {/* Empty space for visual balance */}
          </div>
        </nav>

        {/* Menu Popup */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
            <div className="p-2">
              {/* Home Page */}
              <a
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                onClick={() => setMenuOpen(false)}
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium font-poppins">Visit Home Page</span>
              </a>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 bg-red-50 hover:bg-red-100 mt-2 border border-red-200"
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
