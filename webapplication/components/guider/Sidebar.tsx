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
  History,
  Globe,
  LogOut,
  Star,
  Menu,
  Briefcase,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import axios from "axios";
import { useState } from "react";
import { usePathname } from "next/navigation";


const menuItems = [
  { icon: Home, label: "Dashboard", href: "/guider/dashboard" },
  { icon: PlaneTakeoff, label: "My Jobs", href: "/guider/jobs" },
  { icon: Star, label: "My Reviews", href: "/guider/reviews" },
];

export function AppSidebar() {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  async function handleSignOut() {
    try {
      setLoading(true);
      await axios.post("/api/auth/signout");
      window.location.href = "/auth/signin";
    } finally {
      setLoading(false);
    }
  }

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar className="w-64 hidden lg:flex">
        <SidebarHeader className="p-6 border-b">
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="Heritage Lanka" 
              className="h-12 w-12 object-contain drop-shadow-lg"
            />
            <div>
              <h2 className="text-xl font-bold font-dancing-script drop-shadow-md">Heritage Lanka</h2>
              <p className="text-sm text-muted-foreground font-poppins">Guide</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="space-y-2 pt-4">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <a
                    href={item.href}
                    className={`flex items-center gap-4 p-4 h-8 text-lg font-poppins font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-amber-100 text-amber-700 font-semibold shadow-md"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-6 border-t">
          <SidebarMenuButton
            onClick={handleSignOut}
            disabled={loading}
            className="w-full justify-start text-black/70 flex items-center gap-3 h-5 text-lg font-poppins font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-6 w-6" />
            {loading ? "Signing out..." : "Sign Out"}
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Bottom App Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t-2 border-gray-200 shadow-2xl">
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
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50"
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
