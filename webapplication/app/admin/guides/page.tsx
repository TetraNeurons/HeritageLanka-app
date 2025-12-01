"use client";

import { AppSidebar } from "@/components/admin/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/Avatar";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Clock, Shield } from "lucide-react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Guide {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  nic: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  isLegacy: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
}

export default function AdminGuidesPage() {
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGuides();
  }, [statusFilter]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/admin/guides/pending"
          : `/api/admin/guides/pending?status=${statusFilter}`;
      const response = await axios.get(url);
      if (response.data.success) {
        setGuides(response.data.guides);
      }
    } catch (error) {
      console.error("Failed to fetch guides:", error);
      toast.error("Failed to load guides");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (guideId: string) => {
    try {
      setActionLoading(true);
      const response = await axios.post(`/api/admin/guides/${guideId}/verify`);
      if (response.data.success) {
        toast.success("Guide verified successfully!");
        await fetchGuides();
      }
    } catch (error: any) {
      console.error("Failed to verify guide:", error);
      toast.error(error.response?.data?.error || "Failed to verify guide");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (guide: Guide) => {
    setSelectedGuide(guide);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedGuide || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.post(
        `/api/admin/guides/${selectedGuide.id}/reject`,
        { reason: rejectionReason }
      );
      if (response.data.success) {
        toast.success("Guide rejected successfully");
        setRejectDialogOpen(false);
        setSelectedGuide(null);
        setRejectionReason("");
        await fetchGuides();
      }
    } catch (error: any) {
      console.error("Failed to reject guide:", error);
      toast.error(error.response?.data?.error || "Failed to reject guide");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (guide: Guide) => {
    if (guide.isLegacy) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="h-3 w-3 mr-1" />
          Verified (Legacy)
        </Badge>
      );
    }

    switch (guide.verificationStatus) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "VERIFIED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 md:pb-8">
            <div className="mb-8">
              <div className="hidden md:block mb-4">
                <SidebarTrigger />
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-poppins">
                    Guide Verification
                  </h1>
                  <p className="text-gray-600 mt-2 text-base font-medium">
                    Review and verify guide applications
                  </p>
                </div>

                <div className="w-full md:w-64">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Guides</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {guides.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-md shadow-xl border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No guides found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {guides.map((guide) => (
                  <Card
                    key={guide.id}
                    className="bg-white/95 backdrop-blur-md shadow-xl border-2 border-gray-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar
                            imageUrl={null}
                            name={guide.name}
                            size="md"
                            clickable={false}
                          />
                          <div>
                            <CardTitle className="font-poppins text-xl">
                              {guide.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{guide.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(guide)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-500 text-xs">Phone</Label>
                          <p className="text-sm font-medium">{guide.phone}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-xs">NIC</Label>
                          <p className="text-sm font-medium">{guide.nic}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-xs">Languages</Label>
                          <p className="text-sm font-medium">
                            {guide.languages.join(", ")}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-xs">Rating</Label>
                          <p className="text-sm font-medium">
                            {guide.rating.toFixed(1)} ({guide.totalReviews} reviews)
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-xs">Joined</Label>
                          <p className="text-sm font-medium">
                            {new Date(guide.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {guide.verifiedAt && (
                          <div>
                            <Label className="text-gray-500 text-xs">Verified At</Label>
                            <p className="text-sm font-medium">
                              {new Date(guide.verifiedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {guide.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <Label className="text-red-700 text-xs font-semibold">
                            Rejection Reason
                          </Label>
                          <p className="text-sm text-red-600 mt-1">
                            {guide.rejectionReason}
                          </p>
                        </div>
                      )}

                      {guide.verificationStatus === "PENDING" && !guide.isLegacy && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            onClick={() => handleVerify(guide.id)}
                            disabled={actionLoading}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 font-bold font-poppins shadow-lg"
                          >
                            {actionLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Verify Guide
                          </Button>
                          <Button
                            onClick={() => handleRejectClick(guide)}
                            disabled={actionLoading}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 font-bold font-poppins"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Guide Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedGuide?.name}'s application.
              This will be visible to the guide.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={actionLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
