"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  X,
  Trash2,
  Wrench,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { LoadingSpinner } from "@/components/ui/LoadingStates";

type Severity = "Critical" | "High" | "Medium" | "Low";
type Status = "Open" | "In Progress" | "Resolved";

type Pothole = {
  id: string;
  location: string;
  severity: Severity;
  status: Status;
  detected: string;
  confidence: string;
  road: string;
};

const initialPotholes: Pothole[] = [
  {
    id: "PV-10248",
    location: "Connaught Place",
    road: "Barakhamba Road",
    severity: "Critical",
    status: "Open",
    detected: "May 26, 2024 â€¢ 10:32 AM",
    confidence: "98.4%",
  },
  {
    id: "PV-10247",
    location: "Ring Road",
    road: "Ring Road",
    severity: "High",
    status: "In Progress",
    detected: "May 26, 2024 â€¢ 09:15 AM",
    confidence: "96.8%",
  },
  {
    id: "PV-10246",
    location: "India Gate",
    road: "Rajpath Road",
    severity: "High",
    status: "Open",
    detected: "May 26, 2024 â€¢ 08:42 AM",
    confidence: "95.2%",
  },
  {
    id: "PV-10245",
    location: "Khan Market",
    road: "Khan Market Road",
    severity: "Medium",
    status: "Resolved",
    detected: "May 25, 2024 â€¢ 04:20 PM",
    confidence: "93.7%",
  },
  {
    id: "PV-10244",
    location: "Lodhi Road",
    road: "Lodhi Road",
    severity: "Medium",
    status: "In Progress",
    detected: "May 25, 2024 â€¢ 02:18 PM",
    confidence: "91.6%",
  },
  {
    id: "PV-10243",
    location: "Pragati Maidan",
    road: "Mathura Road",
    severity: "Low",
    status: "Resolved",
    detected: "May 25, 2024 â€¢ 11:05 AM",
    confidence: "89.3%",
  },
  {
    id: "PV-10242",
    location: "Saket",
    road: "Press Enclave Road",
    severity: "Low",
    status: "Open",
    detected: "May 24, 2024 â€¢ 05:46 PM",
    confidence: "87.9%",
  },
];

const severityStyles: Record<Severity, string> = {
  Critical: "border-[#A33A3A]/50 bg-[#A33A3A]/15 text-[#E58A83]",
  High: "border-[#C18B52]/40 bg-[#C18B52]/10 text-[#D9AD79]",
  Medium: "border-[#71879A]/40 bg-[#71879A]/10 text-[#A9BAC8]",
  Low: "border-[#8B969E]/30 bg-[#8B969E]/10 text-[#AEB6BD]",
};

const statusStyles: Record<Status, string> = {
  Open: "border-[#A33A3A]/50 bg-[#A33A3A]/15 text-[#E58A83]",
  "In Progress": "border-[#C8A96B]/40 bg-[#C8A96B]/10 text-[#DCC18D]",
  Resolved: "border-[#4B9B78]/40 bg-[#4B9B78]/10 text-[#82C5A2]",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://potholevision.onrender.com";

export default function PotholesPage() {
  const [potholeList, setPotholeList] =
    useState<Pothole[]>(initialPotholes);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");

  const [severityFilter, setSeverityFilter] = useState<
    "All" | Severity
  >("All");

  const [selectedPothole, setSelectedPothole] =
    useState<Pothole | null>(null);

  const [menuPotholeId, setMenuPotholeId] =
    useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [newLocation, setNewLocation] = useState("");
  const [newRoad, setNewRoad] = useState("");
  const [newSeverity, setNewSeverity] =
    useState<Severity>("Medium");

  const pageSize = 5;

  useEffect(() => {
    let cancelled = false;

    async function loadPotholes() {
      try {
        setLoading(true);
        setApiError("");

        const response = await fetch(`${API_URL}/potholes`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load potholes");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid pothole data");
        }

        const formattedPotholes: Pothole[] = data.map((p: any) => {
          const confidenceNumber =
            typeof p.confidence === "number"
              ? p.confidence
              : Number(p.confidence) || 0;

          let severity: Severity = "Low";

          if (p.severity === "critical") {
            severity = "Critical";
          } else if (p.severity === "high") {
            severity = "High";
          } else if (p.severity === "medium") {
            severity = "Medium";
          }

          let status: Status = "Resolved";

          if (p.status === "reported") {
            status = "Open";
          } else if (p.status === "in_progress") {
            status = "In Progress";
          }

          const detectedDate = p.created_at
            ? new Date(p.created_at)
            : null;

          return {
            id: `PV-${String(p.id).padStart(5, "0")}`,
            location:
              p.latitude !== null &&
              p.latitude !== undefined &&
              p.longitude !== null &&
              p.longitude !== undefined
                ? `${Number(p.latitude).toFixed(4)}, ${Number(
                    p.longitude
                  ).toFixed(4)}`
                : "Location unavailable",
            road: "AI Detected Road Damage",
            severity,
            status,
            detected:
              detectedDate && !Number.isNaN(detectedDate.getTime())
                ? detectedDate.toLocaleString()
                : "Date unavailable",
            confidence:
              confidenceNumber <= 1
                ? `${(confidenceNumber * 100).toFixed(1)}%`
                : `${confidenceNumber.toFixed(1)}%`,
          };
        });

        if (!cancelled) {
          setPotholeList(formattedPotholes);
        }
      } catch (error) {
        console.error("Could not load potholes:", error);

        if (!cancelled) {
          setApiError(
            "Live data could not be loaded. Showing available demo records."
          );
          setPotholeList(initialPotholes);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPotholes();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPotholes = useMemo(() => {
    return potholeList.filter((pothole) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        pothole.location.toLowerCase().includes(query) ||
        pothole.road.toLowerCase().includes(query) ||
        pothole.id.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === "All" ||
        pothole.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [potholeList, search, severityFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPotholes.length / pageSize)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPotholes = filteredPotholes.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const totalCount = potholeList.length;

  const criticalCount = potholeList.filter(
    (item) => item.severity === "Critical"
  ).length;

  const inProgressCount = potholeList.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolvedCount = potholeList.filter(
    (item) => item.status === "Resolved"
  ).length;

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleSeverityChange(value: "All" | Severity) {
    setSeverityFilter(value);
    setCurrentPage(1);
  }

  function handleAddPothole() {
    if (!newLocation.trim() || !newRoad.trim()) {
      return;
    }

    const newPothole: Pothole = {
      id: `PV-${10249 + potholeList.length - 7}`,
      location: newLocation.trim(),
      road: newRoad.trim(),
      severity: newSeverity,
      status: "Open",
      detected: new Date().toLocaleString(),
      confidence: "94.2%",
    };

    setPotholeList((current) => [
      newPothole,
      ...current,
    ]);

    setNewLocation("");
    setNewRoad("");
    setNewSeverity("Medium");

    setShowAddModal(false);
    setCurrentPage(1);
  }

  function updateStatus(id: string, status: Status) {
    setPotholeList((current) =>
      current.map((pothole) =>
        pothole.id === id
          ? { ...pothole, status }
          : pothole
      )
    );

    setMenuPotholeId(null);

    if (selectedPothole?.id === id) {
      setSelectedPothole((current) =>
        current ? { ...current, status } : null
      );
    }
  }

  function deletePothole(id: string) {
    setPotholeList((current) =>
      current.filter((pothole) => pothole.id !== id)
    );

    setMenuPotholeId(null);

    if (selectedPothole?.id === id) {
      setSelectedPothole(null);
    }
  }

  return (
    <DashboardLayout>
      {loading && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#101317]/95 px-4 backdrop-blur-md">
          <LoadingSpinner label="LOADING ROAD REGISTRY" />
        </div>
      )}
      <div
        className="min-h-screen min-w-0 bg-[#101317] py-3 sm:py-5 lg:py-8"
        onClick={() => setMenuPotholeId(null)}
      >
        <div className="mx-auto w-full max-w-[1600px]">
          {/* Header */}
          <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C8A96B] sm:text-xs">
                Infrastructure Management
              </p>

              <h1 className="mt-1.5 text-2xl font-bold text-[#F4E9D0] sm:mt-2 sm:text-3xl">
                Pothole Management
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-[#A1AAB2] sm:text-sm">
                Monitor, review and manage detected road damage
                across the city.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A96B] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(40,91,137,0.22)] transition hover:bg-[#B99558] sm:w-auto"
            >
              <Plus size={18} />
              Add Pothole
            </button>
          </div>

          {/* Summary Cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <div className="group min-w-0 rounded-2xl border border-[#3A424C] bg-[#222831] p-3 shadow-[0_6px_20px_rgba(16,42,67,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(16,42,67,0.10)] sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-[11px] text-[#A1AAB2] sm:text-sm">
                  Total Potholes
                </p>

                <div className="shrink-0 rounded-lg bg-[#343B43] p-1.5 text-[#C8A96B] sm:p-2">
                  <AlertTriangle size={16} />
                </div>
              </div>

              <p className="mt-2 text-[23px] font-bold tracking-tight text-[#F4E9D0] sm:mt-3 sm:text-3xl">
                {totalCount.toLocaleString()}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-[#8B969E] sm:mt-1 sm:text-xs">
                Detected locations
              </p>
            </div>

            <div className="group min-w-0 rounded-2xl border border-[#3A424C] bg-[#222831] p-3 shadow-[0_6px_20px_rgba(16,42,67,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(16,42,67,0.10)] sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-[11px] text-[#A1AAB2] sm:text-sm">
                  Critical
                </p>

                <div className="shrink-0 rounded-lg bg-red-50 p-1.5 text-red-500 sm:p-2">
                  <AlertTriangle size={16} />
                </div>
              </div>

              <p className="mt-2 text-[23px] font-bold tracking-tight text-[#F4E9D0] sm:mt-3 sm:text-3xl">
                {criticalCount}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-red-500 sm:mt-1 sm:text-xs">
                Requires immediate attention
              </p>
            </div>

            <div className="group min-w-0 rounded-2xl border border-[#3A424C] bg-[#222831] p-3 shadow-[0_6px_20px_rgba(16,42,67,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(16,42,67,0.10)] sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-[11px] text-[#A1AAB2] sm:text-sm">
                  In Progress
                </p>

                <div className="shrink-0 rounded-lg bg-amber-50 p-1.5 text-amber-500 sm:p-2">
                  <Clock3 size={16} />
                </div>
              </div>

              <p className="mt-2 text-[23px] font-bold tracking-tight text-[#F4E9D0] sm:mt-3 sm:text-3xl">
                {inProgressCount}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-[#8B969E] sm:mt-1 sm:text-xs">
                Currently being repaired
              </p>
            </div>

            <div className="group min-w-0 rounded-2xl border border-[#3A424C] bg-[#222831] p-3 shadow-[0_6px_20px_rgba(16,42,67,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(16,42,67,0.10)] sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-[11px] text-[#A1AAB2] sm:text-sm">
                  Resolved
                </p>

                <div className="shrink-0 rounded-lg bg-emerald-50 p-1.5 text-emerald-500 sm:p-2">
                  <CheckCircle2 size={16} />
                </div>
              </div>

              <p className="mt-2 text-[23px] font-bold tracking-tight text-[#F4E9D0] sm:mt-3 sm:text-3xl">
                {resolvedCount}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-emerald-600 sm:mt-1 sm:text-xs">
                Successfully repaired
              </p>
            </div>
          </div>

          {/* Main Table */}
          <section className="overflow-hidden rounded-2xl border border-[#3A424C] bg-[#222831] shadow-[0_8px_30px_rgba(16,42,67,0.07)]">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 border-b border-[#343B43] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#F4E9D0]">
                  Detected Potholes
                </h2>

                <p className="mt-1 text-xs text-[#8B969E]">
                  Review detected road damage and current repair
                  status.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-center">
                {/* Search */}
                <div className="relative w-full sm:min-w-[240px] sm:flex-1 lg:w-56 lg:flex-none">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B969E]"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      handleSearchChange(event.target.value)
                    }
                    placeholder="Search potholes..."
                    className="h-10 w-full rounded-lg border border-[#3A424C] bg-[#1A2026] pl-9 pr-3 text-sm text-[#F4E9D0] outline-none transition focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20"
                  />
                </div>

                {/* Filter */}
                <div className="relative w-full sm:w-auto">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A1AAB2]"
                  />

                  <select
                    value={severityFilter}
                    onChange={(event) =>
                      handleSeverityChange(
                        event.target.value as
                          | "All"
                          | Severity
                      )
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-[#3A424C] bg-[#1A2026] pl-9 pr-8 text-sm text-[#D8BD8A] outline-none focus:border-[#C8A96B] sm:w-auto"
                  >
                    <option value="All">All Severity</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading / Error */}
            {loading && (
              <div className="border-b border-[#343B43] px-4 py-3 text-xs text-[#A1AAB2] sm:px-5">
                Loading live pothole data...
              </div>
            )}

            {apiError && !loading && (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 sm:px-5">
                {apiError}
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-[#343B43] bg-[#1A2026] text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#A1AAB2]">
                      Pothole ID
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#A1AAB2]">
                      Location
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#A1AAB2]">
                      Severity
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#A1AAB2]">
                      Status
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#A1AAB2]">
                      AI Confidence
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#A1AAB2]">
                      Detected
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#A1AAB2]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedPotholes.map((pothole) => (
                    <tr
                      key={pothole.id}
                      className="border-b border-[#343B43] transition hover:bg-[#2A3038]"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-[#D8BD8A]">
                          {pothole.id}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-[#343B43] p-2 text-[#C8A96B]">
                            <MapPin size={17} />
                          </div>

                          <div>
                            <p className="max-w-[260px] truncate text-sm font-semibold text-[#F4E9D0]">
                              {pothole.location}
                            </p>

                            <p className="mt-0.5 max-w-[260px] truncate text-xs text-[#8B969E]">
                              {pothole.road}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex min-h-[27px] items-center justify-center whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] ${severityStyles[pothole.severity]}`}
                        >
                          {pothole.severity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex min-h-[27px] items-center justify-center whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] ${statusStyles[pothole.status]}`}
                        >
                          {pothole.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-[#D8BD8A]">
                          {pothole.confidence}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs text-[#8B969E]">
                          {pothole.detected}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="relative flex justify-end gap-2">
                          {/* View */}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedPothole(pothole);
                              setMenuPotholeId(null);
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-[#3A424C] bg-[#1A2026] px-3 py-2 text-xs font-semibold text-[#D8BD8A] shadow-sm transition hover:bg-[#303740]"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          {/* More */}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              setMenuPotholeId(
                                menuPotholeId === pothole.id
                                  ? null
                                  : pothole.id
                              );
                            }}
                            className="rounded-lg border border-[#3A424C] bg-[#1A2026] p-2 text-[#A1AAB2] shadow-sm transition hover:bg-[#303740]"
                            aria-label="More actions"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {/* Action Menu */}
                          {menuPotholeId === pothole.id && (
                            <div
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                              className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-[#3A424C] bg-[#1A2026] p-1.5 shadow-[0_12px_30px_rgba(16,42,67,0.16)]"
                            >
                              {pothole.status !== "In Progress" &&
                                pothole.status !== "Resolved" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStatus(
                                        pothole.id,
                                        "In Progress"
                                      )
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-[#D8BD8A] hover:bg-[#303740]"
                                  >
                                    <Wrench size={15} />
                                    Start Repair
                                  </button>
                                )}

                              {pothole.status !== "Resolved" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(
                                      pothole.id,
                                      "Resolved"
                                    )
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                                >
                                  <CheckCircle2 size={15} />
                                  Mark Resolved
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  deletePothole(pothole.id)
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPotholes.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <Search
                    className="mx-auto text-[#9aafc1]"
                    size={32}
                  />

                  <p className="mt-3 text-sm font-semibold text-[#D8BD8A]">
                    No potholes found
                  </p>

                  <p className="mt-1 text-xs text-[#8B969E]">
                    Try changing your search or severity filter.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-[#343B43] bg-[#1A2026] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-[#8B969E]">
                Showing{" "}
                <span className="font-semibold text-[#D8BD8A]">
                  {filteredPotholes.length}
                </span>{" "}
                potholes
              </p>

              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                <button
                  type="button"
                  disabled={safeCurrentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                  className="rounded-lg border border-[#3A424C] bg-[#1A2026] px-3 py-1.5 text-xs font-medium text-[#D8BD8A] transition hover:bg-[#303740] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 overflow-x-auto">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        safeCurrentPage === page
                          ? "bg-[#C8A96B] text-white"
                          : "border border-[#3A424C] bg-[#1A2026] text-[#D8BD8A] hover:bg-[#303740]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  className="rounded-lg border border-[#3A424C] bg-[#1A2026] px-3 py-1.5 text-xs font-medium text-[#D8BD8A] transition hover:bg-[#303740] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Add Pothole Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#080A0D]/80 p-3 backdrop-blur-[3px] sm:items-center sm:p-6"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#3A424C] bg-[#222831] shadow-[0_20px_60px_rgba(16,42,67,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#343B43] px-5 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C8A96B] sm:text-xs">
                  Infrastructure Management
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#F4E9D0]">
                  Add Pothole
                </h2>

                <p className="mt-1 text-xs text-[#8B969E]">
                  Create a new pothole record.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-[#A1AAB2] transition hover:bg-[#303740]"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#D8BD8A]">
                  Location
                </label>

                <input
                  value={newLocation}
                  onChange={(event) =>
                    setNewLocation(event.target.value)
                  }
                  placeholder="e.g. Nehru Place"
                  className="h-11 w-full rounded-lg border border-[#3A424C] bg-[#1A2026] px-3 text-sm text-[#F4E9D0] outline-none focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#D8BD8A]">
                  Road
                </label>

                <input
                  value={newRoad}
                  onChange={(event) =>
                    setNewRoad(event.target.value)
                  }
                  placeholder="e.g. Outer Ring Road"
                  className="h-11 w-full rounded-lg border border-[#3A424C] bg-[#1A2026] px-3 text-sm text-[#F4E9D0] outline-none focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#D8BD8A]">
                  Severity
                </label>

                <select
                  value={newSeverity}
                  onChange={(event) =>
                    setNewSeverity(
                      event.target.value as Severity
                    )
                  }
                  className="h-11 w-full rounded-lg border border-[#3A424C] bg-[#1A2026] px-3 text-sm text-[#D8BD8A] outline-none focus:border-[#C8A96B]"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#343B43] bg-[#1A2026] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-[#3A424C] bg-[#1A2026] px-4 py-2.5 text-sm font-semibold text-[#D8BD8A] transition hover:bg-[#303740]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  !newLocation.trim() || !newRoad.trim()
                }
                onClick={handleAddPothole}
                className="rounded-lg bg-[#C8A96B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B99558] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add Pothole
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPothole && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#080A0D]/80 p-3 backdrop-blur-[3px] sm:items-center sm:p-6"
          onClick={() => setSelectedPothole(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#3A424C] bg-[#222831] shadow-[0_20px_60px_rgba(16,42,67,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#343B43] px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0 pr-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#C8A96B]">
                  Pothole Details
                </p>

                <h2 className="mt-1 break-words text-xl font-bold text-[#F4E9D0]">
                  {selectedPothole.location}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPothole(null)}
                className="shrink-0 rounded-lg p-2 text-[#A1AAB2] transition hover:bg-[#303740]"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-2 sm:gap-4 sm:px-6 sm:py-6">
              <div className="rounded-xl border border-[#343B43] bg-[#1A2026] p-4">
                <p className="text-xs text-[#8B969E]">
                  Pothole ID
                </p>

                <p className="mt-1 text-sm font-semibold text-[#F4E9D0]">
                  {selectedPothole.id}
                </p>
              </div>

              <div className="rounded-xl border border-[#343B43] bg-[#1A2026] p-4">
                <p className="text-xs text-[#8B969E]">
                  Road
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-[#F4E9D0]">
                  {selectedPothole.road}
                </p>
              </div>

              <div className="rounded-xl border border-[#343B43] bg-[#1A2026] p-4">
                <p className="text-xs text-[#8B969E]">
                  Severity
                </p>

                <span
                  className={`mt-2 inline-flex min-h-[27px] items-center justify-center whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] ${severityStyles[selectedPothole.severity]}`}
                >
                  {selectedPothole.severity}
                </span>
              </div>

              <div className="rounded-xl border border-[#343B43] bg-[#1A2026] p-4">
                <p className="text-xs text-[#8B969E]">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex min-h-[27px] items-center justify-center whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] ${statusStyles[selectedPothole.status]}`}
                >
                  {selectedPothole.status}
                </span>
              </div>

              <div className="rounded-xl border border-[#343B43] bg-[#1A2026] p-4">
                <p className="text-xs text-[#8B969E]">
                  AI Confidence
                </p>

                <p className="mt-1 text-sm font-semibold text-[#285b89]">
                  {selectedPothole.confidence}
                </p>
              </div>

              <div className="rounded-xl border border-[#343B43] bg-[#1A2026] p-4">
                <p className="text-xs text-[#8B969E]">
                  Detected
                </p>

                <p className="mt-1 break-words text-xs font-semibold text-[#F4E9D0]">
                  {selectedPothole.detected}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#343B43] bg-[#1A2026] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex w-full gap-2 sm:w-auto">
                {selectedPothole.status !== "Resolved" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedPothole.id,
                        "Resolved"
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100 sm:flex-none"
                  >
                    <CheckCircle2 size={15} />
                    Resolve
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPothole(null)}
                className="w-full rounded-lg bg-[#C8A96B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B99558] sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


