"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bus,
  Building2,
  MapPin,
  Calendar,
  Ticket,
  BarChart3,
  FileText,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Buses & Seats", href: "/admin/buses", icon: Bus },
  { name: "Operators", href: "/admin/operators", icon: Building2 },
  { name: "Routes & Stops", href: "/admin/routes", icon: MapPin },
  { name: "Trip Schedules", href: "/admin/trips", icon: Calendar },
  { name: "Bookings", href: "/admin/bookings", icon: Ticket },
  { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-900 text-white flex flex-col shrink-0 min-h-screen">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
          <Bus className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-white">SwiftTransit</span>
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            Ops Console
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Switch to Passenger Portal */}
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Customer Portal
        </Link>
      </div>
    </aside>
  );
}
