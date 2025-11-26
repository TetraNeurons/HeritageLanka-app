"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Eye, Trash2, CheckCircle, XCircle, Power, PowerOff } from "lucide-react";

type AdStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";

interface Advertisement {
  id: string;
  imageUrl: string;
  description: string;
  redirectUrl: string;
  paymentReference: string;
  status: AdStatus;
  viewCount: number;
  submittedAt: string;
  updatedAt: string;
}

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvertisements();
  }, [statusFilter]);

  const fetchAdvertisements = async () => {
    setLoading(true);
    try {
      const url = statusFilter === "all" 
        ? "/api/admin/advertisements"
        : `/api/admin/advertisements?status=${statusFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAdvertisements(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: AdStatus) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchAdvertisements();
      }
    } catch (error) {
      console.error("Error updating advertisement:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAdvertisement = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (data.success) {
        fetchAdvertisements();
      }
    } catch (error) {
      console.error("Error deleting advertisement:", error);
    } finally {
      setActionLoading(null);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: AdStatus) => {
    const variants: Record<AdStatus, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      ACTIVE: { color: "bg-green-100 text-green-800 border-green-200", label: "Active" },
      INACTIVE: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Inactive" },
      REJECTED: { color: "bg-red-100 text-red-800 border-red-200", label: "Rejected" },
    };

    const variant = variants[status];
    return (
      <Badge className={`${variant.color} border`} variant="outline">
        {variant.label}
      </Badge>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-8">
            <div className="hidden md:block mb-4">
              <SidebarTrigger />
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Advertisements
              </h1>
              <p className="text-gray-600 mt-2 font-poppins">Manage advertisement submissions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Total Ads</div>
                  <div className="text-3xl font-bold font-poppins text-gray-900">{advertisements.length}</div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Active</div>
                  <div className="text-3xl font-bold font-poppins text-green-600">
                    {advertisements.filter(ad => ad.status === "ACTIVE").length}
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Pending</div>
                  <div className="text-3xl font-bold font-poppins text-yellow-600">
                    {advertisements.filter(ad => ad.status === "PENDING").length}
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="text-sm font-poppins font-medium text-gray-600 mb-2">Total Views</div>
                  <div className="text-3xl font-bold font-poppins text-blue-600">
                    {advertisements.reduce((sum, ad) => sum + ad.viewCount, 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold font-poppins text-gray-900">All Advertisements</h2>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
                  </div>
                ) : advertisements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No advertisements found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Payment Ref</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {advertisements.map((ad) => (
                          <TableRow key={ad.id}>
                            <TableCell>
                              <img
                                src={ad.imageUrl}
                                alt="Ad"
                                className="h-12 w-12 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/48";
                                }}
                              />
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="text-sm line-clamp-2">{ad.description}</p>
                              <a
                                href={ad.redirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {ad.redirectUrl}
                              </a>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {ad.paymentReference}
                              </code>
                            </TableCell>
                            <TableCell>{getStatusBadge(ad.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span>{ad.viewCount}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(ad.submittedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {ad.status === "PENDING" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateStatus(ad.id, "ACTIVE")}
                                      disabled={actionLoading === ad.id}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateStatus(ad.id, "REJECTED")}
                                      disabled={actionLoading === ad.id}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {ad.status === "ACTIVE" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatus(ad.id, "INACTIVE")}
                                    disabled={actionLoading === ad.id}
                                  >
                                    <PowerOff className="h-4 w-4" />
                                  </Button>
                                )}
                                {ad.status === "INACTIVE" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatus(ad.id, "ACTIVE")}
                                    disabled={actionLoading === ad.id}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Power className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteId(ad.id)}
                                  disabled={actionLoading === ad.id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this advertisement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteAdvertisement(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
