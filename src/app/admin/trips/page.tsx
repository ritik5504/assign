"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Plus, Bus, Clock, Users, FileSpreadsheet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TripItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BusItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteItem = any;

export default function TripManagementPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Trip Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [departureDateTime, setDepartureDateTime] = useState("");
  const [arrivalDateTime, setArrivalDateTime] = useState("");
  const [baseFare, setBaseFare] = useState("45");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tripsRes, busesRes, routesRes] = await Promise.all([
        fetch("/api/trips").then((r) => r.json()),
        fetch("/api/buses").then((r) => r.json()),
        fetch("/api/routes").then((r) => r.json()),
      ]);

      if (tripsRes.success) setTrips(tripsRes.data);
      if (busesRes.success) {
        setBuses(busesRes.data);
        if (busesRes.data.length > 0 && !selectedBusId) {
          setSelectedBusId(busesRes.data[0].id);
        }
      }
      if (routesRes.success) {
        setRoutes(routesRes.data);
        if (routesRes.data.length > 0 && !selectedRouteId) {
          setSelectedRouteId(routesRes.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScheduleTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: selectedBusId,
          routeId: selectedRouteId,
          departureDateTime: new Date(departureDateTime).toISOString(),
          arrivalDateTime: new Date(arrivalDateTime).toISOString(),
          baseFare: parseFloat(baseFare),
          status: "SCHEDULED",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to schedule trip");
        return;
      }

      setShowAddModal(false);
      loadData();
    } catch {
      setError("Network error scheduling trip");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-emerald-600" />
            Trip Schedules & Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch fleet coaches to routes, set departure timetables, and monitor real-time passenger manifests.
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} className="gap-1.5 font-bold">
          <Plus className="h-4 w-4" /> Schedule New Trip
        </Button>
      </div>

      {/* Trips Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Corridor Route</th>
                <th className="p-3.5">Coach & Operator</th>
                <th className="p-3.5">Departure</th>
                <th className="p-3.5">Arrival</th>
                <th className="p-3.5">Base Fare</th>
                <th className="p-3.5">Seat Occupancy</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Manifest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    Loading trip schedules...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No trips scheduled yet.
                  </td>
                </tr>
              ) : (
                trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span>{t.route.source}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{t.route.destination}</span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{t.bus.busName}</p>
                      <p className="text-[11px] text-slate-500">
                        #{t.bus.registrationNumber} • {t.bus.operator?.name}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-emerald-800">{formatTime(t.departureDateTime)}</p>
                      <p className="text-[11px] text-slate-500">{formatDate(t.departureDateTime)}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{formatTime(t.arrivalDateTime)}</p>
                      <p className="text-[11px] text-slate-500">{formatDate(t.arrivalDateTime)}</p>
                    </td>
                    <td className="p-3.5 font-extrabold text-slate-900">
                      {formatCurrency(t.baseFare)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {t.bookedSeats} / {t.totalSeats}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-bold">
                          ({t.availableSeats} available)
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={t.status === "SCHEDULED" ? "default" : "secondary"}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link href={`/admin/manifest/${t.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs font-semibold gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          View Manifest
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

      {/* Schedule Trip Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Schedule Trip & Initialize Seats</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

            <form onSubmit={handleScheduleTrip} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Assign Coach</label>
                  <select
                    value={selectedBusId}
                    onChange={(e) => setSelectedBusId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold"
                  >
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.busName} ({b.registrationNumber}) - {b.totalSeats}s
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Assign Route</label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.source} → {r.destination} ({r.distance}km)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Departure Date & Time</label>
                  <Input
                    type="datetime-local"
                    required
                    value={departureDateTime}
                    onChange={(e) => setDepartureDateTime(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Arrival Date & Time</label>
                  <Input
                    type="datetime-local"
                    required
                    value={arrivalDateTime}
                    onChange={(e) => setArrivalDateTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Base Fare ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={baseFare}
                  onChange={(e) => setBaseFare(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="font-bold">
                  {submitting ? "Initializing inventory..." : "Schedule Trip"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

