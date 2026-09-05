"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#dce2e8]">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-[64px] items-center border-b border-[#c8d2dc] bg-[#eef2f5]/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#c7d3df] bg-white text-[#183b5d] shadow-sm"
          aria-label="Open menu"
        >
          <Menu size={23} />
        </button>

        <div className="ml-3">
          <p className="text-[16px] font-bold text-[#123052]">
            PotholeVision
          </p>

          <p className="text-[10px] font-medium text-[#71869a]">
            AI Road Infrastructure
          </p>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="min-h-screen min-w-0 px-3 pt-3 sm:px-5 sm:pt-5 lg:ml-[320px] lg:px-5 lg:pt-0">
        {children}
      </main>
    </div>
  );
}