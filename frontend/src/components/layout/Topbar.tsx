"use client";

import {
  Bell,
  CalendarDays,
  Menu,
  Search,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex h-[82px] items-center justify-between border-b border-[#e7e0f2] bg-[#f7f4fb]/90 px-7 backdrop-blur-xl">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7e0f2] bg-white text-[#171126] shadow-sm transition hover:border-violet-300 hover:text-violet-600 lg:hidden">
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-[25px] font-bold tracking-tight text-[#171126]">
            Dashboard
          </h1>

          <p className="mt-0.5 text-sm text-[#756d86]">
            Overview of road infrastructure and maintenance activities
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="hidden items-center gap-3 md:flex">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958da5]"
          />

          <input
            type="text"
            placeholder="Search anything..."
            className="h-11 w-[240px] rounded-xl border border-[#e7e0f2] bg-white pl-10 pr-4 text-sm text-[#171126] outline-none transition placeholder:text-[#a39bad] focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>

        {/* Notification */}
        <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#e7e0f2] bg-white text-[#514960] shadow-sm transition hover:border-violet-300 hover:text-violet-600">
          <Bell size={19} />

          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-violet-500/30">
            12
          </span>
        </button>

        {/* Date */}
        <button className="flex h-11 items-center gap-2 rounded-xl border border-[#e7e0f2] bg-white px-4 text-sm font-medium text-[#332b43] shadow-sm transition hover:border-violet-300">
          <CalendarDays size={17} className="text-violet-600" />

          <span>May 20 - May 26, 2024</span>
        </button>
      </div>
    </header>
  );
}