"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      <div className="flex h-screen w-full bg-white">
        <AppSidebar />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">Manage Events</h1>
            <Button 
              onClick={() => router.push('/admin/events/create')}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No events found. Create your first event!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-6">
                    <img
                      src={event.images[0]}
                      alt={event.title}
                      className="w-48 h-32 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-black mb-3">{event.title}</h2>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> {event.date}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {event.place}
                        </p>
                        <p className="flex items-center gap-2 font-semibold text-black">
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