"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Plus, Clock, Route as RouteIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StopItem = any;

export default function RouteManagementPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [stops, setStops] = useState<StopItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Route Modal
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("280");
  const [estimatedDuration, setEstimatedDuration] = useState("300");
  const [submittingRoute, setSubmittingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // New Stop Modal
  const [showAddStop, setShowAddStop] = useState(false);
  const [stopName, setStopName] = useState("");
  const [stopCity, setStopCity] = useState("");
  const [stopAddress, setStopAddress] = useState("");
  const [submittingStop, setSubmittingStop] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [routesRes, stopsRes] = await Promise.all([
        fetch("/api/routes").then((r) => r.json()),
        fetch("/api/stops").then((r) => r.json()),
      ]);
      if (routesRes.success) setRoutes(routesRes.data);
      if (stopsRes.success) setStops(stopsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRoute(true);
    setRouteError(null);

    try {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          destination,
          distance: parseFloat(distance),
          estimatedDuration: parseInt(estimatedDuration, 10),
          stops: [],
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setRouteError(json.error || "Failed to create route");
        return;
      }

      setShowAddRoute(false);
      setSource("");
      setDestination("");
      loadData();
    } catch {
      setRouteError("Network error creating route");
    } finally {
      setSubmittingRoute(false);
    }
  };

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStop(true);

    try {
      const res = await fetch("/api/stops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: stopName,
          city: stopCity,
          address: stopAddress,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowAddStop(false);
        setStopName("");
        setStopCity("");
        setStopAddress("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingStop(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <RouteIcon className="h-6 w-6 text-emerald-600" />
            Routes & Stoppages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure origin, destination corridors, mileage distance, and intermediate boarding points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAddStop(true)} className="gap-1.5 font-bold">
            <Plus className="h-4 w-4" /> Add Terminal / Stop
          </Button>
          <Button onClick={() => setShowAddRoute(true)} className="gap-1.5 font-bold">
            <Plus className="h-4 w-4" /> Create Route
          </Button>
        </div>
      </div>

      {/* Routes List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Active Route Corridors ({routes.length})
          </span>
          <span className="text-xs text-slate-500">{stops.length} Total Registered Stations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Corridor</th>
                <th className="p-3.5">Distance</th>
                <th className="p-3.5">Estimated Duration</th>
                <th className="p-3.5">Intermediate Stops</th>
                <th className="p-3.5 text-right">Scheduled Trips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Loading routes...
                  </td>
                </tr>
              ) : routes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No routes created.
                  </td>
                </tr>
              ) : (
                routes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span>{r.source}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{r.destination}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{r.distance} km</td>
                    <td className="p-3.5 text-slate-600">
                      {formatDuration(r.estimatedDuration)}
                    </td>
                    <td className="p-3.5">
                      {r.routeStops && r.routeStops.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {r.routeStops.map((rs: any) => (
                            <span
                              key={rs.id}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
                            >
                              {rs.stop.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Direct Non-Stop</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      {r._count?.trips || 0} trips
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Route Modal */}
      {showAddRoute && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Create New Route</h3>
              <button
                type="button"
                onClick={() => setShowAddRoute(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {routeError && <p className="text-xs text-rose-600 font-semibold">{routeError}</p>}

            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Origin City</label>
                  <Input
                    required
                    placeholder="Delhi"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Destination City</label>
                  <Input
                    required
                    placeholder="Jaipur"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Distance (km)</label>
                  <Input
                    type="number"
                    step="0.1"
                    required
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Duration (mins)</label>
                  <Input
                    type="number"
                    required
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddRoute(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submittingRoute} className="font-bold">
                  {submittingRoute ? "Creating..." : "Create Route"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {showAddStop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Terminal / Stop</h3>
              <button
                type="button"
                onClick={() => setShowAddStop(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStop} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Stop Name</label>
                <Input
                  required
                  placeholder="e.g. Hartford Union Station"
                  value={stopName}
                  onChange={(e) => setStopName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">City</label>
                <Input
                  required
                  placeholder="e.g. Hartford"
                  value={stopCity}
                  onChange={(e) => setStopCity(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Address</label>
                <Input
                  required
                  placeholder="e.g. One Union Place, Hartford, CT 06103"
                  value={stopAddress}
                  onChange={(e) => setStopAddress(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddStop(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submittingStop} className="font-bold">
                  {submittingStop ? "Adding..." : "Add Station"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

