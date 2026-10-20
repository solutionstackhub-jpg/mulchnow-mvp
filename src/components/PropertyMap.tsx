"use client";

import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  center: [number, number];
  area: number; // sq ft
}

/**
 * Generate a rough polygon around a center point to visualize measured bed area.
 * The polygon size scales with the reported square footage.
 */
function generateBedPolygon(
  center: [number, number],
  sqFt: number
): [number, number][] {
  // Convert sqft to approximate meters on each side
  const sideMeters = Math.sqrt(sqFt * 0.0929); // sqft → sqm, then sqrt
  // Degrees per meter at this latitude (rough)
  const latDeg = sideMeters / 111_320;
  const lngDeg = sideMeters / (111_320 * Math.cos((center[0] * Math.PI) / 180));

  const [lat, lng] = center;
  const halfLat = latDeg / 2;
  const halfLng = lngDeg / 2;

  // Slightly irregular polygon (looks more natural than a perfect rectangle)
  return [
    [lat + halfLat * 0.9, lng - halfLng * 0.85],
    [lat + halfLat * 0.7, lng + halfLng * 0.95],
    [lat - halfLat * 0.85, lng + halfLng * 0.8],
    [lat - halfLat * 0.95, lng - halfLng * 0.7],
    [lat - halfLat * 0.3, lng - halfLng * 1.05],
  ];
}

export default function PropertyMap({ center, area }: PropertyMapProps) {
  const polygon = generateBedPolygon(center, area);

  return (
    <div className="w-full h-[350px] rounded-xl overflow-hidden border border-gray-200 shadow-inner">
      <MapContainer
        center={center}
        zoom={18}
        scrollWheelZoom={false}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polygon
          positions={polygon}
          pathOptions={{
            color: "#28773b",
            fillColor: "#38934c",
            fillOpacity: 0.35,
            weight: 2,
            dashArray: "6, 4",
          }}
        />
      </MapContainer>
    </div>
  );
}
