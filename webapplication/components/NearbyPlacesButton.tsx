'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface NearbyPlacesButtonProps {
  locationName: string;
  latitude: number;
  longitude: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function NearbyPlacesButton({
  locationName,
  latitude,
  longitude,
  variant = 'outline',
  size = 'sm',
}: NearbyPlacesButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to nearby places page with location parameters
    const params = new URLSearchParams({
      name: locationName,
      lat: latitude.toString(),
      lng: longitude.toString(),
    });
    router.push(`/traveler/nearby?${params.toString()}`);
  };

  return (
    <Button variant={variant} size={size} onClick={handleClick}>
      <MapPin className="size-4" />
      Find Nearby Places
    </Button>
  );
}
