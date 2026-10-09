import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  mapboxService,
  type MapboxLocationResult,
} from "../../services/mapBoxGlService";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;

  selectedLocation?: {
    name: string;
    coordinates: [number, number];
  } | null;

  onSelect: (location: { name: string; coordinates: [number, number] }) => void;
}

const LocationPickerModal = ({
  isOpen,
  onClose,
  selectedLocation,
  onSelect,
}: LocationPickerModalProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [location, setLocation] = useState<{
    name: string;
    coordinates: [number, number];
  } | null>(selectedLocation ?? null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapboxLocationResult[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: selectedLocation?.coordinates ?? [76.2711, 10.8505],
      zoom: selectedLocation ? 10 : 7,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    if (selectedLocation) {
        markerRef.current = new mapboxgl.Marker()
          .setLngLat(selectedLocation.coordinates)
          .addTo(map);
      }

    map.on("click", async (event) => {
      const { lng, lat } = event.lngLat;

      const coordinates: [number, number] = [lng, lat];

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);

      try {
        const name = await mapboxService.reverseGeocode(coordinates);

        setLocation({
          name,
          coordinates,
        });
      } catch (error) {
        console.error("Reverse geocoding failed:", error);

        setLocation({
          name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          coordinates,
        });
      }
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      map.remove();

      markerRef.current = null;
      mapRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);

        const results = await mapboxService.searchLocations(searchQuery);

        setSearchResults(results);
      } catch (error) {
        console.error("Location search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-neutral-950 border border-border/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/10">
          <div>
            <h2 className="text-sm font-bold text-text">Select Location</h2>

            <p className="text-[10px] text-text/50 mt-1">
              Search for a place or select a location on the map
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text/50 hover:text-text transition"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="relative px-5 py-3 border-b border-border/10">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search for a city, town, or locality..."
            className="w-full bg-neutral-900 border border-border/20 rounded-lg px-3 py-2 text-xs text-text placeholder:text-text/30 outline-none focus:border-primary/50 transition"
          />
          {isSearching && (
            <div className="absolute left-5 right-5 top-full z-20 bg-neutral-950 border border-border/20 rounded-lg mt-1 px-3 py-2">
              <span className="text-[10px] text-text/40">Searching...</span>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="absolute left-5 right-5 top-full z-20 bg-neutral-950 border border-border/20 rounded-lg mt-1 overflow-hidden shadow-xl">
              {searchResults.map((result) => (
               <button
               key={result.id}
               type="button"
               onClick={() => {
                 const coordinates = result.coordinates;
             
                 setLocation({
                   name: result.name,
                   coordinates,
                 });
             
                 setSearchQuery(result.name);
                 setSearchResults([]);
             
                 if (mapRef.current) {
                   mapRef.current.flyTo({
                     center: coordinates,
                     zoom: 10,
                     essential: true,
                   });
             
                   if (markerRef.current) {
                     markerRef.current.setLngLat(coordinates);
                   } else {
                     markerRef.current = new mapboxgl.Marker()
                       .setLngLat(coordinates)
                       .addTo(mapRef.current);
                   }
                 }
               }}
               className="w-full text-left px-3 py-2 hover:bg-neutral-900 transition"
             >
               <p className="text-xs text-text">
                 {result.name}
               </p>
             </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div ref={mapContainerRef} className="h-[500px] w-full" />

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border/10">
          <div className="text-[10px] text-text/50">
            {location?.name || "No location selected"}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border/20 text-xs text-text/70 hover:text-text transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!location}
              onClick={() => {
                if (location) {
                  onSelect(location);
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-lg bg-primary text-black text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Select Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
