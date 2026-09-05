"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Pothole = {
  id: number;
  latitude: number | null;
  longitude: number | null;
  severity: string | null;
  confidence: number | null;
  status: string;
  description?: string | null;
};

type LeafletMapProps = {
  potholes: Pothole[];
  center: [number, number];
  zoom: number;
};

function MapControls() {
  const map = useMap();

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col overflow-hidden rounded-xl border border-white/20 bg-[#102a43]/95 shadow-xl">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="border-b border-white/10 p-3 text-white transition hover:bg-white/10"
        aria-label="Zoom in"
      >
        +
      </button>

      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="p-3 text-white transition hover:bg-white/10"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}

function RecenterMap({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

function getSeverityColor(severity: string | null) {
  switch ((severity || "").toLowerCase()) {
    case "critical":
      return "#dc2626";
    case "high":
      return "#f97316";
    case "medium":
      return "#2563eb";
    case "low":
      return "#16a34a";
    default:
      return "#64748b";
  }
}

export default function LeafletMapInner({
  potholes,
  center,
  zoom,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full"
      style={{ minHeight: "620px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={center} />
      <MapControls />

      {potholes
        .filter(
          (pothole) =>
            pothole.latitude !== null &&
            pothole.longitude !== null
        )
        .map((pothole) => {
          const color = getSeverityColor(pothole.severity);

          return (
            <CircleMarker
              key={pothole.id}
              center={[
                pothole.latitude as number,
                pothole.longitude as number,
              ]}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillColor: color,
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <div className="min-w-[190px] text-sm">
                  <div className="mb-2 text-base font-bold text-[#102a43]">
                    Pothole #{pothole.id}
                  </div>

                  <div className="space-y-1 text-[#486581]">
                    <div>
                      <strong>Severity:</strong>{" "}
                      {pothole.severity || "Unknown"}
                    </div>

                    <div>
                      <strong>Confidence:</strong>{" "}
                      {pothole.confidence !== null &&
                      pothole.confidence !== undefined
                        ? `${(pothole.confidence * 100).toFixed(1)}%`
                        : "N/A"}
                    </div>

                    <div>
                      <strong>Status:</strong>{" "}
                      {pothole.status}
                    </div>

                    <div>
                      <strong>Latitude:</strong>{" "}
                      {pothole.latitude?.toFixed(6)}
                    </div>

                    <div>
                      <strong>Longitude:</strong>{" "}
                      {pothole.longitude?.toFixed(6)}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
    </MapContainer>
  );
}