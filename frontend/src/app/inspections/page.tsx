"use client";

import {
  ClipboardCheck,
  Search,
  Filter,
  MapPin,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Camera,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

const inspections = [
  {
    id: "IN-2048",
    location: "Connaught Place",
    road: "Barakhamba Road",
    inspector: "Rajesh Kumar",
    date: "May 26, 2024",
    time: "10:32 AM",
    status: "Completed",
    findings: "3 potholes detected",
    priority: "Critical",
  },
  {
    id: "IN-2047",
    location: "Ring Road",
    road: "Outer Ring Road",
    inspector: "Amit Sharma",
    date: "May 26, 2024",
    time: "09:15 AM",
    status: "In Progress",
    findings: "5 potholes detected",
    priority: "High",
  },
  {
    id: "IN-2046",
    location: "India Gate",
    road: "Rajpath Road",
    inspector: "Neha Verma",
    date: "May 26, 2024",
    time: "08:42 AM",
    status: "Completed",
    findings: "2 potholes detected",
    priority: "High",
  },
  {
    id: "IN-2045",
    location: "Lodhi Road",
    road: "Lodhi Colony",
    inspector: "Vikram Singh",
    date: "May 25, 2024",
    time: "04:20 PM",
    status: "Pending Review",
    findings: "4 potholes detected",
    priority: "Medium",
  },
  {
    id: "IN-2044",
    location: "Karol Bagh",
    road: "Ajmal Khan Road",
    inspector: "Priya Mehta",
    date: "May 25, 2024",
    time: "02:18 PM",
    status: "Completed",
    findings: "1 pothole detected",
    priority: "Low",
  },
];

export default function InspectionsPage() {
  return (
    <div className="min-h-screen bg-[#dfe5eb]">
      <Sidebar />

      <main className="ml-[335px] min-h-screen p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#55779d]">
              Field Operations
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#102a43]">
              Inspections
            </h1>

            <p className="mt-1 text-sm text-[#6b8299]">
              Review field inspections, road conditions and AI detections.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-[#286294] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(40,98,148,0.22)] transition hover:bg-[#20557f]"
          >
            <ClipboardCheck size={18} />
            New Inspection
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-4 gap-5">
          <div className="rounded-2xl border border-[#c8d5e1] bg-[#f8fafc] p-5 shadow-[0_6px_22px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#5d7894]">Total Inspections</p>

              <div className="rounded-xl bg-[#e8f0f7] p-2.5 text-[#376b9d]">
                <ClipboardCheck size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-[#102a43]">156</p>

            <p className="mt-1 text-xs text-[#7890a6]">
              This month
            </p>
          </div>

          <div className="rounded-2xl border border-[#c8d5e1] bg-[#f8fafc] p-5 shadow-[0_6px_22px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#5d7894]">Completed</p>

              <div className="rounded-xl bg-[#e8f7f1] p-2.5 text-emerald-600">
                <CheckCircle2 size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-[#102a43]">118</p>

            <p className="mt-1 text-xs text-emerald-600">
              75.6% completion rate
            </p>
          </div>

          <div className="rounded-2xl border border-[#c8d5e1] bg-[#f8fafc] p-5 shadow-[0_6px_22px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#5d7894]">In Progress</p>

              <div className="rounded-xl bg-[#fff7df] p-2.5 text-amber-600">
                <Clock3 size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-[#102a43]">24</p>

            <p className="mt-1 text-xs text-[#7890a6]">
              Currently active
            </p>
          </div>

          <div className="rounded-2xl border border-[#c8d5e1] bg-[#f8fafc] p-5 shadow-[0_6px_22px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#5d7894]">Needs Review</p>

              <div className="rounded-xl bg-[#fff0ef] p-2.5 text-red-500">
                <AlertTriangle size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-[#102a43]">14</p>

            <p className="mt-1 text-xs text-red-500">
              Requires attention
            </p>
          </div>
        </div>

        {/* Main Card */}
        <section className="overflow-hidden rounded-2xl border border-[#c8d5e1] bg-[#f8fafc] shadow-[0_8px_30px_rgba(16,42,67,0.07)]">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-[#d7e0e8] px-6 py-5">
            <div>
              <h2 className="text-base font-semibold text-[#102a43]">
                Recent Inspections
              </h2>

              <p className="mt-1 text-xs text-[#7890a6]">
                Monitor inspection activity across road infrastructure.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex items-center gap-2 rounded-lg border border-[#cbd8e4] bg-white px-3 py-2.5">
                <Search size={17} className="text-[#7890a6]" />

                <input
                  type="text"
                  placeholder="Search inspections..."
                  className="w-48 bg-transparent text-sm text-[#102a43] outline-none placeholder:text-[#8aa0b5]"
                />
              </div>

              {/* Filter */}
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-[#cbd8e4] bg-white px-4 py-2.5 text-sm text-[#315a82] transition hover:bg-[#eef3f7]"
              >
                <Filter size={17} />
                All Status
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-[#d7e0e8] bg-[#f1f5f8] text-left">
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#55779d]">
                    Inspection ID
                  </th>

                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#55779d]">
                    Location
                  </th>

                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#55779d]">
                    Inspector
                  </th>

                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#55779d]">
                    Date & Time
                  </th>

                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#55779d]">
                    Findings
                  </th>

                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#55779d]">
                    Priority
                  </th>

                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#55779d]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-[#55779d]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {inspections.map((inspection) => (
                  <tr
                    key={inspection.id}
                    className="border-b border-[#e1e7ed] transition hover:bg-[#f5f8fa]"
                  >
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-semibold text-[#315a82]">
                        {inspection.id}
                      </span>
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[#e8f0f7] p-2 text-[#47769f]">
                          <MapPin size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#102a43]">
                            {inspection.location}
                          </p>

                          <p className="mt-0.5 text-xs text-[#7890a6]">
                            {inspection.road}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-5">
                      <p className="text-sm font-medium text-[#274967]">
                        {inspection.inspector}
                      </p>
                    </td>

                    <td className="px-4 py-5">
                      <p className="text-sm text-[#315a82]">
                        {inspection.date}
                      </p>

                      <p className="mt-0.5 text-xs text-[#8aa0b5]">
                        {inspection.time}
                      </p>
                    </td>

                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2 text-sm text-[#315a82]">
                        <Camera size={16} />
                        {inspection.findings}
                      </div>
                    </td>

                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          inspection.priority === "Critical"
                            ? "border-red-200 bg-red-50 text-red-600"
                            : inspection.priority === "High"
                            ? "border-orange-200 bg-orange-50 text-orange-600"
                            : inspection.priority === "Medium"
                            ? "border-blue-200 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {inspection.priority}
                      </span>
                    </td>

                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          inspection.status === "Completed"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : inspection.status === "In Progress"
                            ? "border-amber-200 bg-amber-50 text-amber-600"
                            : "border-blue-200 bg-blue-50 text-blue-600"
                        }`}
                      >
                        {inspection.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-lg border border-[#cbd8e4] bg-white px-3 py-2 text-sm font-medium text-[#315a82] shadow-sm transition hover:bg-[#eef3f7]"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          type="button"
                          className="rounded-lg border border-[#cbd8e4] bg-white p-2 text-[#52708b] shadow-sm transition hover:bg-[#eef3f7]"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#d7e0e8] px-6 py-4">
            <p className="text-xs text-[#7890a6]">
              Showing 5 of 156 inspections
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-[#cbd8e4] bg-white px-3 py-2 text-xs text-[#7890a6]"
              >
                Previous
              </button>

              <button
                type="button"
                className="rounded-lg bg-[#286294] px-3 py-2 text-xs font-semibold text-white"
              >
                1
              </button>

              <button
                type="button"
                className="rounded-lg border border-[#cbd8e4] bg-white px-3 py-2 text-xs text-[#315a82] hover:bg-[#eef3f7]"
              >
                2
              </button>

              <button
                type="button"
                className="rounded-lg border border-[#cbd8e4] bg-white px-3 py-2 text-xs text-[#315a82] hover:bg-[#eef3f7]"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}