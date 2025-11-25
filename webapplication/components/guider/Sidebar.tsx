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
  Star
} from "lucide-react";

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
    <Sidebar className="w-64">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Globe className="h-10 w-10 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold">Heritage Lanka</h2>
            <p className="text-sm text-muted-foreground">Guide</p>
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
                  className={`flex items-center gap-4 p-4 h-8 text-lg font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-green-100 text-green-700 font-semibold"
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
          className="w-full justify-start text-black/70 flex items-center gap-3 h-5 text-lg font-medium"
        >
          <LogOut className="h-6 w-6" />
          {loading ? "Signing out..." : "Sign Out"}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
