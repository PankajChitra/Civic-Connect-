// src/components/MapPicker.jsx
// Pure UI component — receives onLocationSelect callback, owns no external state
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

export default function MapPicker({ onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const markerRef       = useRef(null);

  const [searchText,      setSearchText]      = useState("");
  const [suggestions,     setSuggestions]     = useState([]);
  const [isLoading,       setIsLoading]       = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── Init map once ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.4089, 77.3178],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e) => setMarker(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 400);

    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Place / move marker ───────────────────────────────────────────────────
  const setMarker = (lat, lng) => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        onLocationSelect({ lat: pos.lat, lng: pos.lng });
      });
    }
    mapRef.current.setView([lat, lng], 15);
    onLocationSelect({ lat, lng });
  };

  // ── Use device location ───────────────────────────────────────────────────
  const handleMyLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setMarker(coords.latitude, coords.longitude),
      () => alert("Unable to retrieve location.")
    );
  };

  // ── Nominatim autocomplete ────────────────────────────────────────────────
  useEffect(() => {
    if (!searchText || searchText.trim().length < 3) { setSuggestions([]); return; }
    const controller = new AbortController();
    const id = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&addressdetails=1&limit=5`,
          { headers: { Accept: "application/json" }, signal: controller.signal }
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch { /* aborted */ }
      finally { setIsLoading(false); }
    }, 400);
    return () => { clearTimeout(id); controller.abort(); };
  }, [searchText]);

  const handleSuggestionClick = (item) => {
    setMarker(parseFloat(item.lat), parseFloat(item.lon));
    setSearchText(item.display_name);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    if (suggestions.length > 0) { handleSuggestionClick(suggestions[0]); return; }
    try {
      setIsLoading(true);
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) handleSuggestionClick(data[0]);
      else alert("No location found. Try a more specific name.");
    } catch { alert("Error searching location."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="map-picker-wrapper">
      <form className="map-search-form" onSubmit={handleSearchSubmit}>
        <div className="map-search-input-wrapper">
          <input
            type="text"
            className="map-search-input"
            placeholder="Search location…"
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setShowSuggestions(true); }}
            onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
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
          {isLoading ? "Searching…" : "🔍 Search"}
        </button>
        <button type="button" className="map-btn" onClick={handleMyLocation}>
          📍 My Location
        </button>
      </form>

      <div ref={mapContainerRef} id="map-picker-container" />
    </div>
  );
}
