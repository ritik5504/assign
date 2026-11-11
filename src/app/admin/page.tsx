"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bus,
  MapPin,
  Calendar,
  Ticket,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Percent,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Metrics = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Booking = any;

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/reports/overview").then((r) => r.json()),
      fetch("/api/bookings?limit=6").then((r) => r.json()),
    ])
      .then(([metricsRes, bookingsRes]) => {
        if (metricsRes.success) setMetrics(metricsRes.data);
        if (bookingsRes.success) setRecentBookings(bookingsRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Operational Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fleet operations, booking revenue, and load metrics calculated directly from database records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/trips">
            <Button size="sm" className="font-bold">
              Schedule New Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Booking Revenue
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {metrics ? formatCurrency(metrics.totalRevenue) : "..."}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {metrics?.confirmedBookings || 0} confirmed paid bookings
          </p>
        </div>

        {/* Seat Occupancy Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Seat Occupancy Rate
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {metrics ? `${metrics.occupancyPercentage}%` : "..."}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {metrics ? `${metrics.bookedTripSeats} of ${metrics.totalTripSeats} seats booked` : "..."}
          </p>
        </div>

        {/* Bookings Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Bookings
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Ticket className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {metrics ? metrics.totalBookings : "..."}
          </p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-700 font-semibold">
              ✓ {metrics?.confirmedBookings || 0} active
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-rose-600 font-semibold">
              ✕ {metrics?.cancelledBookings || 0} cancelled
            </span>
          </div>
        </div>

        {/* Fleet & Network */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Fleet Network
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bus className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {metrics ? metrics.totalBuses : "..."} <span className="text-sm font-normal text-slate-500">Buses</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Across {metrics?.totalRoutes || 0} routes • {metrics?.totalTrips || 0} trips
          </p>
        </div>
      </div>

      {/* Live Recent Bookings Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Recent Passenger Bookings</h2>
            <p className="text-xs text-slate-500">Instant database mirror of customer reservations</p>
          </div>
          <Link href="/admin/bookings">
            <Button variant="ghost" size="sm" className="text-xs text-emerald-600 font-semibold">
              View All Bookings <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">PNR</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Route</th>
                <th className="p-3.5">Coach</th>
                <th className="p-3.5">Seats</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    Loading recent bookings...
                  </td>
                </tr>
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No bookings recorded yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{b.pnr}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{b.user.name}</p>
                      <p className="text-[11px] text-slate-400">{b.user.email}</p>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {b.trip.route.source} → {b.trip.route.destination}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {b.trip.bus.busName} (#{b.trip.bus.registrationNumber})
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-800">
                        {b.bookingSeats.map((bs: any) => bs.tripSeat.seat.seatNumber).join(", ")}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={b.status === "CONFIRMED" ? "default" : "destructive"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link href={`/admin/manifest/${b.trip.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold">
                          Trip Manifest
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

