import React from "react";
import { Route } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
  size?: number;
}

export function LoadingSpinner({
  label = "PREPARING YOUR WORKSPACE",
  size = 23,
}: LoadingSpinnerProps) {
  return (
    <div className="pv-loader flex flex-col items-center justify-center gap-8">
      <div className="pv-scene">
        <div className="pv-orbit pv-orbit-one" />
        <div className="pv-orbit pv-orbit-two" />

        <div className="pv-road-platform">
          <div className="pv-road-surface">
            <div className="pv-road-center" />
            <div className="pv-road-edge pv-road-edge-left" />
            <div className="pv-road-edge pv-road-edge-right" />

            <div className="pv-pothole">
              <div className="pv-pothole-inner" />
              <div className="pv-pothole-scan" />
            </div>

            <div className="pv-scan-beam" />
          </div>
          <div className="pv-platform-side" />
        </div>

        <div className="pv-scanner">
          <div className="pv-scanner-core" />
          <div className="pv-scanner-light" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C8A96B]/40 bg-[#222831] text-[#C8A96B]">
            <Route size={size} strokeWidth={1.6} />
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold tracking-[0.12em] text-[#F4E9D0]">
              POTHOLEVISION
            </p>
            <p className="text-[9px] tracking-[0.32em] text-[#C8A96B]">
              ROAD INTELLIGENCE
            </p>
          </div>
        </div>

        <p className="mt-2 text-[10px] font-semibold tracking-[0.28em] text-[#F4E9D0]">
          {label}
        </p>
        <p className="text-xs text-[#8B969E]">
          Initializing intelligent infrastructure systems
        </p>

        <div className="pv-progress-track">
          <div className="pv-progress-fill" />
        </div>
      </div>
    </div>
  );
}

export function CompactLoader({ label = "PROCESSING..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="pv-compact-orbit">
        <div />
      </div>
      <span className="text-xs font-medium tracking-wider text-[#C8A96B]">
        {label}
      </span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-[#343B43]/70 ${className}`}
    />
  );
}

export function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#101317] px-5">
      <LoadingSpinner />
    </main>
  );
}

export function DetectionResultsSkeleton() {
  return (
    <div className="min-w-0 space-y-5" role="status" aria-label="Loading detection results">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#343B43] bg-[#222831] p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-16" />
        </div>
        <div className="rounded-xl border border-[#343B43] bg-[#222831] p-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-8 w-20" />
        </div>
      </div>

      <div className="rounded-xl border border-[#343B43] bg-[#222831] p-4">
        <Skeleton className="h-4 w-36" />
        <div className="mt-5 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
