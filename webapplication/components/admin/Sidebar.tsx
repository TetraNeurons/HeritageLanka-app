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
  Users,
  History,
  Globe,
  LogOut,
  TicketPercent,
  Plane,
  Receipt,
  Megaphone,
  Brain,
  Menu,
  X,
  MessageSquare
} from "lucide-react";

import axios from "axios";
import { useState } from "react";
import { usePathname } from "next/navigation";


const menuItems = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "User Management", href: "/admin/users" },
  { icon: Globe, label: "Guide Verification", href: "/admin/guides" },
  { icon: Plane, label: "Trip Management", href: "/admin/trips" },
  { icon: TicketPercent, label: "Events & Offers", href: "/admin/events" },
  { icon: Megaphone, label: "Advertisements", href: "/admin/advertisements" },
  { icon: MessageSquare, label: "Feedback", href: "/admin/feedback" },
  { icon: Receipt, label: "Payments", href: "/admin/payments" },
  { icon: Brain, label: "AI Analytics", href: "/admin/ai-analytics" },
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

  // Main navigation items for bottom bar
  const mainNavItems = [
    { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Plane, label: "Trips", href: "/admin/trips" },
    { icon: TicketPercent, label: "Events", href: "/admin/events" },
  ];

  // Additional menu items for center button popup
  const moreMenuItems = [
    { icon: Megaphone, label: "Advertisements", href: "/admin/advertisements" },
    { icon: MessageSquare, label: "Feedback", href: "/admin/feedback" },
    { icon: Receipt, label: "Payments", href: "/admin/payments" },
    { icon: Brain, label: "AI Analytics", href: "/admin/ai-analytics" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex w-64">
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
          <p className="text-sm text-muted-foreground font-poppins font-medium pl-1">Admin Dashboard</p>
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

      <SidebarFooter className="p-6 border-t">
        <SidebarMenuButton
          onClick={handleSignOut}
          disabled={loading}
          className="w-full justify-start text-black/70 flex items-center gap-3 h-5 text-lg font-medium font-poppins"
        >
          <LogOut className="h-6 w-6" />
          {loading ? "Signing out..." : "Sign Out"}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50">
        <div className="flex items-center justify-around px-2 py-3">
          {/* First two nav items */}
          {mainNavItems.slice(0, 2).map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive(item.href)
                  ? "bg-amber-100 text-amber-700"
                  : "text-gray-600 hover:text-amber-600"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium font-poppins">{item.label}</span>
            </a>
          ))}

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

          {/* Remaining nav items */}
          {mainNavItems.slice(2).map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive(item.href)
                  ? "bg-amber-100 text-amber-700"
                  : "text-gray-600 hover:text-amber-600"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium font-poppins">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Menu Popup */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
            <div className="p-2">
              {moreMenuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(item.href)
                      ? "bg-amber-100 text-amber-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium font-poppins">{item.label}</span>
                </a>
              ))}
              
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
