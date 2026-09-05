"use client";

import Sidebar from "../../components/layout/Sidebar";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#081421] text-white">
      <Sidebar />

      <main className="ml-[300px] min-h-screen p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f9bc2]">
            Settings
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            System Settings
          </h1>

          <p className="mt-2 text-[#8fa8bf]">
            Manage PotholeVision platform configuration.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1d344d] bg-[#0d1b2a] p-8">
          <h2 className="text-xl font-semibold">Platform Configuration</h2>

          <p className="mt-3 text-[#8fa8bf]">
            Configuration options will be available here.
          </p>
        </div>
      </main>
    </div>
  );
}