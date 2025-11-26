"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AppSidebar } from "@/components/admin/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MapPin, Calendar, Ticket } from "lucide-react";
import { EventItem } from "@/lib/types";
import { toast } from "sonner";
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

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEventId) return;

    try {
      const res = await fetch(`/api/admin/events/${deleteEventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEvents(events.filter(e => e.id !== deleteEventId));
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleteEventId(null);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading events...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold font-poppins bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Manage Events</h1>
                <p className="text-gray-600 mt-2 font-poppins">Create and manage events & promotional offers</p>
              </div>
              <Button 
                onClick={() => router.push('/admin/events/create')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-poppins shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-poppins font-medium text-gray-600 mb-2">Total Events</p>
                    <p className="text-3xl font-bold font-poppins text-gray-900">{events.length}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-poppins font-medium text-gray-600 mb-2">Active Events</p>
                    <p className="text-3xl font-bold font-poppins text-green-600">
                      {events.filter(e => e.date && new Date(e.date) >= new Date()).length}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
                    <Ticket className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-poppins font-medium text-gray-600 mb-2">Upcoming</p>
                    <p className="text-3xl font-bold font-poppins text-purple-600">
                      {events.filter(e => e.date && new Date(e.date) > new Date()).length}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl p-12">
              <div className="text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-poppins">No events found. Create your first event!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/95 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="p-6 flex gap-6">
                    <img
                      src={event.images[0]}
                      alt={event.title}
                      className="w-48 h-32 object-cover rounded-xl"
                    />
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-3">{event.title}</h2>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4 font-poppins">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> 
                          {event.date ? (() => {
                            try {
                              const date = new Date(event.date);
                              return format(date, "PPP 'at' p");
                            } catch {
                              return event.date;
                            }
                          })() : 'No date'}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {event.place}
                        </p>
                        <p className="flex items-center gap-2 font-semibold text-amber-600">
                          Price: {event.price}
                        </p>
                        <p className="flex items-center gap-2">
                          <Ticket className="w-4 h-4" /> {event.ticketCount} tickets
                        </p>
                      </div>

                      <p className="text-gray-700 line-clamp-2 mb-4">{event.description}</p>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/events/${event.id}`)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteEventId(event.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteEventId} onOpenChange={(open) => !open && setDeleteEventId(null)}>
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}