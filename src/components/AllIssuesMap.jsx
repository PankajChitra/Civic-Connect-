import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

export default function AllIssuesMap({ issues }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Wait for container to exist before initializing
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map once
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);
  }, []);

  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    // Remove old markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    const map = mapInstanceRef.current;
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Colored icons
    const iconUrls = {
      Pending:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      "In Progress":
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
      Resolved:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    };

    const shadowUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

    const markers = [];

    issues
      .filter((i) => i.locationCoords)
      .forEach((issue) => {
        const { lat, lng } = issue.locationCoords;

        const icon = L.icon({
          iconUrl: iconUrls[issue.status] || iconUrls["Pending"],
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });

        const popupContent = `
          <b>${issue.title}</b><br/>
          🏷️ <b>Category:</b> ${issue.category}<br/>
          📍 <b>Location:</b> ${
            issue.locationText || "Not specified"
          }<br/>
          ⚙️ <b>Status:</b> <span style="color:${
            issue.status === "Resolved"
              ? "green"
              : issue.status === "In Progress"
              ? "orange"
              : "red"
          }">${issue.status}</span>
        `;

        const marker = L.marker([lat, lng], { icon })
          .addTo(markersLayer)
          .bindPopup(popupContent);

        markers.push(marker);
      });

    // Fit all markers
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

  return (
    <div className="page-container">
      <h2 className="form-title">🗺️ All Reported Issues</h2>

      <div ref={mapRef} className="all-issues-map"></div>

      {/* Legend */}
      <div className="map-legend">
        <span>
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
            alt=""
          />{" "}
          Pending
        </span>
        <span>
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png"
            alt=""
          />{" "}
          In Progress
        </span>
        <span>
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
            alt=""
          />{" "}
          Resolved
        </span>
      </div>

      {issues.filter((i) => i.locationCoords).length === 0 && (
        <p
          className="empty-text"
          style={{ textAlign: "center", marginTop: "10px" }}
        >
          No issues with map locations yet.
        </p>
      )}
    </div>
  );
}
