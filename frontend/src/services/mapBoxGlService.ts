const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export interface MapboxLocationResult {
    id: string;
    name: string;
    coordinates: [number, number];
  }

export const mapboxService = {
  async reverseGeocode(
    coordinates: [number, number],
  ): Promise<string> {
    const [lng, lat] = coordinates;

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,district`,
    );

    if (!response.ok) {
      throw new Error("Failed to reverse geocode location");
    }

    const data = await response.json();

    return (
      data.features?.[0]?.place_name ??
      `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    );
  },
  
  async searchLocations(
      query: string,
    ): Promise<MapboxLocationResult[]> {
      if (!query.trim()) {
        return [];
      }
    
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query,
        )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`,
      );
    
      if (!response.ok) {
        throw new Error("Failed to search locations");
      }
    
      const data = await response.json();
    
      return (data.features ?? []).map(
        (feature: {
          id: string;
          place_name: string;
          center: [number, number];
        }) => ({
          id: feature.id,
          name: feature.place_name,
          coordinates: feature.center,
        }),
      );
    }
};