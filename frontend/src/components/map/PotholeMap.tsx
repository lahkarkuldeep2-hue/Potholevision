"use client";

import dynamic from "next/dynamic";

type Pothole = {
  id: number;
  latitude: number | null;
  longitude: number | null;
  severity: string | null;
  confidence: number | null;
  status: string;
  description?: string | null;
};

type PotholeMapProps = {
  potholes: Pothole[];
  center: [number, number];
  zoom: number;
};

const LeafletMapInner = dynamic<PotholeMapProps>(
  () => import("./LeafletMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[620px] items-center justify-center bg-[#263b50] text-sm text-white">
        Loading map...
      </div>
    ),
  }
);

export default function PotholeMap({
  potholes,
  center,
  zoom,
}: PotholeMapProps) {
  return (
    <LeafletMapInner
      potholes={potholes}
      center={center}
      zoom={zoom}
    />
  );
}