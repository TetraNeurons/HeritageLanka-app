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
} from "lucide-react";

import axios from "axios";
import { useState } from "react";
import { usePathname } from "next/navigation";

import {
  Dialog,
  DialogContent,
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
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t-2 border-gray-200 shadow-2xl">
        <nav className="flex items-center justify-around px-4 py-3 max-w-screen-xl mx-auto">
          {/* Home */}
          <a
            href="/traveler/dashboard"
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 rounded-xl transition-all ${
              isActive("/traveler/dashboard")
                ? "text-amber-600"
                : "text-gray-600"
            }`}
          >
            <LayoutDashboard className={`h-7 w-7 ${isActive("/traveler/dashboard") ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className={`text-xs mt-1 font-poppins ${isActive("/traveler/dashboard") ? 'font-semibold' : 'font-medium'}`}>
              Home
            </span>
          </a>

          {/* Plan Trip */}
          <a
            href="/traveler/plan"
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 rounded-xl transition-all ${
              isActive("/traveler/plan")
                ? "text-amber-600"
                : "text-gray-600"
            }`}
          >
            <BookOpen className={`h-7 w-7 ${isActive("/traveler/plan") ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className={`text-xs mt-1 font-poppins ${isActive("/traveler/plan") ? 'font-semibold' : 'font-medium'}`}>
              Plan
            </span>
          </a>

          {/* More Menu (Center Button) */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex flex-col items-center justify-center min-w-[64px] py-1 rounded-xl text-gray-600 transition-all">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Menu className="h-6 w-6 text-white stroke-[2.5]" />
                </div>
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-md p-6 rounded-2xl bg-white/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Menu
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {/* Places */}
                <a
                  href="/traveler/places"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md transition-all"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold font-poppins text-gray-800">Places</span>
                </a>

                {/* Reviews */}
                <a
                  href="/traveler/reviews"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md transition-all"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold font-poppins text-gray-800">Reviews</span>
                </a>

                {/* History */}
                <a
                  href="/traveler/history"
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-amber-300 hover:shadow-md transition-all"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
                    <History className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold font-poppins text-gray-800">History</span>
                </a>

                {/* Emergency */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 border-2 border-red-200 hover:border-red-300 hover:shadow-md transition-all">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-2">
                        <PhoneCall className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold font-poppins text-red-700">Emergency</span>
                    </button>
                  </DialogTrigger>

                  <DialogContent className="max-w-md p-6 rounded-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
                        Emergency Services
                      </DialogTitle>
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

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all col-span-2"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mb-2">
                    <LogOut className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold font-poppins text-gray-800">
                    {loading ? "Signing out..." : "Sign Out"}
                  </span>
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* My Trips */}
          <a
            href="/traveler/plans"
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 rounded-xl transition-all ${
              isActive("/traveler/plans")
                ? "text-amber-600"
                : "text-gray-600"
            }`}
          >
            <Calendar className={`h-7 w-7 ${isActive("/traveler/plans") ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className={`text-xs mt-1 font-poppins ${isActive("/traveler/plans") ? 'font-semibold' : 'font-medium'}`}>
              My Trips
            </span>
          </a>

          {/* Events */}
          <a
            href="/traveler/events"
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 rounded-xl transition-all ${
              isActive("/traveler/events")
                ? "text-amber-600"
                : "text-gray-600"
            }`}
          >
            <Calendar className={`h-7 w-7 ${isActive("/traveler/events") ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className={`text-xs mt-1 font-poppins ${isActive("/traveler/events") ? 'font-semibold' : 'font-medium'}`}>
              Events
            </span>
          </a>
        </nav>
      </div>
    </>
  );
}
