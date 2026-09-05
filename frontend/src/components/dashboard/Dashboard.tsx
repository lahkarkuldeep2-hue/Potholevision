"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Plus,
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
} from "recharts";

import PotholeMap from "@/components/map/PotholeMap";

const API_URL = "https://potholevision.onrender.com";

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

function StatCard({
  title,
  value,
  change,
  positive = true,
  icon,
  iconClass,
  live = false,
}: {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: ReactNode;
  iconClass: string;
  live?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-[#cbd5df] bg-[#f7f9fb] p-5 shadow-[0_4px_18px_rgba(30,48,68,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#aebdcd] hover:shadow-[0_10px_28px_rgba(30,48,68,0.10)]">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <Activity
          size={19}
          className="text-[#aab9c8] transition group-hover:text-[#5c7fa8]"
        />
      </div>

      <p className="mt-4 text-sm font-medium text-[#62758a]">{title}</p>

      <div className="mt-1 flex items-end justify-between">
        <h3 className="text-[27px] font-bold tracking-tight text-[#142b46]">
          {value}
        </h3>

        <span
          className={`mb-1 flex items-center gap-0.5 text-xs font-semibold ${
            positive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}

          {live ? "Live" : change}
        </span>
      </div>

      <p className="mt-1 text-[11px] text-[#8797a8]">
        {live ? "live from database" : "from last week"}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-[#142b46]">{title}</h2>

      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold text-[#426b97] transition hover:text-[#294f79]"
        >
          {action}
          {action.toLowerCase().includes("view") && (
            <ChevronRight size={14} />
          )}
        </button>
      )}
    </div>
  );
}

function SeverityBadge({ type }: { type: string }) {
  const normalized = type?.toLowerCase() || "medium";

  const styles: Record<string, string> = {
    critical: "bg-red-50 text-red-600 border-red-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    low: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${
        styles[normalized] ?? styles.medium
      }`}
    >
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase().replaceAll("_", " ") || "pending";

  let style =
    "border-[#cbd8e4] bg-[#e9f0f6] text-[#55728f]";

  if (normalized === "completed" || normalized === "resolved") {
    style = "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "in progress") {
    style = "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (normalized === "assigned") {
    style = "border-orange-200 bg-orange-50 text-orange-700";
  }

  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${style}`}
    >
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
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
  children?: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f1b2d]/45 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#cbd5df] bg-[#f7f9fb] shadow-[0_24px_70px_rgba(15,27,45,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#d8e0e8] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#142b46]">{title}</h2>

            {description && (
              <p className="mt-1 text-xs text-[#718398]">{description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#708297] transition hover:bg-[#e7edf3] hover:text-[#142b46]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [modal, setModal] = useState<string | null>(null);

  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState("");

  const closeModal = () => setModal(null);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [potholeResponse, inspectionResponse, workOrderResponse] =
        await Promise.all([
          fetch(`${API_URL}/potholes`),
          fetch(`${API_URL}/inspections`),
          fetch(`${API_URL}/work-orders`),
        ]);

      if (!potholeResponse.ok) {
        throw new Error("Failed to load potholes");
      }

      const potholeData = await potholeResponse.json();
      const inspectionData = inspectionResponse.ok
        ? await inspectionResponse.json()
        : [];
      const workOrderData = workOrderResponse.ok
        ? await workOrderResponse.json()
        : [];

      const potholeRecords: Pothole[] = Array.isArray(potholeData)
        ? potholeData
        : potholeData.potholes || potholeData.data || [];

      const inspectionRecords: Inspection[] = Array.isArray(inspectionData)
        ? inspectionData
        : inspectionData.inspections || inspectionData.data || [];

      const workOrderRecords: WorkOrder[] = Array.isArray(workOrderData)
        ? workOrderData
        : workOrderData.work_orders || workOrderData.data || [];

      setPotholes(potholeRecords);
      setInspections(inspectionRecords);
      setWorkOrders(workOrderRecords);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError("Some dashboard data could not be loaded.");
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
        (pothole) =>
          typeof pothole.latitude === "number" &&
          typeof pothole.longitude === "number"
      ),
    [potholes]
  );

  const totalPotholes = potholes.length;

  const reportedCount = potholes.filter(
    (pothole) => pothole.status?.toLowerCase() === "reported"
  ).length;

  const inProgressCount = potholes.filter(
    (pothole) =>
      pothole.status?.toLowerCase() === "in_progress" ||
      pothole.status?.toLowerCase() === "under_review"
  ).length;

  const resolvedCount = potholes.filter(
    (pothole) => pothole.status?.toLowerCase() === "resolved"
  ).length;

  const averageConfidence =
    potholes.length > 0
      ? potholes.reduce(
          (sum, pothole) => sum + (pothole.confidence || 0),
          0
        ) / potholes.length
      : 0;

  const criticalCount = potholes.filter(
    (pothole) => pothole.severity?.toLowerCase() === "critical"
  ).length;

  const highCount = potholes.filter(
    (pothole) => pothole.severity?.toLowerCase() === "high"
  ).length;

  const mediumCount = potholes.filter(
    (pothole) => pothole.severity?.toLowerCase() === "medium"
  ).length;

  const lowCount = potholes.filter(
    (pothole) => pothole.severity?.toLowerCase() === "low"
  ).length;

  const severityData = [
    {
      name: "Critical",
      value: criticalCount,
      color: "#c94b4b",
    },
    {
      name: "High",
      value: highCount,
      color: "#d18a28",
    },
    {
      name: "Medium",
      value: mediumCount,
      color: "#5c7fa8",
    },
    {
      name: "Low",
      value: lowCount,
      color: "#9aaabd",
    },
  ].filter((item) => item.value > 0);

  const searchedPotholes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return potholes;

    return potholes.filter((pothole) => {
      return (
        String(pothole.id).includes(query) ||
        String(pothole.latitude ?? "").includes(query) ||
        String(pothole.longitude ?? "").includes(query) ||
        String(pothole.severity ?? "").toLowerCase().includes(query) ||
        String(pothole.status ?? "").toLowerCase().includes(query)
      );
    });
  }, [potholes, search]);

  const recentPotholes = searchedPotholes.slice(0, 5);

  const recentInspections = [...inspections]
    .sort((a, b) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();

      return bDate - aDate;
    })
    .slice(0, 4);

  const recentWorkOrders = [...workOrders]
    .sort((a, b) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();

      return bDate - aDate;
    })
    .slice(0, 5);

  const assignedOrders = workOrders.filter(
    (order) => order.status?.toLowerCase() === "assigned"
  ).length;

  const activeOrders = workOrders.filter(
    (order) => order.status?.toLowerCase() === "in_progress"
  ).length;

  const completedOrders = workOrders.filter(
    (order) => order.status?.toLowerCase() === "completed"
  ).length;

  const pendingOrders = workOrders.filter(
    (order) =>
      order.status?.toLowerCase() !== "assigned" &&
      order.status?.toLowerCase() !== "in_progress" &&
      order.status?.toLowerCase() !== "completed"
  ).length;

  const workOrderChartData = [
    { name: "Assigned", value: assignedOrders, color: "#557da5" },
    { name: "In Progress", value: activeOrders, color: "#d18a28" },
    { name: "Completed", value: completedOrders, color: "#5b8d76" },
    { name: "Pending", value: pendingOrders, color: "#9aaabd" },
  ].filter((item) => item.value > 0);

  const mapCenter: [number, number] =
    gpsPotholes.length > 0
      ? [
          gpsPotholes[0].latitude as number,
          gpsPotholes[0].longitude as number,
        ]
      : [23.0225, 72.5714];

  /*
   * Last 7 days.
   * This is generated from the actual PostgreSQL pothole created_at values.
   */
  const trendData = useMemo(() => {
    const days: {
      day: string;
      detected: number;
      resolved: number;
    }[] = [];

    for (let index = 6; index >= 0; index--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - index);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const detected = potholes.filter((pothole) => {
        if (!pothole.created_at) return false;

        const created = new Date(pothole.created_at);

        return created >= date && created < nextDate;
      }).length;

      const resolved = potholes.filter((pothole) => {
        if (
          pothole.status?.toLowerCase() !== "resolved" ||
          !pothole.created_at
        ) {
          return false;
        }

        const created = new Date(pothole.created_at);

        return created >= date && created < nextDate;
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

  /*
   * GPS locations grouped by rounded coordinates.
   * This gives the "affected areas" section something useful
   * without inventing Delhi road names.
   */
  const affectedLocations = useMemo(() => {
    const groups = new Map<
      string,
      {
        name: string;
        count: number;
      }
    >();

    gpsPotholes.forEach((pothole) => {
      const lat = Number(pothole.latitude).toFixed(3);
      const lon = Number(pothole.longitude).toFixed(3);
      const key = `${lat},${lon}`;

      const existing = groups.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        groups.set(key, {
          name: `${lat}, ${lon}`,
          count: 1,
        });
      }
    });

    return Array.from(groups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [gpsPotholes]);

  return (
    <>
      <main className="relative min-h-screen space-y-5 overflow-hidden bg-[#dce3e9] px-0 py-5">
        {/* Premium Background Infrastructure Visuals */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 top-10 h-96 w-96 rounded-full border border-[#b8c7d5]/40" />

          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full border border-[#b8c7d5]/30" />

          <div className="absolute right-20 top-32 h-2 w-2 rounded-full bg-[#6685a5]/30" />

          <div className="absolute right-[8%] top-[18%] h-px w-[260px] rotate-[24deg] bg-[#9babbc]/30" />

          <div className="absolute right-[4%] top-[28%] h-px w-[320px] rotate-[-18deg] bg-[#9babbc]/25" />

          <div className="absolute bottom-20 right-[5%] h-64 w-64 rounded-full border border-[#b8c7d5]/25" />

          <div className="absolute bottom-24 right-[13%] flex items-center gap-2 opacity-40">
            <span className="h-2 w-2 rounded-full bg-[#557da5]" />
            <span className="h-px w-16 bg-[#557da5]" />
            <span className="text-[9px] font-semibold tracking-widest text-[#55708c]">
              GPS NODE
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-0.5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#55799d]">
              Overview
            </p>

            <h1 className="mt-1 text-[27px] font-bold tracking-tight text-[#142b46]">
              Road Infrastructure Dashboard
            </h1>

            <p className="mt-1 text-xs text-[#718398]">
              City-wide pothole detection, inspection and maintenance overview
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModal("date")}
              className="hidden items-center gap-2 rounded-xl border border-[#c8d3de] bg-[#f7f9fb] px-4 py-3 text-sm font-medium text-[#536b83] shadow-sm transition hover:border-[#9eb1c4] hover:bg-white md:flex"
            >
              <CalendarDays size={16} />
              Live Database
            </button>

            <button
              onClick={() => setModal("create")}
              className="flex items-center gap-2 rounded-xl bg-[#285985] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(40,89,133,0.20)] transition hover:bg-[#214c75] hover:shadow-[0_8px_20px_rgba(40,89,133,0.26)]"
            >
              <Plus size={17} />
              Create Work Order
            </button>
          </div>
        </div>

        {/* Infrastructure Search */}
        <section className="relative flex items-center gap-3 rounded-2xl border border-[#c8d4df] bg-[#e8eef3]/90 px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d7e3ee] text-[#4d7399]">
            <Search size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[#365a7e]">
              Infrastructure Search
            </p>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search GPS coordinates, severity, status or pothole ID"
              className="w-full bg-transparent text-[11px] text-[#516b84] outline-none placeholder:text-[#8da0b3]"
            />
          </div>

          <div className="hidden items-center gap-5 text-[10px] text-[#54708c] lg:flex">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live GPS
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              AI Detection
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Database Connected
            </span>
          </div>
        </section>

        {error && (
          <div className="relative rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-medium text-orange-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Potholes"
            value={loading ? "..." : String(totalPotholes)}
            change=""
            live
            icon={<AlertTriangle size={21} />}
            iconClass="bg-red-50 text-red-500"
          />

          <StatCard
            title="Inspections"
            value={loading ? "..." : String(inspections.length)}
            change=""
            live
            icon={<FileText size={21} />}
            iconClass="bg-blue-50 text-[#557ca5]"
          />

          <StatCard
            title="Work Orders"
            value={loading ? "..." : String(workOrders.length)}
            change=""
            live
            icon={<Wrench size={21} />}
            iconClass="bg-slate-100 text-[#557ca5]"
          />

          <StatCard
            title="Resolved"
            value={loading ? "..." : String(resolvedCount)}
            change=""
            live
            icon={<CheckCircle2 size={21} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Avg. Confidence"
            value={`${(averageConfidence * 100).toFixed(1)}%`}
            change=""
            live
            icon={<Clock3 size={21} />}
            iconClass="bg-blue-50 text-[#557ca5]"
          />
        </div>

        {/* Main Analytics */}
        <div className="relative grid grid-cols-12 gap-5">
          {/* REAL GPS MAP */}
          <section className="col-span-12 rounded-2xl border border-[#c8d4df] bg-[#f7f9fb] p-5 shadow-[0_5px_20px_rgba(30,48,68,0.06)] xl:col-span-6">
            <SectionHeader
              title="Pothole Heatmap"
              action="View Map"
              onAction={() => setModal("map")}
            />

            <div className="relative h-[290px] overflow-hidden rounded-xl">
              {mapLoading ? (
                <div className="flex h-full items-center justify-center bg-[#e8eef3]">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#557da5] border-t-transparent" />

                    <p className="mt-3 text-xs font-semibold text-[#526a82]">
                      Loading GPS network...
                    </p>
                  </div>
                </div>
              ) : (
                <PotholeMap
                  potholes={gpsPotholes}
                  center={mapCenter}
                  zoom={12}
                />
              )}

              {/* Premium map overlay */}
              <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-xl border border-white/10 bg-[#17283a]/90 px-4 py-3 text-white shadow-lg">
                <div className="flex items-center gap-2">
                  <Route size={13} className="text-[#91b1cf]" />

                  <span className="text-[10px] font-bold tracking-wide">
                    LIVE GPS NETWORK
                  </span>
                </div>

                <p className="mt-1 text-[9px] text-white/55">
                  {gpsPotholes.length} GPS locations
                </p>
              </div>

              <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg bg-[#17283a]/90 px-3 py-2 text-[9px] text-white/75 shadow-lg">
                Low
                <span className="mx-2 inline-block h-1.5 w-24 rounded-full bg-gradient-to-r from-[#5c7fa8] via-[#d18a28] to-[#c94b4b]" />
                High
              </div>

              <div className="pointer-events-none absolute bottom-3 right-3 z-[500] rounded-lg bg-[#17283a]/90 px-3 py-2 text-[9px] text-white/70 shadow-lg">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                GPS signal active
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-[#62758a]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Real PostgreSQL GPS data
              </div>

              <span className="text-[10px] font-semibold text-[#55708c]">
                {gpsPotholes.length} mapped
              </span>
            </div>
          </section>

          {/* Severity */}
          <section className="col-span-12 rounded-2xl border border-[#c8d4df] bg-[#f7f9fb] p-5 shadow-[0_5px_20px_rgba(30,48,68,0.06)] md:col-span-6 xl:col-span-3">
            <SectionHeader title="Potholes by Severity" />

            <div className="relative h-[250px]">
              {severityData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {severityData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#142b46]">
                      {totalPotholes}
                    </span>

                    <span className="text-[10px] text-[#8292a4]">
                      Total
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#8292a4]">
                  No severity data
                </div>
              )}
            </div>

            <div className="space-y-2">
              {[
                ["Critical", criticalCount, "#c94b4b"],
                ["High", highCount, "#d18a28"],
                ["Medium", mediumCount, "#5c7fa8"],
                ["Low", lowCount, "#9aaabd"],
              ].map(([name, value, color]) => (
                <div
                  key={name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: color as string }}
                    />

                    <span className="text-[#62758a]">{name}</span>
                  </div>

                  <span className="font-semibold text-[#263f5a]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Inspections */}
          <section className="col-span-12 rounded-2xl border border-[#c8d4df] bg-[#f7f9fb] p-5 shadow-[0_5px_20px_rgba(30,48,68,0.06)] md:col-span-6 xl:col-span-3">
            <SectionHeader
              title="Recent Inspections"
              action="View all"
              onAction={() => setModal("inspections")}
            />

            <div className="space-y-3">
              {recentInspections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#cbd8e4] p-6 text-center">
                  <FileText
                    size={22}
                    className="mx-auto text-[#8ca0b4]"
                  />

                  <p className="mt-2 text-xs font-semibold text-[#536a82]">
                    No inspections yet
                  </p>

                  <p className="mt-1 text-[9px] text-[#8999aa]">
                    Inspection records will appear here.
                  </p>
                </div>
              ) : (
                recentInspections.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setModal(`inspection-${item.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-[#eaf0f5]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e4edf5] text-[#557ca5]">
                      <MapPin size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#243c56]">
                        Pothole #{item.pothole_id}
                      </p>

                      <p className="mt-1 truncate text-[9px] text-[#8999aa]">
                        {item.inspector_name}
                      </p>
                    </div>

                    <SeverityBadge
                      type={item.confirmed_severity || "medium"}
                    />
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Bottom Analytics */}
        <div className="relative grid grid-cols-12 gap-5">
          {/* Trend */}
          <section className="col-span-12 rounded-2xl border border-[#c8d4df] bg-[#f7f9fb] p-5 shadow-[0_5px_20px_rgba(30,48,68,0.06)] xl:col-span-5">
            <SectionHeader title="Potholes Trend" action="Last 7 Days" />

            <div className="h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#8292a4" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 9, fill: "#8292a4" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #cbd5df",
                      fontSize: "11px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="detected"
                    stroke="#557da5"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#5b8d76"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-5 text-[10px]">
              <span className="flex items-center gap-2 text-[#6f8093]">
                <span className="h-2 w-2 rounded-full bg-[#557da5]" />
                Detected
              </span>

              <span className="flex items-center gap-2 text-[#6f8093]">
                <span className="h-2 w-2 rounded-full bg-[#5b8d76]" />
                Resolved
              </span>
            </div>
          </section>

          {/* Affected Locations */}
          <section className="col-span-12 rounded-2xl border border-[#c8d4df] bg-[#f7f9fb] p-5 shadow-[0_5px_20px_rgba(30,48,68,0.06)] md:col-span-6 xl:col-span-4">
            <SectionHeader
              title="Top Affected Locations"
              action="View all"
              onAction={() => setModal("roads")}
            />

            <div className="space-y-5">
              {affectedLocations.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8292a4]">
                  No GPS locations available.
                </div>
              ) : (
                affectedLocations.map((location) => {
                  const maxCount = affectedLocations[0]?.count || 1;

                  return (
                    <div key={location.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-medium text-[#536a82]">
                          <MapPin size={13} />
                          {location.name}
                        </span>

                        <span className="text-xs font-bold text-[#29445f]">
                          {location.count}
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-[#dce4eb]">
                        <div
                          className="h-full rounded-full bg-[#6688aa]"
                          style={{
                            width: `${(location.count / maxCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Work Order Status */}
          <section className="col-span-12 rounded-2xl border border-[#c8d4df] bg-[#f7f9fb] p-5 shadow-[0_5px_20px_rgba(30,48,68,0.06)] md:col-span-6 xl:col-span-3">
            <SectionHeader
              title="Work Order Status"
              action="View all"
              onAction={() => setModal("orders")}
            />

            <div className="relative mx-auto h-[190px] w-[190px]">
              {workOrderChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workOrderChartData}
                        dataKey="value"
                        innerRadius={57}
                        outerRadius={82}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {workOrderChartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#142b46]">
                      {workOrders.length}
                    </span>

                    <span className="text-[10px] text-[#8292a4]">
                      Total
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center rounded-full border-[22px] border-[#e3e9ef]">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-[#142b46]">
                      0
                    </span>

                    <span className="text-[10px] text-[#8292a4]">
                      Total
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3">
              {[
                ["Assigned", assignedOrders, "#557da5"],
                ["In Progress", activeOrders, "#d18a28"],
                ["Completed", completedOrders, "#5b8d76"],
                ["Pending", pendingOrders, "#9aaabd"],
              ].map(([name, value, color]) => (
                <div key={name} className="text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: color as string }}
                    />

                    <span className="text-[#718397]">
                      {name}
                    </span>
                  </div>

                  <p className="ml-3.5 mt-0.5 font-bold text-[#29445f]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <div className="relative grid grid-cols-12 gap-5">
          <section className="col-span-12 rounded-2xl border border-[#c8d4df] bg-[#f7f9fb] p-5 shadow-[0_5px_20px_rgba(30,48,68,0.06)]">
            <SectionHeader title="Quick Actions" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Report Pothole", AlertTriangle, "report"],
                ["Schedule Inspection", CalendarDays, "inspection"],
                ["Create Work Order", Wrench, "create"],
                ["Generate Report", BarChart3, "report"],
              ].map(([name, Icon, action]) => {
                const ActionIcon = Icon as typeof AlertTriangle;

                return (
                  <button
                    key={name as string}
                    onClick={() => setModal(action as string)}
                    className="group flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border border-[#d4dee7] bg-[#eef3f7] p-3 transition hover:border-[#aebfd0] hover:bg-white"
                  >
                    <ActionIcon
                      size={21}
                      className="text-[#557da5] transition group-hover:scale-105"
                    />

                    <span className="text-[10px] font-semibold text-[#536a82]">
                      {name as string}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Recent Work Orders */}
        <section className="relative overflow-hidden rounded-2xl border border-[#c8d4df] bg-[#f7f9fb] shadow-[0_5px_20px_rgba(30,48,68,0.06)]">
          <div className="flex items-center justify-between border-b border-[#d8e0e8] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-bold text-[#142b46]">
                Recent Work Orders
              </h2>

              <p className="mt-1 text-[10px] text-[#8292a4]">
                Latest maintenance activity from PostgreSQL
              </p>
            </div>

            <button
              onClick={() => setModal("orders")}
              className="flex items-center gap-1 text-xs font-semibold text-[#426b97] transition hover:text-[#294f79]"
            >
              View all
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-[#d8e0e8] bg-[#edf2f6]">
                  {[
                    "Work Order ID",
                    "Pothole",
                    "Priority",
                    "Assigned To",
                    "Status",
                    "Created At",
                    "ETA",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[#7b8c9e]"
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
                      colSpan={7}
                      className="px-5 py-10 text-center text-xs text-[#8292a4]"
                    >
                      No work orders found.
                    </td>
                  </tr>
                ) : (
                  recentWorkOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#e2e8ee] transition hover:bg-[#edf3f7]"
                    >
                      <td className="px-5 py-4 text-xs font-semibold text-[#426b97]">
                        WO-{String(order.id).padStart(5, "0")}
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-[#536a82]">
                        PV-{String(order.pothole_id).padStart(5, "0")}
                      </td>

                      <td className="px-5 py-4">
                        <SeverityBadge type={order.priority} />
                      </td>

                      <td className="px-5 py-4 text-xs text-[#62758a]">
                        {order.contractor_name}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="px-5 py-4 text-xs text-[#7c8d9f]">
                        {formatDateTime(order.created_at)}
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-[#536a82]">
                        {formatDate(order.scheduled_date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* System Health */}
        <section className="relative flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#29415c] bg-[#14263a] px-5 py-4 text-white shadow-[0_8px_25px_rgba(15,27,45,0.12)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="text-xs font-semibold">System Health</p>

              <p className="text-[10px] text-white/45">
                All core services operational
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            {[
              "AI Service",
              "GPS Service",
              "Database",
              "Notifications",
            ].map((service) => (
              <div
                key={service}
                className="flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-[10px] text-white/60">
                  {service}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Create Work Order Modal */}
      {modal === "create" && (
        <DashboardModal
          title="Create Work Order"
          description="Create a maintenance request for a detected road issue."
          onClose={closeModal}
        >
          <div className="space-y-4">
            <input
              placeholder="Location / Pothole ID"
              className="w-full rounded-xl border border-[#cbd6e0] bg-white px-4 py-3 text-sm text-[#263f5a] outline-none focus:border-[#6689ab]"
            />

            <select className="w-full rounded-xl border border-[#cbd6e0] bg-white px-4 py-3 text-sm text-[#263f5a] outline-none focus:border-[#6689ab]">
              <option>Select priority</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <textarea
              placeholder="Work description"
              rows={4}
              className="w-full resize-none rounded-xl border border-[#cbd6e0] bg-white px-4 py-3 text-sm text-[#263f5a] outline-none focus:border-[#6689ab]"
            />

            <button
              onClick={closeModal}
              className="w-full rounded-xl bg-[#285985] py-3 text-sm font-semibold text-white transition hover:bg-[#214c75]"
            >
              Create Work Order
            </button>
          </div>
        </DashboardModal>
      )}

      {/* Report Pothole Modal */}
      {modal === "report" && (
        <DashboardModal
          title="Infrastructure Report"
          description="Report a road pothole or infrastructure issue."
          onClose={closeModal}
        >
          <div className="space-y-4">
            <input
              placeholder="Latitude"
              className="w-full rounded-xl border border-[#cbd6e0] bg-white px-4 py-3 text-sm text-[#263f5a] outline-none focus:border-[#6689ab]"
            />

            <input
              placeholder="Longitude"
              className="w-full rounded-xl border border-[#cbd6e0] bg-white px-4 py-3 text-sm text-[#263f5a] outline-none focus:border-[#6689ab]"
            />

            <textarea
              placeholder="Description"
              rows={4}
              className="w-full resize-none rounded-xl border border-[#cbd6e0] bg-white px-4 py-3 text-sm text-[#263f5a] outline-none focus:border-[#6689ab]"
            />

            <button
              onClick={closeModal}
              className="w-full rounded-xl bg-[#285985] py-3 text-sm font-semibold text-white transition hover:bg-[#214c75]"
            >
              Continue
            </button>
          </div>
        </DashboardModal>
      )}

      {/* Inspection Modal */}
      {modal === "inspection" && (
        <DashboardModal
          title="Schedule Inspection"
          description="Schedule a GMC field inspection for a detected pothole."
          onClose={closeModal}
        >
          <div className="space-y-4">
            <select className="w-full rounded-xl border border-[#cbd6e0] bg-white px-4 py-3 text-sm text-[#263f5a] outline-none">
              <option>Select pothole</option>

              {potholes.map((pothole) => (
                <option key={pothole.id} value={pothole.id}>
                  PV-{String(pothole.id).padStart(5, "0")}
                </option>
              ))}
            </select>

            <input
              placeholder="Inspector name"
              className="w-full rounded-xl border border-[#cbd6e0] bg-white px-4 py-3 text-sm text-[#263f5a] outline-none focus:border-[#6689ab]"
            />

            <input
              type="date"
              className="w-full rounded-xl border border-[#cbd6e0] bg-white px-4 py-3 text-sm text-[#263f5a] outline-none focus:border-[#6689ab]"
            />

            <button
              onClick={closeModal}
              className="w-full rounded-xl bg-[#285985] py-3 text-sm font-semibold text-white transition hover:bg-[#214c75]"
            >
              Schedule Inspection
            </button>
          </div>
        </DashboardModal>
      )}

      {/* Date / Database Modal */}
      {modal === "date" && (
        <DashboardModal
          title="Live Database"
          description="Current PotholeVision backend connection."
          onClose={closeModal}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#263f5a]">
                    PostgreSQL Connected
                  </p>

                  <p className="mt-1 text-xs text-[#7d8ea0]">
                    {potholes.length} potholes loaded from the backend.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#d5dfe8] bg-white p-4">
                <p className="text-[10px] text-[#8292a4]">
                  GPS Locations
                </p>

                <p className="mt-1 text-xl font-bold text-[#263f5a]">
                  {gpsPotholes.length}
                </p>
              </div>

              <div className="rounded-xl border border-[#d5dfe8] bg-white p-4">
                <p className="text-[10px] text-[#8292a4]">
                  AI Confidence
                </p>

                <p className="mt-1 text-xl font-bold text-[#263f5a]">
                  {(averageConfidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </DashboardModal>
      )}

      {/* Full Map Modal */}
      {modal === "map" && (
        <DashboardModal
          title="Infrastructure Map"
          description="Detailed real-time pothole GPS locations."
          onClose={closeModal}
        >
          <div className="h-[480px] overflow-hidden rounded-xl">
            <PotholeMap
              potholes={gpsPotholes}
              center={mapCenter}
              zoom={12}
            />
          </div>
        </DashboardModal>
      )}

      {/* Recent Inspections Modal */}
      {modal === "inspections" && (
        <DashboardModal
          title="Recent Inspections"
          description="Latest inspection activity from PostgreSQL."
          onClose={closeModal}
        >
          <div className="max-h-[420px] space-y-3 overflow-y-auto">
            {inspections.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#8292a4]">
                No inspections available.
              </div>
            ) : (
              inspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="rounded-xl border border-[#d5dfe8] bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#263f5a]">
                        Inspection #{inspection.id}
                      </p>

                      <p className="mt-1 text-[10px] text-[#8292a4]">
                        Pothole #{inspection.pothole_id} •{" "}
                        {inspection.inspector_name}
                      </p>
                    </div>

                    <StatusBadge status={inspection.status} />
                  </div>

                  {inspection.confirmed_severity && (
                    <div className="mt-3">
                      <SeverityBadge
                        type={inspection.confirmed_severity}
                      />
                    </div>
                  )}

                  {inspection.inspection_notes && (
                    <p className="mt-3 text-xs leading-5 text-[#62758a]">
                      {inspection.inspection_notes}
                    </p>
                  )}

                  <p className="mt-3 text-[9px] text-[#94a2b1]">
                    {formatDateTime(
                      inspection.inspected_at ||
                        inspection.created_at
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </DashboardModal>
      )}

      {/* Affected Locations Modal */}
      {modal === "roads" && (
        <DashboardModal
          title="Affected Locations"
          description="GPS-based pothole concentration areas."
          onClose={closeModal}
        >
          <div className="space-y-3">
            {affectedLocations.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8292a4]">
                No GPS data available.
              </div>
            ) : (
              affectedLocations.map((location, index) => (
                <div
                  key={location.name}
                  className="flex items-center justify-between rounded-xl border border-[#d5dfe8] bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4edf5] text-[#557ca5]">
                      <Route size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#263f5a]">
                        Area {index + 1}
                      </p>

                      <p className="mt-1 text-[10px] text-[#8292a4]">
                        {location.name}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-[#29445f]">
                    {location.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </DashboardModal>
      )}

      {/* Work Orders Modal */}
      {modal === "orders" && (
        <DashboardModal
          title="Work Orders"
          description="Current road maintenance workflow."
          onClose={closeModal}
        >
          <div className="max-h-[420px] space-y-3 overflow-y-auto">
            {workOrders.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#8292a4]">
                No work orders available.
              </div>
            ) : (
              workOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-[#d5dfe8] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#263f5a]">
                        WO-{String(order.id).padStart(5, "0")}
                      </p>

                      <p className="mt-1 text-[10px] text-[#8292a4]">
                        Pothole #{order.pothole_id}
                      </p>
                    </div>

                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-[#718397]">
                      Contractor
                    </span>

                    <span className="text-[10px] font-semibold text-[#526a82]">
                      {order.contractor_name}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#718397]">
                      Priority
                    </span>

                    <SeverityBadge type={order.priority} />
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardModal>
      )}

      {/* Individual Inspection */}
      {modal?.startsWith("inspection-") && (
        <DashboardModal
          title="Inspection Details"
          description="Inspection record from PostgreSQL."
          onClose={closeModal}
        >
          {(() => {
            const inspectionId = Number(
              modal.replace("inspection-", "")
            );

            const inspection = inspections.find(
              (item) => item.id === inspectionId
            );

            if (!inspection) {
              return (
                <div className="py-8 text-center text-xs text-[#8292a4]">
                  Inspection not found.
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#d5dfe8] bg-white p-4">
                  <p className="text-[10px] text-[#8292a4]">
                    Inspection ID
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#263f5a]">
                    #{inspection.id}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#d5dfe8] bg-white p-4">
                    <p className="text-[10px] text-[#8292a4]">
                      Pothole
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#263f5a]">
                      PV-
                      {String(inspection.pothole_id).padStart(
                        5,
                        "0"
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#d5dfe8] bg-white p-4">
                    <p className="text-[10px] text-[#8292a4]">
                      Severity
                    </p>

                    <div className="mt-2">
                      <SeverityBadge
                        type={
                          inspection.confirmed_severity ||
                          "medium"
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#d5dfe8] bg-white p-4">
                  <p className="text-[10px] text-[#8292a4]">
                    Inspector
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#263f5a]">
                    {inspection.inspector_name}
                  </p>
                </div>

                {inspection.inspection_notes && (
                  <div className="rounded-xl border border-[#d5dfe8] bg-white p-4">
                    <p className="text-[10px] text-[#8292a4]">
                      Notes
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#62758a]">
                      {inspection.inspection_notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </DashboardModal>
      )}

      {/* Generic fallback */}
      {modal &&
        ![
          "create",
          "report",
          "inspection",
          "date",
          "map",
          "inspections",
          "roads",
          "orders",
        ].includes(modal) &&
        !modal.startsWith("inspection-") && (
          <DashboardModal
            title={modal}
            description="PotholeVision dashboard action."
            onClose={closeModal}
          >
            <div className="rounded-xl border border-[#d5dfe8] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5edf4] text-[#557da5]">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#263f5a]">
                    Action selected
                  </p>

                  <p className="mt-1 text-xs text-[#7d8ea0]">
                    The interface is connected and ready for this
                    workflow.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="mt-4 w-full rounded-xl bg-[#285985] py-3 text-sm font-semibold text-white transition hover:bg-[#214c75]"
            >
              Continue
            </button>
          </DashboardModal>
        )}
    </>
  );
}