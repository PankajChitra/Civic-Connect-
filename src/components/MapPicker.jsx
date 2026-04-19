import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

export default function MapPicker({ onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.4089, 77.3178], // Faridabad, Haryana
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Click to set marker
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setMarker(lat, lng);
    });

    mapRef.current = map;

    // Fix sizing after render
    setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Helper: set or move marker + notify parent
  const setMarker = (lat, lng) => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
        mapRef.current
      );

      markerRef.current.on("dragend", (event) => {
        const pos = event.target.getLatLng();
        onLocationSelect(pos);
      });
    }

    mapRef.current.setView([lat, lng], 15);
    onLocationSelect({ lat, lng });
  };

  // Geolocation (Use My Location)
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarker(latitude, longitude);
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  };

  // Autocomplete: fetch suggestions from Nominatim
  useEffect(() => {
    if (!searchText || searchText.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchText
          )}&addressdetails=1&limit=5`,
          {
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400); // debounce

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchText]);

  // Handle selecting a suggestion
  const handleSuggestionClick = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    setMarker(lat, lon);
    setSearchText(item.display_name);
    setShowSuggestions(false);
  };

  // Handle submit (Enter key / Search button)
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    // if suggestions already loaded, use first
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchText
        )}&addressdetails=1&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        handleSuggestionClick(data[0]);
      } else {
        alert("No location found. Try a more specific name.");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching location.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="map-picker-wrapper">
      {/* Search + Autocomplete */}
      <form className="map-search-form" onSubmit={handleSearchSubmit}>
        <div className="map-search-input-wrapper">
          <input
            type="text"
            className="map-search-input"
            placeholder="Search location (e.g. Sector 15 Faridabad)"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="map-suggestions">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="map-suggestion-item"
                  onClick={() => handleSuggestionClick(item)}
                >
                  {item.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="map-search-btn">
          {isLoading ? "Searching..." : "🔍 Search"}
        </button>

        <button
          type="button"
          className="map-btn"
          onClick={handleMyLocation}
          style={{ marginLeft: "0.5rem" }}
        >
          📍 Use My Location
        </button>
      </form>

      {/* Map container */}
      <div ref={mapContainerRef} id="map-picker-container"></div>
    </div>
  );
}
