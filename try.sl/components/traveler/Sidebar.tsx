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
  MessageSquare,
  History,
  Globe,
  LogOut,
  PhoneCall,
  Shield,
  Ambulance,
  CarFront,
  Flame,
  Ship,
  TicketPercent  
} from "lucide-react";

import axios from "axios";
import { useState } from "react";

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
  { icon: Plane, label: "Planner", href: "/traveler/plan" },
  { icon: TicketPercent, label: "Events & Offers", href: "/traveler/events" }, // NEW
  { icon: History, label: "History", href: "/traveler/History" },
];

export function AppSidebar() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    try {
      setLoading(true);
      await axios.post("/api/auth/logout");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sidebar className="w-64">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Globe className="h-10 w-10 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold">Heritage Lanka</h2>
            <p className="text-sm text-muted-foreground">Sri Lanka</p>
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
                  className="flex items-center gap-4 p-4 h-8 text-lg font-medium hover:bg-muted rounded-lg"
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
  );
}
