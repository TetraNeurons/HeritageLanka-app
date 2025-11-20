"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Advertisement {
  id: string;
  imageUrl: string;
  description: string;
  redirectUrl: string;
}

export function AdDisplay() {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has closed ads in this session
    const adClosed = sessionStorage.getItem("adClosed");
    if (adClosed === "true") {
      setLoading(false);
      return;
    }

    fetchAd();
  }, []);

  const fetchAd = async () => {
    try {
      const response = await fetch("/api/traveler/advertisements/random");
      const data = await response.json();

      if (data.success && data.advertisement) {
        setAd(data.advertisement);
        setVisible(true);
        
        // Track view
        await fetch(`/api/traveler/advertisements/${data.advertisement.id}/view`, {
          method: "POST",
        });
      }
    } catch (error) {
      console.error("Error fetching advertisement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("adClosed", "true");
  };

  const handleClick = () => {
    if (ad) {
      window.open(ad.redirectUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading || !visible || !ad) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="w-[300px] shadow-2xl border-2 overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 h-6 w-6 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div
            onClick={handleClick}
            className="cursor-pointer group"
          >
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={ad.imageUrl}
                alt="Advertisement"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
                }}
              />
            </div>
            
            <CardContent className="p-4">
              <p className="text-sm text-gray-700 line-clamp-3 group-hover:text-primary transition-colors">
                {ad.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click to learn more
              </p>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
