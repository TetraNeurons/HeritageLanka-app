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
  Globe,
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
} from "lucide-react";

import axios from "axios";
import { useState } from "react";
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
      <Sidebar className="w-64 hidden md:flex">
        <SidebarHeader className="p-6 border-b">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden" style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' }}>
                <img src="/images/logo.png" alt="Heritage Lanka Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 font-dancing-script">
                Heritage <span className="ml-1">Lanka</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-poppins font-medium pl-1">Traveler Dashboard</p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="space-y-2 pt-4">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <a
                    href={item.href}
                    className={`flex items-center gap-4 p-4 h-8 text-lg font-medium rounded-lg transition-colors font-poppins ${
                      isActive(item.href)
                        ? "bg-amber-100 text-amber-700 font-semibold"
                        : "hover:bg-muted"
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

        {/* Emergency Button */}
        <div className="px-6 mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 p-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md w-full">
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

        <SidebarFooter className="p-6 border-t">
          <SidebarMenuButton
            onClick={handleSignOut}
            disabled={loading}
            className="w-full justify-start text-black/70 flex items-center gap-3 h-5 text-lg font-medium"
          >
            <LogOut className="h-6 w-6" />
            {loading ? "Signing out..." : "Sign Out"}
          </SidebarMenuButton>
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

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 mt-2 border-t pt-4"
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
