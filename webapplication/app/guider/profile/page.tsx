"use client";

import { AppSidebar } from "@/components/guider/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/Avatar";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import axios from "axios";

export default function GuiderProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
  });
  const [bioLength, setBioLength] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/profile/me");
      if (response.data.success) {
        const profileData = response.data.profile;
        setProfile(profileData);
        setFormData({
          name: profileData.name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
        });
        setBioLength(profileData.bio?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "bio") {
      setBioLength(value.length);
    }
  };

  const handleSave = async () => {
    try {
      // Validate bio length
      if (formData.bio.length > 500) {
        toast.error("Bio must be 500 characters or less");
        return;
      }

      setSaving(true);
      const response = await axios.put("/api/profile/me", formData);
      
      if (response.data.success) {
        toast.success("Profile updated successfully!");
        await fetchProfile();
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post("/api/profile/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Profile image uploaded successfully!");
        await fetchProfile();
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      toast.error(error.response?.data?.error || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      setUploading(true);
      const response = await axios.delete("/api/profile/image");
      
      if (response.data.success) {
        toast.success("Profile image deleted successfully!");
        await fetchProfile();
      }
    } catch (error: any) {
      console.error("Failed to delete image:", error);
      toast.error(error.response?.data?.error || "Failed to delete image");
    } finally {
      setUploading(false);
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
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="hidden md:block mb-4">
                  <SidebarTrigger />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-poppins">
                  Edit Profile
                </h1>
                <p className="text-gray-600 mt-2 text-base font-medium">
                  Manage your profile information
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <Card className="bg-white/95 backdrop-blur-md shadow-xl border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="font-poppins">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center gap-4 pb-6 border-b">
                    <Avatar
                      imageUrl={profile?.profileImageUrl}
                      name={profile?.name || "User"}
                      size="lg"
                      clickable={false}
                    />
                    <div className="flex gap-2">
                      <label htmlFor="image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading}
                          className="cursor-pointer"
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Upload Image
                        </Button>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {profile?.profileImageUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading}
                          onClick={handleImageDelete}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      JPEG, PNG, or WebP. Max 5MB.
                    </p>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="bio">Bio</Label>
                      <span className={`text-xs ${bioLength > 500 ? "text-red-600" : "text-gray-500"}`}>
                        {bioLength}/500
                      </span>
                    </div>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                    />
                  </div>

                  {/* Read-only fields */}
                  <div className="pt-4 border-t space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-500">Email</Label>
                        <p className="text-sm font-medium">{profile?.email}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Role</Label>
                        <p className="text-sm font-medium capitalize">{profile?.role?.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold font-poppins shadow-lg"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchProfile}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
