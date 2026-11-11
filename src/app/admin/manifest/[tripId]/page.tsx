"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Users, Download, ArrowLeft, Bus, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime, formatDate } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ManifestData = any;

export default function TripManifestPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  const [data, setData] = useState<ManifestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/manifest/${tripId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load manifest");
        }
      })
      .catch(() => setError("Network error loading manifest"))
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleExportCSV = () => {
    window.open(`/api/admin/manifest/${tripId}/export`, "_blank");
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-400">
        Generating passenger manifest...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{error || "Trip not found"}</h2>
        <Link href="/admin/trips">
          <Button variant="outline">Back to Trips</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/trips"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Trips
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            Passenger Manifest
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official boarding manifest for trip <strong className="text-slate-800">{data.source} → {data.destination}</strong>
          </p>
        </div>

        <Button onClick={handleExportCSV} className="gap-2 font-bold shadow-sm">
          <Download className="h-4 w-4" /> Export Manifest (CSV)
        </Button>
      </div>

      {/* Trip metadata badge */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center gap-6 text-xs text-slate-600">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Coach</span>
          <span className="font-bold text-slate-900">{data.busName} (#{data.registrationNumber})</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Operator</span>
          <span className="font-semibold text-slate-800">{data.operatorName}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Departure</span>
          <span className="font-semibold text-emerald-800">
            {formatDate(data.departureDateTime)} at {formatTime(data.departureDateTime)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Confirmed Passengers</span>
          <span className="font-bold text-slate-900">{data.totalPassengers} checked in</span>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Seat No</th>
                <th className="p-3.5">Passenger Legal Name</th>
                <th className="p-3.5">Age / Gender</th>
                <th className="p-3.5">Contact Phone</th>
                <th className="p-3.5">PNR Reference</th>
                <th className="p-3.5 text-right">Booking Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.manifest.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No confirmed passengers for this scheduled trip yet.
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.manifest.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-emerald-700">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {p.seatNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{p.fullName}</td>
                    <td className="p-3.5 text-slate-600">
                      {p.age} yrs • {p.gender}
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">{p.phone}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      <Link href={`/booking/confirmation/${p.pnr}`} className="hover:underline text-emerald-700">
                        {p.pnr}
                      </Link>
                    </td>
                    <td className="p-3.5 text-right text-slate-500">
                      {formatDate(p.bookingDate)}
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
