"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Map,
  TriangleAlert,
  BarChart3,
  Workflow,
  UserRound,
  ScanSearch,
  X,
  LogOut,
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

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

function formatRole(role: string) {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Sidebar({
  mobileOpen = false,
  onClose = () => {},
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  }, []);

  function handleLogout() {
    setLoggingOut(true);

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    onClose();

    router.push("/login");
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-[9999] flex h-screen w-[300px] flex-col border-r border-[#1d344d] bg-[#0d1b2a] transition-transform duration-300 ease-in-out ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[128px] shrink-0 items-center border-b border-[#1d344d] px-8">
          <div className="flex w-full items-center justify-between">
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

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-[#9bb3c8] transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
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
                  onClick={onClose}
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

        {/* Logged-in User */}
        <div className="shrink-0 border-t border-[#1d344d] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#31516e] bg-[#152a40]">
              <UserRound
                size={19}
                className="text-[#8eb1cf]"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-white">
                {user?.name || "User"}
              </p>

              <p className="text-[12px] text-[#7893ad]">
                {user?.role ? formatRole(user.role) : "Citizen"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[#3a536b] bg-[#132a42] text-[14px] font-semibold text-[#c5d3df] transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={17} />

            <span>
              {loggingOut ? "Signing out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}