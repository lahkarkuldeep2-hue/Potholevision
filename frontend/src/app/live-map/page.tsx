"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Map,
  Navigation,
  LocateFixed,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PotholeMap from "@/components/map/PotholeMap";

type Pothole = {
  id: number;
  latitude: number | null;
  longitude: number | null;
  severity: string | null;
  confidence: number | null;
  status: string;
  description?: string | null;
};

const API_URL = "https://potholevision.onrender.com";

export default function LiveMapPage() {
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [center, setCenter] = useState<[number, number]>([
    23.0225,
    72.5714,
  ]);

  const [zoom, setZoom] = useState(12);

  const fetchPotholes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/map/potholes`);

      if (!response.ok) {
        throw new Error("Unable to load pothole map data");
      }

      const data = await response.json();

      const records: Pothole[] = Array.isArray(data)
        ? data
        : data.potholes || data.data || [];

      setPotholes(records);

      const firstWithGps = records.find(
        (pothole) =>
          pothole.latitude !== null &&
          pothole.longitude !== null
      );

      if (firstWithGps) {
        setCenter([
          firstWithGps.latitude as number,
          firstWithGps.longitude as number,
        ]);
      }
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to PotholeVision backend. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPotholes();
  }, []);

  const gpsPotholes = useMemo(
    () =>
      potholes.filter(
        (pothole) =>
          pothole.latitude !== null &&
          pothole.longitude !== null
      ),
    [potholes]
  );

  const criticalCount = potholes.filter(
    (p) => p.severity?.toLowerCase() === "critical"
  ).length;

  const highCount = potholes.filter(
    (p) => p.severity?.toLowerCase() === "high"
  ).length;

  const mediumCount = potholes.filter(
    (p) => p.severity?.toLowerCase() === "medium"
  ).length;

  const lowCount = potholes.filter(
    (p) => p.severity?.toLowerCase() === "low"
  ).length;

  const locateFirstPothole = () => {
    if (gpsPotholes.length > 0) {
      const first = gpsPotholes[0];

      setCenter([
        first.latitude as number,
        first.longitude as number,
      ]);

      setZoom(16);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-w-0">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#55779d]">
            Live Monitoring
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-[#102a43] sm:text-3xl">
                Live Infrastructure Map
              </h1>

              <p className="mt-1 text-sm text-[#6b8299]">
                Real-time pothole locations and GPS activity
              </p>
            </div>

            <div className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#c8d5e1] bg-[#f8fafc] px-4 py-3 text-sm text-[#315a82] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              GPS Active
            </div>
          </div>
        </div>

        {/* Map Card */}
        <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#c8d5e1] bg-[#f8fafc] shadow-[0_8px_30px_rgba(16,42,67,0.08)]">
          {/* Card Header */}
          <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[#d7e0e8] px-4 py-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-xl bg-[#e8f0f7] p-2.5 text-[#376b9d]">
                <Map size={20} />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-[#102a43]">
                  PotholeVision GPS Network
                </h2>

                <p className="text-xs text-[#7890a6]">
                  {loading
                    ? "Loading live locations..."
                    : `${gpsPotholes.length} GPS locations from database`}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={locateFirstPothole}
                title="Locate potholes"
                className="rounded-lg border border-[#cbd8e4] bg-white p-2 text-[#426887] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#eef3f7] hover:shadow-md"
              >
                <LocateFixed size={18} />
              </button>

              <button
                type="button"
                onClick={fetchPotholes}
                title="Refresh map data"
                className="rounded-lg border border-[#cbd8e4] bg-white p-2 text-[#426887] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#eef3f7] hover:shadow-md"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="relative h-[520px] w-full min-w-0 overflow-hidden sm:h-[620px]">
            {error ? (
              <div className="flex h-full w-full items-center justify-center bg-[#263b50] px-4 text-center sm:px-6">
                <div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-[#102a43] p-5 text-white shadow-xl sm:p-6">
                  <div className="mb-3 text-lg font-semibold">
                    Map data unavailable
                  </div>

                  <p className="text-sm text-white/70">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchPotholes}
                    className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#102a43] transition hover:bg-white/90"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                <PotholeMap
                  potholes={potholes}
                  center={center}
                  zoom={zoom}
                />

                {/* Live Overlay */}
                <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-xl border border-white/20 bg-[#102a43]/95 px-3 py-2.5 text-white shadow-xl sm:left-5 sm:top-5 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2">
                    <Navigation
                      size={14}
                      className="text-[#8eb5d8]"
                    />

                    <p className="text-[10px] font-semibold tracking-wide sm:text-xs">
                      LIVE GPS MONITORING
                    </p>
                  </div>

                  <p className="mt-1 text-[9px] text-[#b9c9d8] sm:text-[10px]">
                    Real PostgreSQL pothole locations
                  </p>
                </div>

                {/* Legend */}
                <div className="absolute bottom-3 left-3 z-[1000] rounded-xl border border-white/20 bg-[#102a43]/95 px-3 py-2.5 text-[10px] text-white shadow-xl sm:bottom-5 sm:left-5 sm:px-4 sm:py-3 sm:text-xs">
                  <p className="mb-2 font-semibold">Severity</p>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:gap-x-4">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
                      Critical ({criticalCount})
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
                      High ({highCount})
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                      Medium ({mediumCount})
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-600" />
                      Low ({lowCount})
                    </span>
                  </div>
                </div>

                {/* Bottom Status */}
                <div className="absolute bottom-3 right-3 z-[1000] flex max-w-[calc(100%-24px)] items-center gap-2 rounded-xl border border-white/20 bg-[#102a43]/95 px-3 py-2.5 text-[10px] text-white shadow-xl sm:bottom-5 sm:right-5 sm:gap-4 sm:px-4 sm:py-3 sm:text-xs">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    {gpsPotholes.length} GPS locations
                  </span>

                  <span className="text-white/30">|</span>

                  <span className="whitespace-nowrap">
                    {potholes.length} total potholes
                  </span>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}