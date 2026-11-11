"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Percent, Bus, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OccupancyData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RevenueItem = any;

export default function AdminReportsPage() {
  const [occupancy, setOccupancy] = useState<OccupancyData | null>(null);
  const [revenue, setRevenue] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/reports/occupancy").then((r) => r.json()),
      fetch("/api/admin/reports/revenue").then((r) => r.json()),
    ])
      .then(([occRes, revRes]) => {
        if (occRes.success) setOccupancy(occRes.data);
        if (revRes.success) setRevenue(revRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-emerald-600" />
          Analytics & Operational Reports
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics on route occupancy, fleet utilization, and daily booking revenue.
        </p>
      </div>

      {/* Daily Revenue Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Daily Revenue Aggregation
          </h2>
          <span className="text-xs text-slate-500">Calculated from confirmed database bookings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Confirmed Bookings</th>
                <th className="p-3 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400">
                    Loading revenue records...
                  </td>
                </tr>
              ) : revenue.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400">
                    No confirmed booking revenue recorded.
                  </td>
                </tr>
              ) : (
                revenue.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">{r.date}</td>
                    <td className="p-3 text-slate-600">{r.bookingsCount} bookings</td>
                    <td className="p-3 text-right font-extrabold text-emerald-700">
                      {formatCurrency(r.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route-Wise Occupancy */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Route-Wise Occupancy Analysis
          </h2>
          <span className="text-xs text-slate-500">Load factor per corridor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Corridor</th>
                <th className="p-3">Scheduled Trips</th>
                <th className="p-3">Total Seats</th>
                <th className="p-3">Booked Seats</th>
                <th className="p-3 text-right">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Loading occupancy...
                  </td>
                </tr>
              ) : !occupancy || occupancy.routes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No route occupancy data available.
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                occupancy.routes.map((rt: any) => (
                  <tr key={rt.routeId} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">
                      {rt.source} → {rt.destination}
                    </td>
                    <td className="p-3 text-slate-600">{rt.tripsCount} trips</td>
                    <td className="p-3 text-slate-600">{rt.totalSeats}</td>
                    <td className="p-3 font-semibold text-slate-800">{rt.bookedSeats}</td>
                    <td className="p-3 text-right font-black text-slate-900">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          rt.occupancyRate > 50
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {rt.occupancyRate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bus-Wise Occupancy */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bus className="h-4 w-4 text-emerald-600" />
            Fleet Coach Utilization
          </h2>
          <span className="text-xs text-slate-500">Utilization per registered coach</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Coach Name</th>
                <th className="p-3">Registration</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Trips Count</th>
                <th className="p-3">Seats Capacity</th>
                <th className="p-3 text-right">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Loading bus utilization...
                  </td>
                </tr>
              ) : !occupancy || occupancy.buses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No coach utilization data available.
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                occupancy.buses.map((bus: any) => (
                  <tr key={bus.busId} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">{bus.busName}</td>
                    <td className="p-3 font-mono text-slate-600">{bus.registrationNumber}</td>
                    <td className="p-3 text-slate-600">{bus.operatorName}</td>
                    <td className="p-3 text-slate-600">{bus.tripsCount} trips</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {bus.bookedSeats} / {bus.totalSeats}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          bus.occupancyRate > 50
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {bus.occupancyRate}%
                      </span>
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

