"use client";

import Sidebar from "../../components/layout/Sidebar";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[#081421] text-white">
      <Sidebar />

      <main className="ml-[300px] min-h-screen p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f9bc2]">
            Reports
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Infrastructure Reports
          </h1>

          <p className="mt-2 text-[#8fa8bf]">
            Generate and review PotholeVision infrastructure reports.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1d344d] bg-[#0d1b2a] p-8">
          <h2 className="text-xl font-semibold">Reports</h2>

          <p className="mt-3 text-[#8fa8bf]">
            Reporting tools will be available here.
          </p>
        </div>
      </main>
    </div>
  );
}