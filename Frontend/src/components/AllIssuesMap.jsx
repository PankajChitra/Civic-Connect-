// src/components/AllIssuesMap.jsx
// Pure display component — receives issues[] as prop, owns no data fetching
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

const ICON_URLS = {
  Pending:      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  "In Progress":"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  Resolved:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
};
const SHADOW_URL = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

export default function AllIssuesMap({ issues }) {
  const mapRef          = useRef(null);
  const mapInstanceRef  = useRef(null);
  const markersLayerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // ── Init map once ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { center: [20.5937, 78.9629], zoom: 5 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    mapInstanceRef.current = map;
    setIsMapReady(true);
  }, []);

  // ── Re-render markers when issues change ─────────────────────────────────
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    if (markersLayerRef.current) markersLayerRef.current.clearLayers();

    const map          = mapInstanceRef.current;
    const layer        = L.layerGroup().addTo(map);
    markersLayerRef.current = layer;
    const markers      = [];

    issues
      .filter((i) => i.locationCoords)
      .forEach((issue) => {
        const { lat, lng } = issue.locationCoords;
        const icon = L.icon({
          iconUrl:   ICON_URLS[issue.status] || ICON_URLS.Pending,
          shadowUrl: SHADOW_URL,
          iconSize:  [25, 41],
          iconAnchor:[12, 41],
        });
        const statusColor = issue.status === "Resolved" ? "green"
          : issue.status === "In Progress" ? "orange" : "red";

        const marker = L.marker([lat, lng], { icon })
          .addTo(layer)
          .bindPopup(`
            <b>${issue.title}</b><br/>
            🏷️ <b>Category:</b> ${issue.category}<br/>
            📍 <b>Location:</b> ${issue.locationText || "Not specified"}<br/>
            ⚙️ <b>Status:</b>
            <span style="color:${statusColor};font-weight:600">${issue.status}</span>
          `);
        markers.push(marker);
      });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(group.getBounds().pad(0.3));
      }, 200);
    } else {
      map.setView([20.5937, 78.9629], 5);
    }
  }, [issues, isMapReady]);

  const withCoords = issues.filter((i) => i.locationCoords);

  return (
    <div className="page-container">
      <h2 className="form-title">🗺️ All Reported Issues</h2>

      <div ref={mapRef} className="all-issues-map" />

      {/* Legend */}
      <div className="map-legend">
        {Object.entries(ICON_URLS).map(([label, url]) => (
          <span key={label}>
            <img src={url} alt={label} /> {label}
          </span>
        ))}
      </div>

      {withCoords.length === 0 && (
        <p className="empty-text" style={{ textAlign: "center", marginTop: 10 }}>
          No issues with map locations yet.
        </p>
      )}
    </div>
  );
}
