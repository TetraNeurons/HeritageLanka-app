'use client';

import { PlaceResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Phone, Globe, Navigation } from 'lucide-react';

interface PlaceResultCardProps {
  place: PlaceResult;
  index: number;
  onGetDirections: () => void;
  onMapFocus: () => void;
}

export function PlaceResultCard({
  place,
  index,
  onGetDirections,
  onMapFocus,
}: PlaceResultCardProps) {
  return (
    <div
      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onMapFocus}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-black mb-1">{place.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{place.category}</p>
        </div>
        <span className="text-sm font-semibold text-gray-500 ml-2">
          #{index + 1}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{place.address}</span>
        </div>

        {place.rating && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{place.rating}</span>
            {place.ratingCount && (
              <span className="text-gray-600">({place.ratingCount} reviews)</span>
            )}
          </div>
        )}

        {place.phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-600" />
            <a
              href={`tel:${place.phoneNumber}`}
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {place.phoneNumber}
            </a>
          </div>
        )}

        {place.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-gray-600" />
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              Visit website
            </a>
          </div>
        )}
      </div>

      <Button
        variant="default"
        size="sm"
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          onGetDirections();
        }}
      >
        <Navigation className="w-4 h-4 mr-2" />
        Get Directions
      </Button>
    </div>
  );
}
