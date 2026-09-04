"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  TriangleAlert,
  BarChart3,
  Workflow,
  UserRound,
  ScanSearch,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Live Map",
    href: "/live-map",
    icon: Map,
  },
  {
    label: "AI Detection",
    href: "/ai-detection",
    icon: ScanSearch,
  },
  {
    label: "Potholes",
    href: "/potholes",
    icon: TriangleAlert,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[300px] flex-col border-r border-[#1d344d] bg-[#0d1b2a]">
      {/* Brand */}
      <div className="flex h-[128px] shrink-0 items-center border-b border-[#1d344d] px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-[66px] w-[66px] items-center justify-center rounded-[18px] bg-[#2f73b7] shadow-[0_8px_20px_rgba(47,115,183,0.22)]">
            <Workflow
              size={34}
              strokeWidth={2.2}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-[25px] font-bold tracking-[-0.5px] text-white">
              PotholeVision
            </h1>

            <p className="mt-1 text-[13px] font-medium text-[#7fa5c9]">
              AI Road Infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <p className="mb-5 px-3 text-[12px] font-bold uppercase tracking-[0.18em] text-[#718aa3]">
          Main Menu
        </p>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex h-[62px] items-center rounded-[14px] border px-5 transition-all duration-200 ${
                  isActive
                    ? "border-[#376fa7] bg-[#21466f] text-white shadow-[0_6px_18px_rgba(15,42,68,0.18)]"
                    : "border-transparent text-[#a5b8ca] hover:border-[#263f58] hover:bg-[#152a40] hover:text-white"
                }`}
              >
                <Icon
                  size={23}
                  strokeWidth={1.9}
                  className={`mr-5 shrink-0 ${
                    isActive
                      ? "text-[#82b7e5]"
                      : "text-[#7f9bb5]"
                  }`}
                />

                <span className="text-[16px] font-medium">
                  {item.label}
                </span>

                {isActive && (
                  <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#79b3e2]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="mt-8 rounded-[14px] border border-[#29445f] bg-[#132a42] px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

            <span className="text-[14px] font-semibold text-[#e3edf5]">
              All Systems Operational
            </span>
          </div>

          <p className="mt-2 text-[12px] text-[#7893ad]">
            GPS&nbsp;&nbsp;•&nbsp;&nbsp;Cameras&nbsp;&nbsp;•&nbsp;&nbsp;Database
          </p>
        </div>
      </div>

      {/* User */}
      <div className="shrink-0 border-t border-[#1d344d] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#31516e] bg-[#152a40]">
            <UserRound
              size={19}
              className="text-[#8eb1cf]"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">
              Arjun Kumar
            </p>

            <p className="text-[12px] text-[#7893ad]">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}