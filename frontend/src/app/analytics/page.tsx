"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Filter,
  MapPin,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import DashboardLayout from "@/components/layout/DashboardLayout";

const API_BASE = "https://potholevision.onrender.com";

type Pothole = {
  id: number;
  latitude: number | null;
  longitude: number | null;
  severity: string | null;
  confidence: number | null;
  image_path: string | null;
  status: string | null;
  description: string | null;
  created_at: string | null;
};

type Inspection = {
  id: number;
  pothole_id: number;
  complaint_id: number | null;
  inspector_name: string;
  inspection_notes: string | null;
  confirmed_severity: string | null;
  status: string | null;
  inspected_at: string | null;
  created_at: string | null;
};

type WorkOrder = {
  id: number;
  pothole_id: number;
  inspection_id: number | null;
  contractor_name: string;
  work_description: string;
  priority: string | null;
  status: string | null;
  estimated_cost: number | null;
  scheduled_date: string | null;
  completed_at: string | null;
  created_at: string | null;
};

type RangeOption =
  | "Last 7 Days"
  | "Last 30 Days"
  | "Last 6 Months"
  | "This Year";

const ranges: RangeOption[] = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 6 Months",
  "This Year",
];

const COLORS = ["#dc2626", "#f59e0b", "#3b82f6", "#16a34a"];

function safeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeSeverity(value: string | null | undefined): string {
  return String(value || "unknown").toLowerCase();
}

function normalizeStatus(value: string | null | undefined): string {
  return String(value || "unknown").toLowerCase();
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0.0%";
  return `${value.toFixed(1)}%`;
}

function formatConfidence(value: number): string {
  if (!Number.isFinite(value)) return "0.0%";

  const percentage = value <= 1 ? value * 100 : value;

  return `${percentage.toFixed(1)}%`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRangeStart(range: RangeOption): Date {
  const now = new Date();

  if (range === "Last 7 Days") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (range === "Last 30 Days") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  if (range === "Last 6 Months") {
    const date = new Date(now);
    date.setMonth(date.getMonth() - 6);
    return date;
  }

  return new Date(now.getFullYear(), 0, 1);
}

function isInsideRange(
  dateValue: string | null | undefined,
  range: RangeOption
): boolean {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  return date >= getRangeStart(range);
}

function getChartStart(range: RangeOption): Date {
  return getRangeStart(range);
}

function createTrendData(
  potholes: Pothole[],
  workOrders: WorkOrder[],
  range: RangeOption
) {
  const start = getChartStart(range);
  const now = new Date();

  let bucketCount = 7;

  if (range === "Last 30 Days") {
    bucketCount = 6;
  } else if (range === "Last 6 Months") {
    bucketCount = 6;
  } else if (range === "This Year") {
    bucketCount = Math.max(1, now.getMonth() + 1);
  }

  const buckets: {
    label: string;
    start: Date;
    end: Date;
    detected: number;
    resolved: number;
  }[] = [];

  if (range === "Last 7 Days") {
    for (let i = 0; i < 7; i++) {
      const bucketStart = new Date(start);
      bucketStart.setDate(start.getDate() + i);
      bucketStart.setHours(0, 0, 0, 0);

      const bucketEnd = new Date(bucketStart);
      bucketEnd.setDate(bucketStart.getDate() + 1);

      buckets.push({
        label: bucketStart.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        start: bucketStart,
        end: bucketEnd,
        detected: 0,
        resolved: 0,
      });
    }
  } else if (range === "Last 30 Days") {
    for (let i = 0; i < 6; i++) {
      const bucketStart = new Date(start);
      bucketStart.setDate(start.getDate() + i * 5);
      bucketStart.setHours(0, 0, 0, 0);

      const bucketEnd = new Date(bucketStart);
      bucketEnd.setDate(bucketStart.getDate() + 5);

      buckets.push({
        label: bucketStart.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        start: bucketStart,
        end: bucketEnd,
        detected: 0,
        resolved: 0,
      });
    }
  } else {
    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = new Date(start);

      if (range === "This Year") {
        bucketStart.setMonth(i, 1);
      } else {
        bucketStart.setMonth(start.getMonth() + i, 1);
      }

      bucketStart.setHours(0, 0, 0, 0);

      const bucketEnd = new Date(bucketStart);

      if (range === "This Year" || range === "Last 6 Months") {
        bucketEnd.setMonth(bucketStart.getMonth() + 1, 1);
      } else {
        bucketEnd.setMonth(bucketStart.getMonth() + 1, 1);
      }

      buckets.push({
        label: bucketStart.toLocaleDateString("en-IN", {
          month: "short",
        }),
        start: bucketStart,
        end: bucketEnd,
        detected: 0,
        resolved: 0,
      });
    }
  }

  for (const pothole of potholes) {
    if (!pothole.created_at) continue;

    const date = new Date(pothole.created_at);

    if (Number.isNaN(date.getTime())) continue;
    if (date < start || date > now) continue;

    const bucket = buckets.find(
      (item) => date >= item.start && date < item.end
    );

    if (bucket) {
      bucket.detected += 1;
    }
  }

  for (const workOrder of workOrders) {
    if (!workOrder.completed_at) continue;

    const date = new Date(workOrder.completed_at);

    if (Number.isNaN(date.getTime())) continue;
    if (date < start || date > now) continue;

    const bucket = buckets.find(
      (item) => date >= item.start && date < item.end
    );

    if (bucket) {
      bucket.resolved += 1;
    }
  }

  return buckets.map((item) => ({
    month: item.label,
    detected: item.detected,
    resolved: item.resolved,
  }));
}

export default function AnalyticsPage() {
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [range, setRange] = useState<RangeOption>("Last 6 Months");
  const [showFilter, setShowFilter] = useState(false);
  const [showRange, setShowRange] = useState(false);
  const [exported, setExported] = useState(false);

  const [severityFilter, setSeverityFilter] =
    useState("All Severity");

  const [appliedSeverity, setAppliedSeverity] =
    useState("All Severity");

  const fetchAnalyticsData = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setRefreshing(true);
      }

      setError("");

      const [potholesResponse, inspectionsResponse, workOrdersResponse] =
        await Promise.all([
          fetch(`${API_BASE}/potholes`, { cache: "no-store" }),
          fetch(`${API_BASE}/inspections`, { cache: "no-store" }),
          fetch(`${API_BASE}/work-orders`, { cache: "no-store" }),
        ]);

      if (!potholesResponse.ok) {
        throw new Error("Unable to load pothole data.");
      }

      const potholeData = await potholesResponse.json();
      const inspectionData = inspectionsResponse.ok
        ? await inspectionsResponse.json()
        : [];
      const workOrderData = workOrdersResponse.ok
        ? await workOrdersResponse.json()
        : [];

      setPotholes(
        Array.isArray(potholeData)
          ? potholeData
          : potholeData?.potholes || []
      );

      setInspections(
        Array.isArray(inspectionData)
          ? inspectionData
          : inspectionData?.inspections || []
      );

      setWorkOrders(
        Array.isArray(workOrderData)
          ? workOrderData
          : workOrderData?.work_orders || []
      );
    } catch (err) {
      console.error(err);
      setError(
        "Analytics data could not be loaded. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(false);
  }, []);

  const filteredPotholes = useMemo(() => {
    return potholes.filter((pothole) => {
      const matchesRange = isInsideRange(
        pothole.created_at,
        range
      );

      const matchesSeverity =
        appliedSeverity === "All Severity" ||
        normalizeSeverity(pothole.severity) ===
          appliedSeverity.toLowerCase();

      return matchesRange && matchesSeverity;
    });
  }, [potholes, range, appliedSeverity]);

  const allRangePotholes = useMemo(() => {
    return potholes.filter((pothole) =>
      isInsideRange(pothole.created_at, range)
    );
  }, [potholes, range]);

  const totalPotholes = filteredPotholes.length;

  const criticalCount = filteredPotholes.filter(
    (p) => normalizeSeverity(p.severity) === "critical"
  ).length;

  const highCount = filteredPotholes.filter(
    (p) => normalizeSeverity(p.severity) === "high"
  ).length;

  const mediumCount = filteredPotholes.filter(
    (p) => normalizeSeverity(p.severity) === "medium"
  ).length;

  const lowCount = filteredPotholes.filter(
    (p) => normalizeSeverity(p.severity) === "low"
  ).length;

  const resolvedCount = filteredPotholes.filter(
    (p) => normalizeStatus(p.status) === "resolved"
  ).length;

  const inProgressCount = filteredPotholes.filter((p) => {
    const status = normalizeStatus(p.status);

    return (
      status === "in_progress" ||
      status === "in progress"
    );
  }).length;

  const reportedCount = filteredPotholes.filter(
    (p) => normalizeStatus(p.status) === "reported"
  ).length;

  const completedInspections = inspections.filter(
    (inspection) =>
      normalizeStatus(inspection.status) === "completed"
  ).length;

  const activeWorkOrders = workOrders.filter((order) => {
    const status = normalizeStatus(order.status);

    return (
      status === "assigned" ||
      status === "in_progress" ||
      status === "in progress"
    );
  }).length;

 const filteredConfidenceValues = filteredPotholes.map((p) =>
  safeNumber(p.confidence)
);

  const averageConfidence =
    filteredConfidenceValues.length > 0
      ? filteredConfidenceValues.reduce(
          (sum, value) => sum + value,
          0
        ) / filteredConfidenceValues.length
      : 0;

  const gpsCount = filteredPotholes.filter(
    (p) =>
      p.latitude !== null &&
      p.longitude !== null &&
      Number.isFinite(Number(p.latitude)) &&
      Number.isFinite(Number(p.longitude))
  ).length;

  const gpsCoverage =
    totalPotholes > 0
      ? (gpsCount / totalPotholes) * 100
      : 0;

  const resolutionRate =
    totalPotholes > 0
      ? (resolvedCount / totalPotholes) * 100
      : 0;

  const severityData = [
    {
      name: "Critical",
      value: criticalCount,
    },
    {
      name: "High",
      value: highCount,
    },
    {
      name: "Medium",
      value: mediumCount,
    },
    {
      name: "Low",
      value: lowCount,
    },
  ];

  const trendData = useMemo(
    () => createTrendData(potholes, workOrders, range),
    [potholes, workOrders, range]
  );

  const gpsAreaData = useMemo(() => {
    const groups = new Map<
      string,
      {
        area: string;
        potholes: number;
        latitude: number;
        longitude: number;
      }
    >();

    for (const pothole of filteredPotholes) {
      if (
        pothole.latitude === null ||
        pothole.longitude === null
      ) {
        continue;
      }

      const latitude = Number(pothole.latitude);
      const longitude = Number(pothole.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        continue;
      }

      const key = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

      const existing = groups.get(key);

      if (existing) {
        existing.potholes += 1;
      } else {
        groups.set(key, {
          area: key,
          potholes: 1,
          latitude,
          longitude,
        });
      }
    }

    return Array.from(groups.values())
      .sort((a, b) => b.potholes - a.potholes)
      .slice(0, 5)
      .map((item) => ({
        road: item.area,
        potholes: item.potholes,
      }));
  }, [filteredPotholes]);

  const latestPotholes = useMemo(() => {
    return [...filteredPotholes]
      .sort((a, b) => {
        const first = new Date(a.created_at || 0).getTime();
        const second = new Date(b.created_at || 0).getTime();

        return second - first;
      })
      .slice(0, 5);
  }, [filteredPotholes]);

  const activePeriodComparison = useMemo(() => {
    const currentCount = allRangePotholes.length;

    const previousStart = getRangeStart(range);
    const currentStart = new Date(previousStart);

    let durationMs =
      new Date().getTime() - previousStart.getTime();

    if (durationMs <= 0) {
      durationMs = 7 * 24 * 60 * 60 * 1000;
    }

    const previousEnd = new Date(
      currentStart.getTime() - 1
    );

    const previousStartDate = new Date(
      previousEnd.getTime() - durationMs
    );

    const previousCount = potholes.filter((pothole) => {
      if (!pothole.created_at) return false;

      const date = new Date(pothole.created_at);

      return (
        date >= previousStartDate &&
        date <= previousEnd
      );
    }).length;

    if (previousCount === 0) {
      return currentCount > 0 ? 100 : 0;
    }

    return (
      ((currentCount - previousCount) / previousCount) *
      100
    );
  }, [potholes, allRangePotholes.length, range]);

  const handleApplyFilters = () => {
    setAppliedSeverity(severityFilter);
    setShowFilter(false);
  };

  const handleResetFilters = () => {
    setSeverityFilter("All Severity");
    setAppliedSeverity("All Severity");
  };

  const handleExport = () => {
    const report = [
      "POTHOLEVISION ANALYTICS REPORT",
      "================================",
      "",
      `Date Range: ${range}`,
      `Severity Filter: ${appliedSeverity}`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      "",
      "KEY PERFORMANCE INDICATORS",
      "--------------------------",
      `Total Potholes: ${totalPotholes}`,
      `Critical: ${criticalCount}`,
      `High: ${highCount}`,
      `Medium: ${mediumCount}`,
      `Low: ${lowCount}`,
      `Reported: ${reportedCount}`,
      `In Progress: ${inProgressCount}`,
      `Resolved: ${resolvedCount}`,
      `Resolution Rate: ${resolutionRate.toFixed(1)}%`,
      `Average AI Confidence: ${formatConfidence(averageConfidence)}`,
      `GPS Coverage: ${gpsCoverage.toFixed(1)}%`,
      `GPS Locations: ${gpsCount}`,
      `Completed Inspections: ${completedInspections}`,
      `Active Work Orders: ${activeWorkOrders}`,
      "",
      "MOST ACTIVE GPS AREAS",
      "---------------------",
      ...gpsAreaData.map(
        (item, index) =>
          `${index + 1}. ${item.road} - ${item.potholes} potholes`
      ),
      "",
      "RECENT POTHOLES",
      "---------------",
      ...latestPotholes.map(
        (pothole) =>
          `PV-${String(pothole.id).padStart(5, "0")} | ${
            pothole.severity || "Unknown"
          } | ${pothole.status || "Unknown"} | ${
            pothole.created_at
              ? formatDate(pothole.created_at)
              : "Unknown"
          }`
      ),
    ].join("\n");

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "potholevision-analytics-report.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setExported(true);

    window.setTimeout(() => {
      setExported(false);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="w-full py-6 pl-4 pr-4">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <section className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-2 text-[13px] font-semibold tracking-[0.22em] text-[#4c78a8]">
              PERFORMANCE & INSIGHTS
            </p>

            <h1 className="text-[34px] font-bold leading-tight text-[#123052]">
              Infrastructure Analytics
            </h1>

            <p className="mt-2 text-[16px] text-[#66809d]">
              City-wide road damage, repair performance and
              infrastructure trends.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* REFRESH */}
            <button
              type="button"
              onClick={() => fetchAnalyticsData(true)}
              disabled={refreshing}
              className="flex h-[48px] items-center gap-3 rounded-xl border border-[#c8d5e2] bg-white px-5 text-[15px] font-medium text-[#365d83] shadow-[0_3px_12px_rgba(20,48,80,0.08)] transition hover:border-[#7da3ca] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            {/* DATE RANGE */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowRange((prev) => !prev)
                }
                className="flex h-[48px] items-center gap-3 rounded-xl border border-[#c8d5e2] bg-white px-5 text-[15px] font-medium text-[#365d83] shadow-[0_3px_12px_rgba(20,48,80,0.08)] transition hover:border-[#7da3ca] hover:bg-[#f8fafc]"
              >
                <Calendar size={18} />
                {range}
              </button>

              {showRange && (
                <div className="absolute right-0 top-[56px] z-40 w-48 overflow-hidden rounded-xl border border-[#d1dce7] bg-white shadow-xl">
                  {ranges.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => {
                        setRange(item);
                        setShowRange(false);
                      }}
                      className={`block w-full px-4 py-3 text-left text-sm transition ${
                        range === item
                          ? "bg-[#eef4f9] font-semibold text-[#285f91]"
                          : "text-[#365d83] hover:bg-[#f5f8fb]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* EXPORT */}
            <button
              type="button"
              onClick={handleExport}
              className="flex h-[48px] items-center gap-3 rounded-xl bg-[#285f91] px-5 text-[15px] font-semibold text-white shadow-[0_5px_14px_rgba(40,95,145,0.22)] transition hover:bg-[#214f79] active:translate-y-[1px]"
            >
              <Download size={18} />
              {exported ? "Exported" : "Export Report"}
            </button>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => fetchAnalyticsData(true)}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* =====================================================
            LIVE DATA STATUS
        ====================================================== */}
        <section className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#cbd7e3] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(20,48,80,0.05)]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef7f3] text-emerald-600">
              <Activity size={18} />
            </span>

            <div>
              <p className="text-sm font-semibold text-[#123052]">
                Live PostgreSQL Analytics
              </p>

              <p className="text-xs text-[#7890a7]">
                Real infrastructure records from PotholeVision
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[#607b96]">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Database Connected
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {gpsCount} GPS Locations
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              AI Confidence Live
            </span>
          </div>
        </section>

        {/* =====================================================
            KPI CARDS
        ====================================================== */}
        <section className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* TOTAL */}
          <div className="rounded-2xl border border-[#cbd7e3] bg-white p-6 shadow-[0_4px_14px_rgba(20,48,80,0.06)]">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf2fa] text-[#3d73a6]">
                <AlertTriangle size={21} />
              </div>

              <span
                className={`flex items-center gap-1 text-sm font-semibold ${
                  activePeriodComparison >= 0
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {activePeriodComparison >= 0 ? (
                  <TrendingUp size={15} />
                ) : (
                  <TrendingDown size={15} />
                )}

                {Math.abs(activePeriodComparison).toFixed(1)}%
              </span>
            </div>

            <p className="mt-5 text-sm text-[#66809d]">
              Total Potholes
            </p>

            <h2 className="mt-1 text-[31px] font-bold text-[#123052]">
              {loading ? "—" : formatNumber(totalPotholes)}
            </h2>

            <p className="mt-1 text-sm text-[#8a9bad]">
              Real database records
            </p>
          </div>

          {/* CRITICAL */}
          <div className="rounded-2xl border border-[#cbd7e3] bg-white p-6 shadow-[0_4px_14px_rgba(20,48,80,0.06)]">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0f0] text-red-500">
                <AlertTriangle size={21} />
              </div>

              <span className="flex items-center gap-1 text-sm font-semibold text-red-500">
                <Activity size={15} />
                Live
              </span>
            </div>

            <p className="mt-5 text-sm text-[#66809d]">
              Critical Issues
            </p>

            <h2 className="mt-1 text-[31px] font-bold text-[#123052]">
              {loading ? "—" : formatNumber(criticalCount)}
            </h2>

            <p className="mt-1 text-sm text-red-500">
              Requires immediate attention
            </p>
          </div>

          {/* RESOLVED */}
          <div className="rounded-2xl border border-[#cbd7e3] bg-white p-6 shadow-[0_4px_14px_rgba(20,48,80,0.06)]">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef7f3] text-emerald-600">
                <CheckCircle2 size={21} />
              </div>

              <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                <TrendingUp size={15} />
                Live
              </span>
            </div>

            <p className="mt-5 text-sm text-[#66809d]">
              Resolved
            </p>

            <h2 className="mt-1 text-[31px] font-bold text-[#123052]">
              {loading ? "—" : formatNumber(resolvedCount)}
            </h2>

            <p className="mt-1 text-sm text-emerald-600">
              {formatPercent(resolutionRate)} resolution rate
            </p>
          </div>

          {/* AI CONFIDENCE */}
          <div className="rounded-2xl border border-[#cbd7e3] bg-white p-6 shadow-[0_4px_14px_rgba(20,48,80,0.06)]">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4fb] text-[#3d73a6]">
                <BarChart3 size={21} />
              </div>

              <span className="flex items-center gap-1 text-sm font-semibold text-[#326c9f]">
                <Activity size={15} />
                AI
              </span>
            </div>

            <p className="mt-5 text-sm text-[#66809d]">
              Avg. AI Confidence
            </p>

            <h2 className="mt-1 text-[31px] font-bold text-[#123052]">
              {loading
                ? "—"
                : formatConfidence(averageConfidence)}
            </h2>

            <p className="mt-1 text-sm text-[#8a9bad]">
              Based on detected potholes
            </p>
          </div>
        </section>

        {/* =====================================================
            SECONDARY KPI STRIP
        ====================================================== */}
        <section className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl border border-[#d5e0ea] bg-[#f7fafc] px-5 py-4">
            <div>
              <p className="text-xs font-medium text-[#7890a7]">
                GPS Coverage
              </p>

              <p className="mt-1 text-xl font-bold text-[#123052]">
                {formatPercent(gpsCoverage)}
              </p>
            </div>

            <MapPin className="text-[#326c9f]" size={22} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#d5e0ea] bg-[#f7fafc] px-5 py-4">
            <div>
              <p className="text-xs font-medium text-[#7890a7]">
                Completed Inspections
              </p>

              <p className="mt-1 text-xl font-bold text-[#123052]">
                {formatNumber(completedInspections)}
              </p>
            </div>

            <FileText className="text-[#326c9f]" size={22} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#d5e0ea] bg-[#f7fafc] px-5 py-4">
            <div>
              <p className="text-xs font-medium text-[#7890a7]">
                Active Work Orders
              </p>

              <p className="mt-1 text-xl font-bold text-[#123052]">
                {formatNumber(activeWorkOrders)}
              </p>
            </div>

            <Clock3 className="text-[#326c9f]" size={22} />
          </div>
        </section>

        {/* =====================================================
            MAIN CHARTS
        ====================================================== */}
        <section className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          {/* TREND */}
          <div className="rounded-2xl border border-[#cbd7e3] bg-white p-6 shadow-[0_4px_14px_rgba(20,48,80,0.06)]">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-[19px] font-bold text-[#123052]">
                  Detection & Resolution Trend
                </h2>

                <p className="mt-1 text-sm text-[#7890a7]">
                  Real pothole activity for {range.toLowerCase()}
                </p>
              </div>

              <div className="flex items-center gap-5 text-xs text-[#607b96]">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#285f91]" />
                  Detected
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
                  Resolved
                </span>
              </div>
            </div>

            <div className="h-[330px] w-full">
              {trendData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#7890a7]">
                  No trend data available for this period.
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={trendData}>
                    <CartesianGrid
                      stroke="#e4ebf2"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#7890a7",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#7890a7",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #d5e0ea",
                        boxShadow:
                          "0 8px 25px rgba(20,48,80,0.10)",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="detected"
                      stroke="#285f91"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* SEVERITY */}
          <div className="rounded-2xl border border-[#cbd7e3] bg-white p-6 shadow-[0_4px_14px_rgba(20,48,80,0.06)]">
            <div className="mb-2">
              <h2 className="text-[19px] font-bold text-[#123052]">
                Potholes by Severity
              </h2>

              <p className="mt-1 text-sm text-[#7890a7]">
                Current filtered distribution
              </p>
            </div>

            <div className="relative h-[280px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {severityData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[26px] font-bold text-[#123052]">
                    {formatNumber(totalPotholes)}
                  </p>

                  <p className="text-xs text-[#7890a7]">
                    Total
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {severityData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-[#536f8a]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: COLORS[index],
                      }}
                    />

                    {item.name}
                  </span>

                  <span className="font-semibold text-[#123052]">
                    {formatNumber(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            LOWER SECTION
        ====================================================== */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* GPS AREAS */}
          <div className="rounded-2xl border border-[#cbd7e3] bg-white p-6 shadow-[0_4px_14px_rgba(20,48,80,0.06)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[19px] font-bold text-[#123052]">
                  Most Affected GPS Areas
                </h2>

                <p className="mt-1 text-sm text-[#7890a7]">
                  Areas with highest pothole concentration
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/live-map";
                }}
                className="text-sm font-semibold text-[#326c9f] transition hover:text-[#214f79]"
              >
                View Map
              </button>
            </div>

            <div className="h-[290px]">
              {gpsAreaData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#d5e0ea] bg-[#f8fafc] text-sm text-[#7890a7]">
                  No GPS locations available for this filter.
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={gpsAreaData}
                    layout="vertical"
                    margin={{
                      left: 20,
                      right: 20,
                    }}
                  >
                    <CartesianGrid
                      stroke="#e4ebf2"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{
                        fill: "#7890a7",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="road"
                      width={125}
                      tick={{
                        fill: "#536f8a",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="potholes"
                      fill="#326c9f"
                      radius={[0, 6, 6, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="rounded-2xl border border-[#cbd7e3] bg-white p-6 shadow-[0_4px_14px_rgba(20,48,80,0.06)]">
            <div className="mb-6">
              <h2 className="text-[19px] font-bold text-[#123052]">
                Infrastructure Insights
              </h2>

              <p className="mt-1 text-sm text-[#7890a7]">
                Live observations from the database
              </p>
            </div>

            <div className="space-y-4">
              {/* DETECTION */}
              <div className="rounded-xl border border-[#d9e4ed] bg-[#f7fafc] p-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f1f9] text-[#326c9f]">
                    <Activity size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#123052]">
                      Detection activity
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#7188a0]">
                      {formatNumber(totalPotholes)} potholes
                      were recorded in the selected reporting
                      period.
                    </p>
                  </div>
                </div>
              </div>

              {/* RESOLUTION */}
              <div className="rounded-xl border border-[#d9e4ed] bg-[#f7fafc] p-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef8f2] text-emerald-600">
                    <CheckCircle2 size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#123052]">
                      Resolution performance
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#7188a0]">
                      {formatNumber(resolvedCount)} potholes are
                      currently marked resolved, giving a{" "}
                      {formatPercent(resolutionRate)} resolution
                      rate.
                    </p>
                  </div>
                </div>
              </div>

              {/* GPS */}
              <div className="rounded-xl border border-[#d9e4ed] bg-[#f7fafc] p-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff7e8] text-amber-600">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#123052]">
                      GPS network coverage
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#7188a0]">
                      {formatNumber(gpsCount)} pothole records
                      currently contain usable GPS coordinates.
                    </p>
                  </div>
                </div>
              </div>

              {/* AI */}
              <div className="rounded-xl border border-[#d9e4ed] bg-[#f7fafc] p-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf4fb] text-[#326c9f]">
                    <BarChart3 size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#123052]">
                      AI detection quality
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#7188a0]">
                      Average YOLO confidence across the selected
                      records is{" "}
                      {formatPercent(averageConfidence)}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbd9e6] bg-white py-3 text-sm font-semibold text-[#326c9f] transition hover:bg-[#f4f8fb]"
            >
              <FileText size={17} />
              Export Detailed Report
            </button>
          </div>
        </section>

        {/* =====================================================
            RECENT DATABASE RECORDS
        ====================================================== */}
        <section className="mt-7 rounded-2xl border border-[#cbd7e3] bg-white shadow-[0_4px_14px_rgba(20,48,80,0.06)]">
          <div className="flex items-center justify-between border-b border-[#e0e7ee] px-6 py-5">
            <div>
              <h2 className="text-[19px] font-bold text-[#123052]">
                Recent Analytics Records
              </h2>

              <p className="mt-1 text-sm text-[#7890a7]">
                Latest pothole records from PostgreSQL
              </p>
            </div>

            <span className="rounded-lg bg-[#eef4f9] px-3 py-2 text-xs font-semibold text-[#326c9f]">
              {formatNumber(totalPotholes)} Records
            </span>
          </div>

          <div className="divide-y divide-[#e7edf2]">
            {latestPotholes.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[#7890a7]">
                No pothole records found for the selected filters.
              </div>
            ) : (
              latestPotholes.map((pothole) => {
                const severityName =
                  pothole.severity || "Unknown";

                const statusName =
                  pothole.status || "Unknown";

                const severityClass =
                  normalizeSeverity(pothole.severity) ===
                  "critical"
                    ? "border-red-200 bg-red-50 text-red-600"
                    : normalizeSeverity(pothole.severity) ===
                      "high"
                    ? "border-orange-200 bg-orange-50 text-orange-600"
                    : normalizeSeverity(pothole.severity) ===
                      "medium"
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-slate-50 text-slate-600";

                return (
                  <div
                    key={pothole.id}
                    className="flex flex-col gap-4 px-6 py-4 transition hover:bg-[#fafcfe] md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef4f9] text-[#4b7ca8]">
                        <MapPin size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#123052]">
                          PV-
                          {String(pothole.id).padStart(
                            5,
                            "0"
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#7890a7]">
                          {pothole.latitude !== null &&
                          pothole.longitude !== null
                            ? `${Number(
                                pothole.latitude
                              ).toFixed(4)}, ${Number(
                                pothole.longitude
                              ).toFixed(4)}`
                            : "Location unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${severityClass}`}
                      >
                        {severityName}
                      </span>

                      <span className="rounded-lg border border-[#d5e0ea] bg-[#f7fafc] px-3 py-1.5 text-xs font-medium text-[#607b96]">
                        {statusName}
                      </span>

                      <span className="text-xs text-[#7890a7]">
                        {formatPercent(
                          safeNumber(pothole.confidence)
                        )}{" "}
                        AI
                      </span>

                      <span className="text-xs text-[#7890a7]">
                        {formatDate(pothole.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* =====================================================
            FILTER MODAL
        ====================================================== */}
        {showFilter && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2740]/30 px-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowFilter(false);
              }
            }}
          >
            <div className="w-full max-w-md rounded-2xl border border-[#d2dee9] bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#123052]">
                    Analytics Filters
                  </h2>

                  <p className="mt-1 text-sm text-[#7890a7]">
                    Refine your live analytics view.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilter(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7890a7] transition hover:bg-[#eef4f8] hover:text-[#365d83]"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="mb-2 block text-sm font-medium text-[#365d83]">
                    Date Range
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {ranges.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setRange(item)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition ${
                          range === item
                            ? "border-[#8db0d0] bg-[#eef4f9] text-[#285f91]"
                            : "border-[#d5e0ea] bg-white text-[#607b96] hover:bg-[#f7fafc]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#365d83]">
                    Severity
                  </span>

                  <select
                    value={severityFilter}
                    onChange={(event) =>
                      setSeverityFilter(event.target.value)
                    }
                    className="h-11 w-full rounded-lg border border-[#ccd9e5] bg-white px-3 text-sm text-[#365d83] outline-none transition focus:border-[#4b7ca8]"
                  >
                    <option>All Severity</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex h-11 flex-1 items-center justify-center rounded-lg border border-[#ccd9e5] bg-white text-sm font-semibold text-[#365d83] transition hover:bg-[#f5f8fb]"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#285f91] text-sm font-semibold text-white transition hover:bg-[#214f79]"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            FLOATING FILTER BUTTON
        ====================================================== */}
        <button
          type="button"
          onClick={() => setShowFilter(true)}
          className="fixed bottom-7 right-7 z-30 flex h-12 items-center gap-2 rounded-xl border border-[#cbd9e5] bg-white px-4 text-sm font-semibold text-[#365d83] shadow-lg transition hover:bg-[#f5f9fc]"
        >
          <Filter size={17} />
          Filters
        </button>
      </div>
    </DashboardLayout>
  );
}