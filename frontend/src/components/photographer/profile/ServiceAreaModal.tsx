import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, MapPin, Loader2, Navigation, Check } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { IServiceArea } from "../../../types/serviceArea";

interface ServiceAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaData?: IServiceArea | null;
  onSave: (data: {
    _id?: string;
    name: string;
    center: { type: "Point"; coordinates: [number, number] };
    radiusKm: number;
  }) => void;
}

interface GeocodingFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
mapboxgl.accessToken = MAPBOX_TOKEN;

interface GeoJSONPolygonFeature {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
  properties: Record<string, unknown>;
}

// Helper to generate a 64-point geodesic polygon approximating a circle on a sphere
function createGeoJSONCircle(
  center: [number, number],
  radiusInKm: number,
  points = 64,
): GeoJSONPolygonFeature {
  const [lng, lat] = center;
  const coords: [number, number][] = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }
  coords.push(coords[0]); // close loop

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
    properties: {},
  };
}

const ServiceAreaModal = ({
  isOpen,
  onClose,
  areaData,
  onSave,
}: ServiceAreaModalProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number]>([
    76.2711, 10.8505,
  ]); // Default Kerala center
  const [radiusKm, setRadiusKm] = useState(30);

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync state with incoming areaData
  useEffect(() => {
    if (areaData) {
      setName(areaData.name);
      setCoordinates([
        areaData.center.coordinates[0],
        areaData.center.coordinates[1],
      ]);
      setRadiusKm(areaData.radiusKm);
      setSearchQuery(areaData.name);
    } else {
      setName("");
      setCoordinates([76.2711, 10.8505]);
      setRadiusKm(30);
      setSearchQuery("");
    }
    setErrorMessage("");
    setShowDropdown(false);
    setSearchResults([]);
  }, [areaData, isOpen]);

  // Reverse geocoding helper
  const reverseGeocode = useCallback(
    async (lng: number, lat: number) => {
      if (!MAPBOX_TOKEN) return;
      setIsReverseGeocoding(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=locality,place,district,neighborhood&limit=1`,
        );
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const place = data.features[0].place_name;
          setName(place);
          setSearchQuery(place);
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [],
  );

  // Update or add circle layer to map
  const updateMapCircle = useCallback(
    (map: mapboxgl.Map, center: [number, number], radius: number) => {
      const source = map.getSource(
        "service-area-circle",
      ) as mapboxgl.GeoJSONSource | undefined;
      const circleData = createGeoJSONCircle(center, radius);

      if (source) {
        source.setData(circleData);
      } else {
        map.addSource("service-area-circle", {
          type: "geojson",
          data: circleData,
        });

        map.addLayer({
          id: "service-area-circle-fill",
          type: "fill",
          source: "service-area-circle",
          paint: {
            "fill-color": "#e11d48",
            "fill-opacity": 0.18,
          },
        });

        map.addLayer({
          id: "service-area-circle-stroke",
          type: "line",
          source: "service-area-circle",
          paint: {
            "line-color": "#e11d48",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });
      }
    },
    [],
  );

  // Initialize Mapbox map on modal open
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const initialCenter = areaData
      ? ([
          areaData.center.coordinates[0],
          areaData.center.coordinates[1],
        ] as [number, number])
      : ([76.2711, 10.8505] as [number, number]);

    const initialRadius = areaData ? areaData.radiusKm : 30;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCenter,
      zoom: areaData ? 9 : 7,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const marker = new mapboxgl.Marker({
      draggable: true,
      color: "#e11d48",
    })
      .setLngLat(initialCenter)
      .addTo(map);

    markerRef.current = marker;
    mapRef.current = map;

    map.on("load", () => {
      updateMapCircle(map, initialCenter, initialRadius);
      map.resize();
    });

    // Marker drag event
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      const newCoords: [number, number] = [lngLat.lng, lngLat.lat];
      setCoordinates(newCoords);
      updateMapCircle(map, newCoords, radiusKm);
      reverseGeocode(lngLat.lng, lngLat.lat);
    });

    // Map click event to place marker
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      const newCoords: [number, number] = [lng, lat];
      marker.setLngLat(newCoords);
      setCoordinates(newCoords);
      updateMapCircle(map, newCoords, radiusKm);
      reverseGeocode(lng, lat);
    });

    // Resize after animation completes
    const timer = setTimeout(() => {
      map.resize();
    }, 250);

    return () => {
      clearTimeout(timer);
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [isOpen, areaData, reverseGeocode, updateMapCircle]);

  // Sync circle on radius slider change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      updateMapCircle(mapRef.current, coordinates, radiusKm);
    }
  }, [radiusKm, coordinates, updateMapCircle]);

  // Forward geocoding search with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const handler = setTimeout(async () => {
      if (!MAPBOX_TOKEN) return;
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchQuery,
          )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`,
        );
        const data = await res.json();
        if (data.features) {
          setSearchResults(data.features);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Geocoding search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Handle selecting location from search suggestions
  const handleSelectPlace = (feature: GeocodingFeature) => {
    const [lng, lat] = feature.center;
    const newCoords: [number, number] = [lng, lat];

    setName(feature.place_name);
    setSearchQuery(feature.place_name);
    setCoordinates(newCoords);
    setShowDropdown(false);
    setErrorMessage("");

    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat(newCoords);
      mapRef.current.flyTo({
        center: newCoords,
        zoom: 10,
        essential: true,
      });
      updateMapCircle(mapRef.current, newCoords, radiusKm);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please specify a location name or search for a city.");
      return;
    }

    onSave({
      _id: areaData?._id,
      name: name.trim(),
      center: {
        type: "Point",
        coordinates,
      },
      radiusKm,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0f1012] border border-border/30 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-border/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold text-text tracking-wide">
                {areaData ? "Edit Service Area" : "Add Service Area"}
              </h3>
              <p className="text-[11px] text-text-secondary">
                Search, drop pin, and select coverage radius
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text rounded-lg hover:bg-neutral-900 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Search Location Bar */}
          <div className="relative">
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
              Search Location / City
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                {isSearching ? (
                  <Loader2 size={15} className="animate-spin text-primary" />
                ) : (
                  <Search size={15} />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setName(e.target.value);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Type a city or town name (e.g. Kanhangad, Kochi)..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-border/20 rounded-xl text-text text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-[#141518] border border-border/30 rounded-xl shadow-2xl z-20 overflow-hidden divide-y divide-border/10 max-h-56 overflow-y-auto">
                {searchResults.map((feature) => (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => handleSelectPlace(feature)}
                    className="w-full px-4 py-2.5 text-left text-xs hover:bg-primary/10 flex items-center gap-2.5 transition-colors cursor-pointer group"
                  >
                    <Navigation
                      size={13}
                      className="text-text-secondary group-hover:text-primary shrink-0"
                    />
                    <span className="text-text group-hover:text-primary transition-colors truncate">
                      {feature.place_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Map Canvas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1.5 font-medium">
                <Navigation size={12} className="text-primary" />
                Interactive Map (Click or drag pin to position)
              </span>
              {isReverseGeocoding && (
                <span className="flex items-center gap-1 text-[11px] text-primary">
                  <Loader2 size={11} className="animate-spin" />
                  Resolving place name...
                </span>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden border border-border/20 shadow-inner">
              <div
                ref={mapContainerRef}
                style={{ width: "100%", height: "290px" }}
                className="bg-neutral-950"
              />
              {/* Coordinates Badge Overlay */}
              <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md border border-border/30 px-2.5 py-1 rounded-lg text-[10px] text-text font-mono flex items-center gap-2 select-none shadow">
                <span className="text-primary font-semibold">Center:</span>
                <span>
                  {coordinates[0].toFixed(4)}° E, {coordinates[1].toFixed(4)}° N
                </span>
              </div>
            </div>
          </div>

          {/* Radius Selector */}
          <div className="bg-neutral-900/60 border border-border/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Service Radius
              </label>
              <span className="px-2.5 py-1 bg-primary/15 border border-primary/30 rounded-lg text-primary text-xs font-bold font-mono">
                {radiusKm} km
              </span>
            </div>

            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />

            {/* Quick preset chips */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-text-secondary mr-1">Presets:</span>
              {[15, 30, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRadiusKm(preset)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition cursor-pointer border ${
                    radiusKm === preset
                      ? "bg-primary text-white border-primary"
                      : "bg-neutral-800 text-text-secondary border-border/20 hover:border-border/40 hover:text-text"
                  }`}
                >
                  {preset} km
                </button>
              ))}
            </div>
          </div>

          {/* Location Name Confirmation Input */}
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage("");
              }}
              placeholder="e.g. Kanhangad, Kerala, India"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-border/20 rounded-xl text-text text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text hover:bg-neutral-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition cursor-pointer"
            >
              <Check size={14} />
              <span>{areaData ? "Update Area" : "Save Area"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceAreaModal;
