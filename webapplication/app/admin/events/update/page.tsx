"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AppSidebar } from "@/components/admin/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DateTimePicker from "@/components/DateTimePicker";
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

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function UpdateEventPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    place: "",
    lat: "",
    lng: "",
    phone: "",
    organizer: "",
    description: "",
    ticketCount: "",
  });

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/admin/events/${params.id}`);
      const data = await res.json();
      
      setFormData({
        title: data.title,
        price: data.price,
        place: data.place,
        lat: data.lat.toString(),
        lng: data.lng.toString(),
        phone: data.phone,
        organizer: data.organizer,
        description: data.description,
        ticketCount: data.ticketCount.toString(),
      });
      
      // Parse date - handle both ISO string and text format
      try {
        const parsedDate = new Date(data.date);
        if (!isNaN(parsedDate.getTime())) {
          setEventDate(parsedDate);
        }
      } catch (e) {
        console.error("Failed to parse date:", e);
      }
      
      setExistingImages(data.images);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;
    
    if (totalImages > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    setNewImages([...newImages, ...files]);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews([...newPreviews, ...previews]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (existingImages.length + newImages.length === 0) {
      toast.error("Please have at least one image");
      return;
    }

    if (!eventDate) {
      toast.error("Please select event date and time");
      return;
    }

    setLoading(true);

    try {
      // Create FormData and append all fields
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('date', eventDate.toISOString());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('place', formData.place);
      formDataToSend.append('lat', formData.lat);
      formDataToSend.append('lng', formData.lng);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('organizer', formData.organizer);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('ticketCount', formData.ticketCount);
      
      // Append existing images as JSON string
      formDataToSend.append('existingImages', JSON.stringify(existingImages));
      
      // Append new image files
      newImages.forEach((image, index) => {
        formDataToSend.append(`newImage${index}`, image);
      });

      const res = await fetch(`/api/admin/events/${params.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (res.ok) {
        toast.success('Event updated successfully');
        router.push('/admin/events');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/events/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Event deleted successfully');
        router.push('/admin/events');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (fetching) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading event...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        <AppSidebar />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-black">Update Event</h1>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Event Images (Max 3)</Label>
<div className="mt-2 space-y-4">
                  <div className="flex gap-4 flex-wrap">
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative">
                        <img src={img} alt={`Existing ${idx + 1}`} className="w-32 h-32 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {newPreviews.map((preview, idx) => (
                      <div key={`new-${idx}`} className="relative">
                        <img src={preview} alt={`New ${idx + 1}`} className="w-32 h-32 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {(existingImages.length + newImages.length) < 3 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Click to upload images</span>
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <DateTimePicker
                    value={eventDate}
                    onChange={setEventDate}
                    label="Event Date & Time"
                    placeholder="Select event date and time"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    placeholder="e.g., Free or $35 – $120"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="place">Location Name</Label>
                <Input
                  id="place"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  placeholder="Enter location name or select on map"
                  required
                />
              </div>

              <div>
                <Label>Select Location on Map</Label>
                <LocationPicker
                  lat={parseFloat(formData.lat) || 7.8731}
                  lng={parseFloat(formData.lng) || 80.7718}
                  onLocationChange={(lat, lng, placeName) => {
                    setFormData({
                      ...formData,
                      lat: lat.toString(),
                      lng: lng.toString(),
                      place: placeName || formData.place,
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    required
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ticketCount">Ticket Count</Label>
                <Input
                  id="ticketCount"
                  type="number"
                  value={formData.ticketCount}
                  onChange={(e) => setFormData({ ...formData, ticketCount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="bg-black hover:bg-gray-800 text-white">
                  {loading ? 'Updating...' : 'Update Event'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}