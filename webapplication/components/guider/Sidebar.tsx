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
  TicketPercent  
} from "lucide-react";

import axios from "axios";
import { useState } from "react";


const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: PlaneTakeoff, label: "Jobs", href: "/guider/jobs" },
  { icon: History, label: "Payment History", href: "/guider/History" },
];

export function AppSidebar() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    try {
      setLoading(true);
      await axios.post("/api/auth/signout");
      window.location.href = "/auth/signin";
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
