"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppSidebar } from "@/components/admin/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import DateTimePicker from "@/components/DateTimePicker";

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    setImages([...images, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);

    if (!eventDate) {
      toast.error("Please select event date and time");
      return;
    }

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
      
      // Append image files
      images.forEach((image, index) => {
        formDataToSend.append(`image${index}`, image);
      });

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        body: formDataToSend,
      });

      if (res.ok) {
        toast.success('Event created successfully');
        router.push('/admin/events');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        <AppSidebar />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-black mb-8">Create New Event</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Event Images (Max 3)</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex gap-4 flex-wrap">
                    {previews.map((preview, idx) => (
                      <div key={idx} className="relative">
                        <img src={preview} alt={`Preview ${idx + 1}`} className="w-32 h-32 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {images.length < 3 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
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
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}