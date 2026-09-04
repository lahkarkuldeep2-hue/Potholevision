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

import Sidebar from "@/components/layout/Sidebar";

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
    detected: "May 26, 2024 • 10:32 AM",
    confidence: "98.4%",
  },
  {
    id: "PV-10247",
    location: "Ring Road",
    road: "Ring Road",
    severity: "High",
    status: "In Progress",
    detected: "May 26, 2024 • 09:15 AM",
    confidence: "96.8%",
  },
  {
    id: "PV-10246",
    location: "India Gate",
    road: "Rajpath Road",
    severity: "High",
    status: "Open",
    detected: "May 26, 2024 • 08:42 AM",
    confidence: "95.2%",
  },
  {
    id: "PV-10245",
    location: "Khan Market",
    road: "Khan Market Road",
    severity: "Medium",
    status: "Resolved",
    detected: "May 25, 2024 • 04:20 PM",
    confidence: "93.7%",
  },
  {
    id: "PV-10244",
    location: "Lodhi Road",
    road: "Lodhi Road",
    severity: "Medium",
    status: "In Progress",
    detected: "May 25, 2024 • 02:18 PM",
    confidence: "91.6%",
  },
  {
    id: "PV-10243",
    location: "Pragati Maidan",
    road: "Mathura Road",
    severity: "Low",
    status: "Resolved",
    detected: "May 25, 2024 • 11:05 AM",
    confidence: "89.3%",
  },
  {
    id: "PV-10242",
    location: "Saket",
    road: "Press Enclave Road",
    severity: "Low",
    status: "Open",
    detected: "May 24, 2024 • 05:46 PM",
    confidence: "87.9%",
  },
];

const severityStyles: Record<Severity, string> = {
  Critical: "border-red-200 bg-red-50 text-red-600",
  High: "border-orange-200 bg-orange-50 text-orange-600",
  Medium: "border-blue-200 bg-blue-50 text-blue-600",
  Low: "border-slate-200 bg-slate-50 text-slate-600",
};

const statusStyles: Record<Status, string> = {
  Open: "border-red-200 bg-red-50 text-red-600",
  "In Progress": "border-amber-200 bg-amber-50 text-amber-600",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-600",
};

export default function PotholesPage() {
  const [potholeList, setPotholeList] =
    useState<Pothole[]>(initialPotholes);

  useEffect(() => {
    async function loadPotholes() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/potholes"
        );

        if (!response.ok) {
          throw new Error("Failed to load potholes");
        }

        const data = await response.json();

        const formattedPotholes = data.map((p: any) => ({
          id: `PV-${String(p.id).padStart(5, "0")}`,
          location:
            p.latitude !== null && p.longitude !== null
              ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`
              : "Location unavailable",
          road: "AI Detected Road Damage",
          severity:
            p.severity === "high"
              ? "High"
              : p.severity === "medium"
                ? "Medium"
                : "Low",
          status:
            p.status === "reported"
              ? "Open"
              : p.status === "in_progress"
                ? "In Progress"
                : "Resolved",
          detected: new Date(
            p.created_at
          ).toLocaleString(),
          confidence: `${(
            p.confidence * 100
          ).toFixed(1)}%`,
        }));

        setPotholeList(formattedPotholes);
      } catch (error) {
        console.error(
          "Could not load potholes:",
          error
        );
      }
    }

    loadPotholes();
  }, []);

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
      detected: "May 27, 2024 • 09:30 AM",
      confidence: "94.2%",
    };

    setPotholeList((current) => [newPothole, ...current]);

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
    <div
      className="min-h-screen bg-[#dfe5eb]"
      onClick={() => setMenuPotholeId(null)}
    >
      <Sidebar />

      <main className="ml-[315px] min-h-screen px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#55779d]">
              Infrastructure Management
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#102a43]">
              Pothole Management
            </h1>

            <p className="mt-1 text-sm text-[#6b8299]">
              Monitor, review and manage detected road damage
              across the city.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#285b89] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(40,91,137,0.22)] transition hover:-translate-y-0.5 hover:bg-[#214e78]"
          >
            <Plus size={18} />
            Add Pothole
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#cbd8e4] bg-[#f8fafc] p-5 shadow-[0_6px_20px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#607d99]">
                Total Potholes
              </p>

              <div className="rounded-lg bg-[#e8f0f7] p-2 text-[#376b9d]">
                <AlertTriangle size={18} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-[#102a43]">
              {totalCount.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-[#7890a6]">
              Detected locations
            </p>
          </div>

          <div className="rounded-2xl border border-[#cbd8e4] bg-[#f8fafc] p-5 shadow-[0_6px_20px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#607d99]">
                Critical
              </p>

              <div className="rounded-lg bg-red-50 p-2 text-red-500">
                <AlertTriangle size={18} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-[#102a43]">
              {234 + criticalCount - 1}
            </p>

            <p className="mt-1 text-xs text-red-500">
              Requires immediate attention
            </p>
          </div>

          <div className="rounded-2xl border border-[#cbd8e4] bg-[#f8fafc] p-5 shadow-[0_6px_20px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#607d99]">
                In Progress
              </p>

              <div className="rounded-lg bg-amber-50 p-2 text-amber-500">
                <Clock3 size={18} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-[#102a43]">
              {166 + inProgressCount}
            </p>

            <p className="mt-1 text-xs text-[#7890a6]">
              Currently being repaired
            </p>
          </div>

          <div className="rounded-2xl border border-[#cbd8e4] bg-[#f8fafc] p-5 shadow-[0_6px_20px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#607d99]">
                Resolved
              </p>

              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-500">
                <CheckCircle2 size={18} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-[#102a43]">
              {641 + resolvedCount}
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              Successfully repaired
            </p>
          </div>
        </div>

        {/* Main Table */}
        <section className="overflow-hidden rounded-2xl border border-[#cbd8e4] bg-[#f8fafc] shadow-[0_8px_30px_rgba(16,42,67,0.07)]">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-[#d7e0e8] px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-[#102a43]">
                Detected Potholes
              </h2>

              <p className="mt-1 text-xs text-[#7890a6]">
                Review detected road damage and current repair
                status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7890a6]"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    handleSearchChange(event.target.value)
                  }
                  placeholder="Search potholes..."
                  className="h-10 w-56 rounded-lg border border-[#cbd8e4] bg-white pl-9 pr-3 text-sm text-[#102a43] outline-none transition focus:border-[#5b84aa] focus:ring-2 focus:ring-[#5b84aa]/10"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#607d99]"
                />

                <select
                  value={severityFilter}
                  onChange={(event) =>
                    handleSeverityChange(
                      event.target.value as "All" | Severity
                    )
                  }
                  className="h-10 appearance-none rounded-lg border border-[#cbd8e4] bg-white pl-9 pr-8 text-sm text-[#315a82] outline-none focus:border-[#5b84aa]"
                >
                  <option value="All">
                    All Severity
                  </option>
                  <option value="Critical">
                    Critical
                  </option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse">
              <thead>
                <tr className="border-b border-[#d7e0e8] bg-[#f1f5f8] text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#607d99]">
                    Pothole ID
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#607d99]">
                    Location
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#607d99]">
                    Severity
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#607d99]">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#607d99]">
                    AI Confidence
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#607d99]">
                    Detected
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#607d99]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedPotholes.map((pothole) => (
                  <tr
                    key={pothole.id}
                    className="border-b border-[#e1e8ee] transition hover:bg-[#f4f7fa]"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-[#315a82]">
                        {pothole.id}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[#e8f0f7] p-2 text-[#4c78a0]">
                          <MapPin size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#102a43]">
                            {pothole.location}
                          </p>

                          <p className="mt-0.5 text-xs text-[#7890a6]">
                            {pothole.road}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${severityStyles[pothole.severity]}`}
                      >
                        {pothole.severity}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[pothole.status]}`}
                      >
                        {pothole.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-[#315a82]">
                        {pothole.confidence}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs text-[#7890a6]">
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
                          className="flex items-center gap-1.5 rounded-lg border border-[#cbd8e4] bg-white px-3 py-2 text-xs font-semibold text-[#315a82] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#eef3f7] hover:shadow-md"
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
                          className="rounded-lg border border-[#cbd8e4] bg-white p-2 text-[#607d99] shadow-sm transition hover:bg-[#eef3f7]"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {/* Action Menu */}
                        {menuPotholeId === pothole.id && (
                          <div
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                            className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-[#cbd8e4] bg-white p-1.5 shadow-[0_12px_30px_rgba(16,42,67,0.16)]"
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
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-[#315a82] hover:bg-[#eef3f7]"
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

                <p className="mt-3 text-sm font-semibold text-[#315a82]">
                  No potholes found
                </p>

                <p className="mt-1 text-xs text-[#7890a6]">
                  Try changing your search or severity filter.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#d7e0e8] bg-[#f7f9fb] px-5 py-3">
            <p className="text-xs text-[#7890a6]">
              Showing{" "}
              <span className="font-semibold text-[#315a82]">
                {filteredPotholes.length}
              </span>{" "}
              potholes
            </p>

            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                className="rounded-lg border border-[#cbd8e4] bg-white px-3 py-1.5 text-xs font-medium text-[#315a82] transition hover:bg-[#eef3f7] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {/* Pages */}
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    safeCurrentPage === page
                      ? "bg-[#285b89] text-white"
                      : "border border-[#cbd8e4] bg-white text-[#315a82] hover:bg-[#eef3f7]"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="rounded-lg border border-[#cbd8e4] bg-white px-3 py-1.5 text-xs font-medium text-[#315a82] transition hover:bg-[#eef3f7] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Add Pothole Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a43]/40 p-6 backdrop-blur-[3px]"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#cbd8e4] bg-[#f8fafc] shadow-[0_20px_60px_rgba(16,42,67,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#d7e0e8] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#55779d]">
                  Infrastructure Management
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#102a43]">
                  Add Pothole
                </h2>

                <p className="mt-1 text-xs text-[#7890a6]">
                  Create a new pothole record.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-[#607d99] transition hover:bg-[#e9eff4]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#315a82]">
                  Location
                </label>

                <input
                  value={newLocation}
                  onChange={(event) =>
                    setNewLocation(event.target.value)
                  }
                  placeholder="e.g. Nehru Place"
                  className="h-11 w-full rounded-lg border border-[#cbd8e4] bg-white px-3 text-sm text-[#102a43] outline-none focus:border-[#5b84aa] focus:ring-2 focus:ring-[#5b84aa]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#315a82]">
                  Road
                </label>

                <input
                  value={newRoad}
                  onChange={(event) =>
                    setNewRoad(event.target.value)
                  }
                  placeholder="e.g. Outer Ring Road"
                  className="h-11 w-full rounded-lg border border-[#cbd8e4] bg-white px-3 text-sm text-[#102a43] outline-none focus:border-[#5b84aa] focus:ring-2 focus:ring-[#5b84aa]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#315a82]">
                  Severity
                </label>

                <select
                  value={newSeverity}
                  onChange={(event) =>
                    setNewSeverity(
                      event.target.value as Severity
                    )
                  }
                  className="h-11 w-full rounded-lg border border-[#cbd8e4] bg-white px-3 text-sm text-[#315a82] outline-none focus:border-[#5b84aa]"
                >
                  <option value="Critical">
                    Critical
                  </option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#d7e0e8] bg-[#f1f5f8] px-6 py-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-[#cbd8e4] bg-white px-4 py-2 text-sm font-semibold text-[#315a82] transition hover:bg-[#eef3f7]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  !newLocation.trim() || !newRoad.trim()
                }
                onClick={handleAddPothole}
                className="rounded-lg bg-[#285b89] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#214e78] disabled:cursor-not-allowed disabled:opacity-40"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a43]/40 p-6 backdrop-blur-[3px]"
          onClick={() => setSelectedPothole(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#cbd8e4] bg-[#f8fafc] shadow-[0_20px_60px_rgba(16,42,67,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#d7e0e8] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#55779d]">
                  Pothole Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#102a43]">
                  {selectedPothole.location}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPothole(null)}
                className="rounded-lg p-2 text-[#607d99] transition hover:bg-[#e9eff4]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 px-6 py-6">
              <div className="rounded-xl border border-[#d7e0e8] bg-white p-4">
                <p className="text-xs text-[#7890a6]">
                  Pothole ID
                </p>

                <p className="mt-1 text-sm font-semibold text-[#102a43]">
                  {selectedPothole.id}
                </p>
              </div>

              <div className="rounded-xl border border-[#d7e0e8] bg-white p-4">
                <p className="text-xs text-[#7890a6]">
                  Road
                </p>

                <p className="mt-1 text-sm font-semibold text-[#102a43]">
                  {selectedPothole.road}
                </p>
              </div>

              <div className="rounded-xl border border-[#d7e0e8] bg-white p-4">
                <p className="text-xs text-[#7890a6]">
                  Severity
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${severityStyles[selectedPothole.severity]}`}
                >
                  {selectedPothole.severity}
                </span>
              </div>

              <div className="rounded-xl border border-[#d7e0e8] bg-white p-4">
                <p className="text-xs text-[#7890a6]">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[selectedPothole.status]}`}
                >
                  {selectedPothole.status}
                </span>
              </div>

              <div className="rounded-xl border border-[#d7e0e8] bg-white p-4">
                <p className="text-xs text-[#7890a6]">
                  AI Confidence
                </p>

                <p className="mt-1 text-sm font-semibold text-[#285b89]">
                  {selectedPothole.confidence}
                </p>
              </div>

              <div className="rounded-xl border border-[#d7e0e8] bg-white p-4">
                <p className="text-xs text-[#7890a6]">
                  Detected
                </p>

                <p className="mt-1 text-xs font-semibold text-[#102a43]">
                  {selectedPothole.detected}
                </p>
              </div>
            </div>

            <div className="flex justify-between border-t border-[#d7e0e8] bg-[#f1f5f8] px-6 py-4">
              <div className="flex gap-2">
                {selectedPothole.status !== "Resolved" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedPothole.id,
                        "Resolved"
                      )
                    }
                    className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
                  >
                    <CheckCircle2 size={15} />
                    Resolve
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPothole(null)}
                className="rounded-lg bg-[#285b89] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#214e78]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}