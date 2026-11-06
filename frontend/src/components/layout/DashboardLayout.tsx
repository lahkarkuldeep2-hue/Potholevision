"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  ScanSearch,
  TriangleAlert,
  X,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Live Map", href: "/live-map", icon: Map },
  { label: "AI Detection", href: "/ai-detection", icon: ScanSearch },
  { label: "Potholes", href: "/potholes", icon: TriangleAlert },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

type StoredUser = {
  name?: string;
  email?: string;
  role?: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#101317] text-[#F4E9D0]">
      {/* Desktop Navigation */}
      <header className="sticky top-0 z-50 hidden border-b border-white/[0.07] bg-[#101317]/95 backdrop-blur-xl lg:block">
        <div className="mx-auto flex h-[82px] max-w-[1700px] items-center justify-between px-7 xl:px-12">
          <Link href="/dashboard" className="shrink-0">
            <BrandLogo />
          </Link>

          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#C8A96B]/[0.12] text-[#C8A96B]"
                      : "text-[#8B969E] hover:bg-white/[0.045] hover:text-[#F4E9D0]"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-[#C8A96B]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="relative flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#A6AFB5] transition hover:border-[#C8A96B]/40 hover:text-[#C8A96B]"
            >
              <Bell size={17} />
              <span className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full bg-[#A33A3A]" />
            </button>

            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 transition hover:border-[#C8A96B]/35"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#C8A96B]/30 bg-[#C8A96B]/10 text-xs font-semibold text-[#C8A96B]">
                {initials}
              </div>
              <div className="text-left">
                <p className="max-w-[115px] truncate text-xs font-semibold text-[#F4E9D0]">
                  {displayName}
                </p>
                <p className="text-[10px] text-[#8B969E]">
                  {user?.role?.replaceAll("_", " ") || "Citizen"}
                </p>
              </div>
              <ChevronDown size={14} className="text-[#8B969E]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#1A2026] p-2 shadow-2xl">
                <div className="border-b border-white/[0.07] px-3 py-3">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  <p className="mt-1 truncate text-xs text-[#8B969E]">
                    {user?.email || ""}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#D88B85] transition hover:bg-[#A33A3A]/10"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#101317]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="min-w-0">
            <BrandLogo compact />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#A6AFB5]"
            >
              <Bell size={17} />
              <span className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full bg-[#A33A3A]" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C8A96B]/25 bg-[#C8A96B]/[0.07] text-[#C8A96B]"
            >
              {mobileMoreOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {mobileMoreOpen && (
          <div className="absolute left-3 right-3 top-[68px] rounded-2xl border border-white/10 bg-[#1A2026] p-3 shadow-2xl">
            <div className="mb-2 border-b border-white/[0.07] px-2 pb-3">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="mt-1 truncate text-xs text-[#8B969E]">
                {user?.email || ""}
              </p>
            </div>

            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                    isActive(item.href)
                      ? "bg-[#C8A96B]/10 text-[#C8A96B]"
                      : "text-[#A6AFB5]"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 border-t border-white/[0.07] px-3 py-3 text-sm text-[#D88B85]"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto min-h-[calc(100vh-82px)] w-full max-w-[1700px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-10 lg:pb-12 lg:pt-9 xl:px-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.09] bg-[#151A20]/95 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {[
            { label: "Home", href: "/dashboard", icon: LayoutDashboard },
            { label: "Detect", href: "/ai-detection", icon: ScanSearch },
            { label: "Map", href: "/live-map", icon: Map },
            { label: "Records", href: "/potholes", icon: TriangleAlert },
            { label: "Insights", href: "/analytics", icon: Activity },
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition ${
                  active ? "text-[#C8A96B]" : "text-[#78838C]"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <span className="h-1 w-1 rounded-full bg-[#C8A96B]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
