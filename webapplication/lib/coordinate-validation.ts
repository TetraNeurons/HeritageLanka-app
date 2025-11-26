/**
 * Validates if the given coordinates are valid geographic coordinates
 * @param lat - Latitude value
 * @param lng - Longitude value
 * @returns true if coordinates are valid, false otherwise
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    !isNaN(lat) && 
    !isNaN(lng) &&
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180
  );
}
