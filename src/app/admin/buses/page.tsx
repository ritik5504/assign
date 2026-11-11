"use client";

import React, { useEffect, useState } from "react";
import { Bus, Plus, CheckCircle, AlertCircle, Wrench, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BusItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OperatorItem = any;

export default function BusManagementPage() {
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [operators, setOperators] = useState<OperatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [operatorId, setOperatorId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [busName, setBusName] = useState("");
  const [busType, setBusType] = useState("LUXURY_VOLVO");
  const [totalSeats, setTotalSeats] = useState(36);
  const [amenitiesInput, setAmenitiesInput] = useState("WiFi, AC, Charging Point, Restroom");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [busRes, opRes] = await Promise.all([
        fetch("/api/buses").then((r) => r.json()),
        fetch("/api/operators").then((r) => r.json()),
      ]);

      if (busRes.success) setBuses(busRes.data);
      if (opRes.success) {
        setOperators(opRes.data);
        if (opRes.data.length > 0 && !operatorId) {
          setOperatorId(opRes.data[0].id);
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

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const amenities = amenitiesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorId,
          registrationNumber,
          busName,
          busType,
          totalSeats: Number(totalSeats),
          amenities,
          status: "ACTIVE",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error || "Failed to create bus");
        return;
      }

      setShowAddModal(false);
      setRegistrationNumber("");
      setBusName("");
      loadData();
    } catch {
      setFormError("Network error creating bus");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (busId: string, status: string) => {
    try {
      await fetch(`/api/buses/${busId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bus className="h-6 w-6 text-emerald-600" />
            Fleet & Bus Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure bus models, seat layouts, registration numbers, and operational statuses.
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} className="gap-1.5 font-bold">
          <Plus className="h-4 w-4" /> Add New Bus
        </Button>
      </div>

      {/* Buses Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Registration</th>
                <th className="p-3.5">Bus Name</th>
                <th className="p-3.5">Operator</th>
                <th className="p-3.5">Coach Type</th>
                <th className="p-3.5">Total Seats</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Loading bus inventory...
                  </td>
                </tr>
              ) : buses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No buses configured yet.
                  </td>
                </tr>
              ) : (
                buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {bus.registrationNumber}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{bus.busName}</td>
                    <td className="p-3.5 text-slate-600">{bus.operator.name}</td>
                    <td className="p-3.5">
                      <Badge variant="secondary" className="uppercase text-[10px]">
                        {bus.busType.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{bus.totalSeats} seats</td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          bus.status === "ACTIVE"
                            ? "default"
                            : bus.status === "MAINTENANCE"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {bus.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {bus.status !== "ACTIVE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(bus.id, "ACTIVE")}
                          className="h-7 text-xs text-emerald-700"
                        >
                          Activate
                        </Button>
                      )}
                      {bus.status !== "MAINTENANCE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(bus.id, "MAINTENANCE")}
                          className="h-7 text-xs text-amber-700"
                        >
                          Maintenance
                        </Button>
                      )}
                      {bus.status !== "INACTIVE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(bus.id, "INACTIVE")}
                          className="h-7 text-xs text-rose-700"
                        >
                          Deactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bus Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Bus to Fleet</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <p className="text-xs font-semibold text-rose-600">{formError}</p>
            )}

            <form onSubmit={handleCreateBus} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Assigned Operator</label>
                <select
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold"
                >
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Registration Number</label>
                  <Input
                    required
                    placeholder="US-CA-9021"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Bus Name / Label</label>
                  <Input
                    required
                    placeholder="Pacific Star Liner"
                    value={busName}
                    onChange={(e) => setBusName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Coach Type</label>
                  <select
                    value={busType}
                    onChange={(e) => setBusType(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold"
                  >
                    <option value="LUXURY_VOLVO">Luxury Volvo</option>
                    <option value="AC_SLEEPER">AC Sleeper</option>
                    <option value="AC_SEATER">AC Seater</option>
                    <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
                    <option value="NON_AC_SEATER">Non-AC Seater</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Total Seats</label>
                  <Input
                    type="number"
                    min={10}
                    max={60}
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(parseInt(e.target.value, 10) || 36)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Amenities (comma-separated)</label>
                <Input
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="font-bold">
                  {submitting ? "Configuring Seats & Bus..." : "Save Bus"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

