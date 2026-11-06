"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Plus,
  RefreshCw,
  Route,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";

import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import PotholeMap from "@/components/map/PotholeMap";

const API_URL = "https://potholevision.onrender.com";

const C = {
  bg: "#101317",
  panel: "#181D23",
  panel2: "#222831",
  gold: "#C8A96B",
  ivory: "#F4E9D0",
  muted: "#8B969E",
  red: "#A33A3A",
  green: "#72977D",
  border: "rgba(200,169,107,0.16)",
};

type Pothole = {
  id: number;
  latitude: number | null;
  longitude: number | null;
  severity: string | null;
  confidence: number | null;
  image_path?: string | null;
  status: string;
  description?: string | null;
  created_at?: string | null;
};

type Inspection = {
  id: number;
  pothole_id: number;
  complaint_id?: number | null;
  inspector_name: string;
  inspection_notes?: string | null;
  confirmed_severity?: string | null;
  status: string;
  inspected_at?: string | null;
  created_at?: string | null;
};

type WorkOrder = {
  id: number;
  pothole_id: number;
  inspection_id?: number | null;
  contractor_name: string;
  work_description: string;
  priority: string;
  status: string;
  estimated_cost?: number | null;
  scheduled_date?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "â€”";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "â€”";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "â€”";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "â€”";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border bg-[#181D23] ${className}`}
      style={{ borderColor: C.border }}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C8A96B]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-semibold tracking-tight text-[#F4E9D0]">
          {title}
        </h2>
      </div>

      {action && (
        <button
          onClick={onAction}
          className="flex shrink-0 items-center gap-1 text-xs text-[#C8A96B] transition hover:text-[#F4E9D0]"
        >
          {action}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

function Badge({ value }: { value: string }) {
  const normalized = (value || "pending").toLowerCase();

  const color =
    normalized === "critical"
      ? "border-[#A33A3A]/40 bg-[#A33A3A]/15 text-[#E58B83]"
      : normalized === "high"
        ? "border-[#C8A96B]/40 bg-[#C8A96B]/10 text-[#D8BB83]"
        : normalized === "completed" || normalized === "resolved"
          ? "border-[#72977D]/40 bg-[#72977D]/10 text-[#9BC4A4]"
          : "border-white/10 bg-white/[0.05] text-[#AAB2B8]";

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${color}`}>
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = C.gold,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: typeof Activity;
  accent?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#181D23] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#C8A96B]/40 sm:p-5">
      <div
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.07] blur-2xl"
        style={{ background: accent }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl border"
          style={{
            color: accent,
            borderColor: `${accent}35`,
            background: `${accent}12`,
          }}
        >
          <Icon size={19} />
        </div>

        <ArrowUpRight
          size={17}
          className="text-[#626B73] transition group-hover:text-[#C8A96B]"
        />
      </div>

      <p className="relative mt-5 text-[11px] font-medium text-[#8B969E]">
        {title}
      </p>

      <div className="relative mt-1 flex items-end justify-between">
        <h3 className="text-3xl font-semibold tracking-tight text-[#F4E9D0] sm:text-4xl">
          {value}
        </h3>
      </div>

      <p className="relative mt-2 text-[10px] text-[#737D85]">
        {subtitle}
      </p>
    </div>
  );
}

function DashboardModal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#C8A96B]/20 bg-[#181D23] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/[0.08] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#F4E9D0]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-[#8B969E]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#8B969E] hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [modal, setModal] = useState<string | null>(null);
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const closeModal = () => setModal(null);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [p, i, w] = await Promise.all([
        fetch(`${API_URL}/potholes`),
        fetch(`${API_URL}/inspections`),
        fetch(`${API_URL}/work-orders`),
      ]);

      if (!p.ok) throw new Error("Unable to load pothole data");

      const pd = await p.json();
      const id = i.ok ? await i.json() : [];
      const wd = w.ok ? await w.json() : [];

      setPotholes(
        Array.isArray(pd) ? pd : pd.potholes || pd.data || []
      );
      setInspections(
        Array.isArray(id) ? id : id.inspections || id.data || []
      );
      setWorkOrders(
        Array.isArray(wd) ? wd : wd.work_orders || wd.data || []
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Dashboard data could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const gpsPotholes = useMemo(
    () =>
      potholes.filter(
        (p) =>
          typeof p.latitude === "number" &&
          typeof p.longitude === "number"
      ),
    [potholes]
  );

  const filteredPotholes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return potholes;

    return potholes.filter((p) =>
      [
        p.id,
        p.latitude,
        p.longitude,
        p.severity,
        p.status,
      ].some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [potholes, search]);

  const totalPotholes = potholes.length;
  const reportedCount = potholes.filter(
    (p) => p.status?.toLowerCase() === "reported"
  ).length;
  const inProgressCount = potholes.filter((p) =>
    ["in_progress", "under_review"].includes(p.status?.toLowerCase())
  ).length;
  const resolvedCount = potholes.filter(
    (p) => p.status?.toLowerCase() === "resolved"
  ).length;

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

  const averageConfidence =
    potholes.length > 0
      ? potholes.reduce((sum, p) => sum + (p.confidence || 0), 0) /
        potholes.length
      : 0;

  const severityData = [
    { name: "Critical", value: criticalCount, color: "#A33A3A" },
    { name: "High", value: highCount, color: "#C8A96B" },
    { name: "Medium", value: mediumCount, color: "#718A9B" },
    { name: "Low", value: lowCount, color: "#72977D" },
  ].filter((item) => item.value > 0);

  const assignedOrders = workOrders.filter(
    (o) => o.status?.toLowerCase() === "assigned"
  ).length;
  const activeOrders = workOrders.filter(
    (o) => o.status?.toLowerCase() === "in_progress"
  ).length;
  const completedOrders = workOrders.filter(
    (o) => o.status?.toLowerCase() === "completed"
  ).length;
  const pendingOrders = workOrders.length - assignedOrders - activeOrders - completedOrders;

  const workOrderChartData = [
    { name: "Assigned", value: assignedOrders, color: "#718A9B" },
    { name: "In Progress", value: activeOrders, color: "#C8A96B" },
    { name: "Completed", value: completedOrders, color: "#72977D" },
    { name: "Pending", value: pendingOrders, color: "#A33A3A" },
  ].filter((item) => item.value > 0);

  const recentInspections = [...inspections]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    )
    .slice(0, 5);

  const recentWorkOrders = [...workOrders]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    )
    .slice(0, 5);

  const mapCenter: [number, number] =
    gpsPotholes.length > 0
      ? [
          gpsPotholes[0].latitude as number,
          gpsPotholes[0].longitude as number,
        ]
      : [23.0225, 72.5714];

  const trendData = useMemo(() => {
    const days = [];

    for (let index = 6; index >= 0; index--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - index);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const detected = potholes.filter((p) => {
        if (!p.created_at) return false;
        const d = new Date(p.created_at);
        return d >= date && d < nextDate;
      }).length;

      const resolved = potholes.filter((p) => {
        if (
          p.status?.toLowerCase() !== "resolved" ||
          !p.created_at
        ) return false;

        const d = new Date(p.created_at);
        return d >= date && d < nextDate;
      }).length;

      days.push({
        day: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        detected,
        resolved,
      });
    }

    return days;
  }, [potholes]);

  const affectedLocations = useMemo(() => {
    const groups = new Map<string, { name: string; count: number }>();

    gpsPotholes.forEach((p) => {
      const lat = Number(p.latitude).toFixed(3);
      const lon = Number(p.longitude).toFixed(3);
      const key = `${lat},${lon}`;
      const existing = groups.get(key);

      if (existing) existing.count += 1;
      else groups.set(key, { name: key, count: 1 });
    });

    return Array.from(groups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [gpsPotholes]);

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#101317] px-4 py-3 text-sm text-[#F4E9D0] outline-none placeholder:text-[#626D75] focus:border-[#C8A96B]/60";

  const actionClass =
    "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#222831] px-4 py-3 text-xs font-semibold text-[#F4E9D0] transition hover:border-[#C8A96B]/50 hover:bg-[#2B323B]";

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-[#101317] px-3 pb-28 pt-5 text-[#F4E9D0] sm:px-6 sm:pb-10 lg:px-8 lg:pt-8">

        {/* PAGE HEADER */}
        <div className="mx-auto max-w-[1600px]">

          <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-px w-7 bg-[#C8A96B]" />
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#C8A96B]">
                  PotholeVision / Intelligence
                </p>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[46px]">
                Infrastructure
                <span className="block text-[#C8A96B]">Command Center.</span>
              </h1>

              <p className="mt-3 max-w-xl text-xs leading-6 text-[#8B969E] sm:text-sm">
                Monitor road conditions, AI detections and infrastructure
                maintenance operations from one intelligent workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-[#72977D]/30 bg-[#72977D]/10 px-3 py-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#72977D] opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-[#72977D]" />
                </span>
                <span className="text-[10px] font-semibold text-[#9BC4A4]">
                  LIVE SYSTEM
                </span>
              </div>

              <button onClick={loadDashboardData} className={actionClass}>
                <RefreshCw size={14} />
                Refresh
              </button>

              <button
                onClick={() => setModal("report")}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8A96B] to-[#D8BB83] px-5 py-3.5 text-xs font-bold text-[#101317] shadow-[0_8px_24px_rgba(200,169,107,0.16)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(200,169,107,0.22)] sm:min-w-[145px]"
              >
                <Plus size={15} />
                Report issue
              </button>
            </div>
          </div>

          {/* STATUS STRIP */}
          <div className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-white/[0.07] py-3 text-[10px] text-[#8B969E]">
            <span className="flex items-center gap-2">
              <Activity size={13} className="text-[#C8A96B]" />
              Infrastructure monitoring
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={13} />
              {gpsPotholes.length} GPS coordinates
            </span>
            <span className="flex items-center gap-2">
              <Clock3 size={13} />
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-IN")}` : "Awaiting data"}
            </span>
          </div>

          {error && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[#A33A3A]/30 bg-[#A33A3A]/10 p-4 text-xs text-[#E58B83]">
              {error}
              <button onClick={loadDashboardData}>
                <RefreshCw size={15} />
              </button>
            </div>
          )}

          {/* KPI GRID */}
          <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
            <StatCard
              title="Total detections"
              value={loading ? "â€”" : totalPotholes}
              subtitle="All recorded pothole reports"
              icon={Activity}
            />
            <StatCard
              title="Critical severity"
              value={loading ? "â€”" : criticalCount}
              subtitle="Requires priority attention"
              icon={AlertTriangle}
              accent={C.red}
            />
            <StatCard
              title="Under maintenance"
              value={loading ? "â€”" : inProgressCount}
              subtitle="Currently being addressed"
              icon={Wrench}
              accent="#718A9B"
            />
            <StatCard
              title="Resolved issues"
              value={loading ? "â€”" : resolvedCount}
              subtitle="Marked as resolved"
              icon={ShieldCheck}
              accent={C.green}
            />
          </div>

          {/* SEARCH */}
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]">
                Operations overview
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#F4E9D0]">
                Network intelligence
              </h2>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B969E]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, severity, status..."
                className="w-full rounded-xl border border-white/10 bg-[#181D23] py-3 pl-9 pr-4 text-xs text-[#F4E9D0] outline-none placeholder:text-[#626D75] focus:border-[#C8A96B]/50"
              />
            </div>
          </div>

          {/* MAP + SEVERITY */}
          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12">

            <Panel className="xl:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
                <SectionTitle
                  eyebrow="Geospatial intelligence"
                  title="Live infrastructure map"
                />
                <button
                  onClick={() => setModal("map")}
                  className="mb-5 flex items-center gap-1 text-[10px] font-semibold text-[#C8A96B] hover:text-[#F4E9D0]"
                >
                  Expand map <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="relative h-[310px] overflow-hidden sm:h-[390px]">
                <PotholeMap
                  potholes={gpsPotholes}
                  center={mapCenter}
                  zoom={12}
                />

                <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-lg border border-black/10 bg-[#101317]/90 px-3 py-2 backdrop-blur-md">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-[#C8A96B]">
                    GPS NETWORK
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {gpsPotholes.length}
                    <span className="ml-1 text-[9px] font-normal text-[#8B969E]">
                      locations
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-3">
                <span className="text-[9px] text-[#8B969E]">
                  Geographic pothole distribution
                </span>
                <span className="flex items-center gap-2 text-[9px] text-[#72977D]">
                  <span className="h-2 w-2 rounded-full bg-[#72977D]" />
                  GPS coordinates available
                </span>
              </div>
            </Panel>

            <Panel className="p-5 xl:col-span-4">
              <SectionTitle
                eyebrow="AI classification"
                title="Severity distribution"
              />

              <div className="relative mx-auto h-[225px] max-w-[270px]">
                {severityData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={severityData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={68}
                          outerRadius={96}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {severityData.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#222831",
                            border: "1px solid rgba(200,169,107,.2)",
                            borderRadius: 10,
                            color: "#F4E9D0",
                            fontSize: 11,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-semibold text-[#F4E9D0]">
                        {totalPotholes}
                      </span>
                      <span className="mt-1 text-[9px] uppercase tracking-widest text-[#8B969E]">
                        Detections
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-full border-[20px] border-white/[0.05]">
                    <p className="text-xs text-[#8B969E]">No severity data</p>
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-4">
                {[
                  ["Critical", criticalCount, C.red],
                  ["High", highCount, C.gold],
                  ["Medium", mediumCount, "#718A9B"],
                  ["Low", lowCount, C.green],
                ].map(([name, value, color]) => {
                  const count = Number(value);
                  const percentage = totalPotholes
                    ? (count / totalPotholes) * 100
                    : 0;

                  return (
                    <div key={String(name)}>
                      <div className="mb-2 flex justify-between text-[10px]">
                        <span className="text-[#AAB2B8]">{name}</span>
                        <span className="font-semibold text-[#F4E9D0]">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            background: String(color),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* TREND + INSPECTIONS + LOCATIONS */}
          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12">

            <Panel className="p-5 xl:col-span-6">
              <SectionTitle
                eyebrow="Performance intelligence"
                title="Detection activity"
              />

              <div className="mb-4 flex gap-5">
                <div>
                  <p className="text-[9px] text-[#8B969E]">Detected</p>
                  <p className="mt-1 text-xl font-semibold text-[#C8A96B]">
                    {trendData.reduce((s, d) => s + d.detected, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-[#8B969E]">Resolved</p>
                  <p className="mt-1 text-xl font-semibold text-[#72977D]">
                    {trendData.reduce((s, d) => s + d.resolved, 0)}
                  </p>
                </div>
              </div>

              <div className="h-[230px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      stroke="rgba(255,255,255,.06)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 9, fill: "#8B969E" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 9, fill: "#8B969E" }}
                      axisLine={false}
                      tickLine={false}
                      width={25}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#222831",
                        border: "1px solid rgba(200,169,107,.2)",
                        borderRadius: 10,
                        color: "#F4E9D0",
                        fontSize: 11,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="detected"
                      stroke="#C8A96B"
                      strokeWidth={2.5}
                      dot={{ fill: "#C8A96B", r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#72977D"
                      strokeWidth={2.5}
                      dot={{ fill: "#72977D", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex gap-5 text-[9px] text-[#8B969E]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#C8A96B]" />
                  Detected
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#72977D]" />
                  Resolved
                </span>
              </div>
            </Panel>

            <Panel className="p-5 xl:col-span-3">
              <SectionTitle
                eyebrow="Field operations"
                title="Recent inspections"
                action="View all"
                onAction={() => setModal("inspections")}
              />

              <div className="space-y-4">
                {recentInspections.length === 0 ? (
                  <p className="py-10 text-center text-xs text-[#8B969E]">
                    No inspections available.
                  </p>
                ) : (
                  recentInspections.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setModal(`inspection-${item.id}`)}
                      className="flex w-full items-center gap-3 border-b border-white/[0.06] pb-3 text-left last:border-0"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C8A96B]/10 text-[#C8A96B]">
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#F4E9D0]">
                          Pothole #{item.pothole_id}
                        </p>
                        <p className="mt-1 truncate text-[9px] text-[#8B969E]">
                          {item.inspector_name}
                        </p>
                      </div>
                      <Badge value={item.confirmed_severity || "medium"} />
                    </button>
                  ))
                )}
              </div>
            </Panel>

            <Panel className="p-5 xl:col-span-3">
              <SectionTitle
                eyebrow="Geographic hotspots"
                title="Affected locations"
                action="View all"
                onAction={() => setModal("roads")}
              />

              <div className="space-y-5">
                {affectedLocations.length === 0 ? (
                  <p className="py-10 text-center text-xs text-[#8B969E]">
                    No GPS data available.
                  </p>
                ) : (
                  affectedLocations.map((location, index) => (
                    <div key={location.name}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-[10px] text-[#AAB2B8]">
                          <MapPin size={12} className="text-[#C8A96B]" />
                          {location.name}
                        </span>
                        <span className="text-xs font-semibold text-[#F4E9D0]">
                          {location.count}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-[#C8A96B]"
                          style={{
                            width: `${(location.count / (affectedLocations[0]?.count || 1)) * 100}%`,
                            opacity: 1 - index * 0.12,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>

          {/* WORK ORDERS */}
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
            <Panel className="p-5 lg:col-span-4">
              <SectionTitle
                eyebrow="Maintenance operations"
                title="Work order status"
                action="View all"
                onAction={() => setModal("orders")}
              />

              <div className="relative mx-auto h-[200px] max-w-[240px]">
                {workOrderChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={workOrderChartData}
                          dataKey="value"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {workOrderChartData.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-semibold text-[#F4E9D0]">
                        {workOrders.length}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-[#8B969E]">
                        Orders
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-full border-[18px] border-white/[0.05] text-xs text-[#8B969E]">
                    No orders
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {workOrderChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-[9px] text-[#8B969E]">
                      {item.name}
                    </span>
                    <span className="ml-auto text-xs font-semibold text-[#F4E9D0]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="lg:col-span-8">
              <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
                <SectionTitle
                  eyebrow="Maintenance pipeline"
                  title="Recent work orders"
                  action="View all"
                  onAction={() => setModal("orders")}
                />
                <button
                  onClick={() => setModal("create")}
                  className="mb-5 hidden items-center gap-2 rounded-lg bg-[#C8A96B] px-3 py-2 text-[10px] font-bold text-[#101317] sm:flex"
                >
                  <Plus size={13} /> New order
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      {[
                        "Work order",
                        "Pothole",
                        "Priority",
                        "Contractor",
                        "Status",
                        "Date",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-[#737D85]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorkOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-xs text-[#8B969E]"
                        >
                          No work orders available.
                        </td>
                      </tr>
                    ) : (
                      recentWorkOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-white/[0.05] transition hover:bg-white/[0.025]"
                        >
                          <td className="px-4 py-4 text-xs font-semibold text-[#C8A96B]">
                            WO-{String(order.id).padStart(5, "0")}
                          </td>
                          <td className="px-4 py-4 text-xs text-[#AAB2B8]">
                            PV-{String(order.pothole_id).padStart(5, "0")}
                          </td>
                          <td className="px-4 py-4">
                            <Badge value={order.priority} />
                          </td>
                          <td className="px-4 py-4 text-xs text-[#AAB2B8]">
                            {order.contractor_name}
                          </td>
                          <td className="px-4 py-4">
                            <Badge value={order.status} />
                          </td>
                          <td className="px-4 py-4 text-[10px] text-[#8B969E]">
                            {formatDate(order.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* QUICK ACTIONS */}
          <Panel className="mb-5 p-5">
            <SectionTitle
              eyebrow="Operational shortcuts"
              title="Quick actions"
            />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { name: "Report pothole", icon: AlertTriangle, action: "report" },
                { name: "Schedule inspection", icon: CalendarDays, action: "inspection" },
                { name: "Create work order", icon: Wrench, action: "create" },
                { name: "Generate report", icon: FileText, action: "report" },
              ].map(({ name, icon: Icon, action }) => (
                <button
                  key={name}
                  onClick={() => setModal(action)}
                  className="group flex min-h-[100px] flex-col items-start justify-between rounded-xl border border-white/[0.08] bg-[#222831]/60 p-4 text-left transition hover:border-[#C8A96B]/40 hover:bg-[#222831]"
                >
                  <Icon
                    size={21}
                    className="text-[#C8A96B] transition group-hover:scale-110"
                  />
                  <span className="flex w-full items-center justify-between text-[10px] font-semibold text-[#F4E9D0]">
                    {name}
                    <ArrowUpRight size={13} className="text-[#8B969E]" />
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          {/* SYSTEM STATUS */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#C8A96B]/20 bg-gradient-to-r from-[#222831] to-[#181D23] p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#72977D]/10 text-[#72977D]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#F4E9D0]">
                  System overview
                </p>
                <p className="mt-1 text-[9px] text-[#8B969E]">
                  Dashboard service indicators
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {["AI Service", "GPS Service", "Database", "Notifications"].map(
                (service) => (
                  <span
                    key={service}
                    className="flex items-center gap-2 text-[9px] text-[#AAB2B8]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#72977D]" />
                    {service}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE QUICK ACTION */}
      <button
        onClick={() => setModal("create")}
        className="hidden sm:flex fixed bottom-20 right-4 z-40 h-12 w-12 items-center justify-center rounded-full bg-[#C8A96B] text-[#101317] shadow-xl"
        aria-label="Create work order"
      >
        <Plus size={22} />
      </button>

      {/* MODALS */}
      {modal === "create" && (
        <DashboardModal
          title="Create work order"
          description="Prepare a maintenance request."
          onClose={closeModal}
        >
          <div className="space-y-4">
            <input placeholder="Location / Pothole ID" className={inputClass} />
            <select className={inputClass} defaultValue="">
              <option value="" disabled>Select priority</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <textarea
              placeholder="Work description"
              rows={4}
              className={inputClass}
            />
            <button onClick={closeModal} className="w-full rounded-xl bg-[#C8A96B] py-3 text-xs font-bold text-[#101317]">
              Close
            </button>
            <p className="text-[10px] text-[#8B969E]">
              Backend submission is not configured yet.
            </p>
          </div>
        </DashboardModal>
      )}

      {modal === "report" && (
        <DashboardModal
          title="Report infrastructure issue"
          description="Enter the location details."
          onClose={closeModal}
        >
          <div className="space-y-4">
            <input placeholder="Latitude" className={inputClass} />
            <input placeholder="Longitude" className={inputClass} />
            <textarea placeholder="Description" rows={4} className={inputClass} />
            <button onClick={closeModal} className="w-full rounded-xl bg-[#C8A96B] py-3 text-xs font-bold text-[#101317]">
              Close
            </button>
            <p className="text-[10px] text-[#8B969E]">
              Backend submission is not configured yet.
            </p>
          </div>
        </DashboardModal>
      )}

      {modal === "inspection" && (
        <DashboardModal
          title="Schedule inspection"
          description="Select a pothole and inspection details."
          onClose={closeModal}
        >
          <div className="space-y-4">
            <select className={inputClass} defaultValue="">
              <option value="" disabled>Select pothole</option>
              {potholes.map((p) => (
                <option key={p.id} value={p.id}>
                  PV-{String(p.id).padStart(5, "0")}
                </option>
              ))}
            </select>
            <input placeholder="Inspector name" className={inputClass} />
            <input type="date" className={inputClass} />
            <button onClick={closeModal} className="w-full rounded-xl bg-[#C8A96B] py-3 text-xs font-bold text-[#101317]">
              Close
            </button>
            <p className="text-[10px] text-[#8B969E]">
              Backend submission is not configured yet.
            </p>
          </div>
        </DashboardModal>
      )}

      {modal === "date" && (
        <DashboardModal
          title="Database overview"
          description="Dashboard data currently loaded."
          onClose={closeModal}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Potholes", potholes.length],
              ["GPS records", gpsPotholes.length],
              ["Inspections", inspections.length],
              ["Work orders", workOrders.length],
              ["AI confidence", `${(averageConfidence * 100).toFixed(1)}%`],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-white/10 bg-[#222831] p-4">
                <p className="text-[10px] text-[#8B969E]">{label}</p>
                <p className="mt-2 text-xl font-semibold text-[#C8A96B]">{value}</p>
              </div>
            ))}
          </div>
        </DashboardModal>
      )}

      {modal === "map" && (
        <DashboardModal
          title="Infrastructure GPS map"
          description="Recorded pothole coordinates."
          onClose={closeModal}
        >
          <div className="h-[55vh] overflow-hidden rounded-xl">
            <PotholeMap
              potholes={gpsPotholes}
              center={mapCenter}
              zoom={12}
            />
          </div>
        </DashboardModal>
      )}

      {modal === "inspections" && (
        <DashboardModal
          title="Inspection records"
          description="Inspection activity from the backend."
          onClose={closeModal}
        >
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {inspections.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#8B969E]">No inspections available.</p>
            ) : inspections.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-[#222831] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[#F4E9D0]">
                    Inspection #{item.id}
                  </p>
                  <Badge value={item.status} />
                </div>
                <p className="mt-2 text-[10px] text-[#8B969E]">
                  Pothole #{item.pothole_id} Â· {item.inspector_name}
                </p>
                {item.inspection_notes && (
                  <p className="mt-3 text-xs text-[#AAB2B8]">{item.inspection_notes}</p>
                )}
              </div>
            ))}
          </div>
        </DashboardModal>
      )}

      {modal === "roads" && (
        <DashboardModal
          title="Affected locations"
          description="GPS-based pothole concentration."
          onClose={closeModal}
        >
          <div className="space-y-3">
            {affectedLocations.map((location, index) => (
              <div key={location.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#222831] p-4">
                <div className="flex items-center gap-3">
                  <Route size={17} className="text-[#C8A96B]" />
                  <div>
                    <p className="text-xs font-semibold text-[#F4E9D0]">Area {index + 1}</p>
                    <p className="mt-1 text-[10px] text-[#8B969E]">{location.name}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#C8A96B]">{location.count}</span>
              </div>
            ))}
            {affectedLocations.length === 0 && (
              <p className="py-8 text-center text-xs text-[#8B969E]">No GPS data available.</p>
            )}
          </div>
        </DashboardModal>
      )}

      {modal === "orders" && (
        <DashboardModal
          title="Work orders"
          description="Current maintenance workflow."
          onClose={closeModal}
        >
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {workOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#8B969E]">No work orders available.</p>
            ) : workOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-white/10 bg-[#222831] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[#C8A96B]">
                    WO-{String(order.id).padStart(5, "0")}
                  </p>
                  <Badge value={order.status} />
                </div>
                <p className="mt-2 text-[10px] text-[#8B969E]">
                  Pothole #{order.pothole_id}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#8B969E]">Contractor</span>
                  <span className="text-xs text-[#F4E9D0]">{order.contractor_name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[#8B969E]">Priority</span>
                  <Badge value={order.priority} />
                </div>
              </div>
            ))}
          </div>
        </DashboardModal>
      )}

      {modal?.startsWith("inspection-") && (
        <DashboardModal
          title="Inspection details"
          description="Inspection record."
          onClose={closeModal}
        >
          {(() => {
            const id = Number(modal.replace("inspection-", ""));
            const item = inspections.find((i) => i.id === id);

            if (!item) {
              return <p className="text-xs text-[#8B969E]">Inspection not found.</p>;
            }

            return (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-[#222831] p-4">
                  <p className="text-[10px] text-[#8B969E]">Inspection ID</p>
                  <p className="mt-1 text-lg font-semibold text-[#C8A96B]">#{item.id}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#222831] p-4">
                  <p className="text-[10px] text-[#8B969E]">Pothole</p>
                  <p className="mt-1 text-sm text-[#F4E9D0]">PV-{String(item.pothole_id).padStart(5, "0")}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#222831] p-4">
                  <p className="text-[10px] text-[#8B969E]">Inspector</p>
                  <p className="mt-1 text-sm text-[#F4E9D0]">{item.inspector_name}</p>
                </div>
                {item.inspection_notes && (
                  <div className="rounded-xl border border-white/10 bg-[#222831] p-4">
                    <p className="text-[10px] text-[#8B969E]">Notes</p>
                    <p className="mt-2 text-xs text-[#AAB2B8]">{item.inspection_notes}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Badge value={item.status} />
                  <span className="text-[10px] text-[#8B969E]">
                    {formatDateTime(item.inspected_at || item.created_at)}
                  </span>
                </div>
              </div>
            );
          })()}
        </DashboardModal>
      )}
    </>
  );
}

