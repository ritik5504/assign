"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Calendar,
  Clock,
  Bus,
  AlertCircle,
  XCircle,
  ExternalLink,
  Info,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BookingItem = any;

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "CONFIRMED" | "CANCELLED">("ALL");

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.status === 401) {
        router.push("/login?redirect=/my-bookings");
        return;
      }
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBooking) return;
    if (cancelReason.trim().length < 3) {
      setCancelError("Please provide a valid cancellation reason (min 3 characters)");
      return;
    }

    setCancelLoading(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/bookings/${cancellingBooking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationReason: cancelReason }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setCancelError(json.error || "Failed to cancel ticket");
        return;
      }

      alert(
        `Ticket ${cancellingBooking.pnr} has been cancelled. Refund of ${formatCurrency(
          json.data.cancellation.refundAmount
        )} has been processed.`
      );

      setCancellingBooking(null);
      setCancelReason("");
      loadBookings();
    } catch {
      setCancelError("Network error while cancelling ticket");
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "ALL") return true;
    return b.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="h-6 w-6 text-emerald-600" />
            My Bookings & Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your intercity reservations, view boarding passes, and request policy refunds.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          {(["ALL", "CONFIRMED", "CANCELLED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filter === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <Ticket className="h-12 w-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
            <p className="text-xs text-slate-500">
              You haven&apos;t booked any tickets in this category yet.
            </p>
          </div>
          <Link href="/search">
            <Button size="sm">Search & Book a Bus</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === "CONFIRMED";
            const isCancelled = b.status === "CANCELLED";
            const departureTime = new Date(b.trip.departureDateTime);
            const isPast = departureTime < new Date();

            return (
              <div
                key={b.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {b.pnr}
                    </span>
                    <Badge variant={isConfirmed ? "default" : "destructive"}>
                      {b.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Booked {formatDate(b.bookingDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {b.trip.route.source} → {b.trip.route.destination}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(b.trip.departureDateTime)} at {formatTime(b.trip.departureDateTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Bus className="h-3.5 w-3.5 text-slate-400" />
                      {b.trip.bus.busName} (#{b.trip.bus.registrationNumber})
                    </div>
                    <div>
                      Seats:{" "}
                      <strong className="text-slate-800">
                        {b.bookingSeats.map((bs: any) => bs.tripSeat.seat.seatNumber).join(", ")}
                      </strong>
                    </div>
                  </div>

                  {isCancelled && b.cancellation && (
                    <div className="mt-2 text-xs rounded-md bg-rose-50 border border-rose-200 p-2.5 text-rose-800">
                      <strong>Cancelled:</strong> Reason &quot;{b.cancellation.cancellationReason}&quot; •
                      Refund: <strong>{formatCurrency(b.cancellation.refundAmount)}</strong> (Fee:{" "}
                      {formatCurrency(b.cancellation.cancellationAmount)})
                    </div>
                  )}
                </div>

                {/* Pricing & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Total Fare</span>
                    <p className="text-xl font-black text-slate-900">{formatCurrency(b.totalAmount)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/booking/confirmation/${b.pnr}`}>
                      <Button variant="outline" size="sm" className="gap-1 font-semibold">
                        <ExternalLink className="h-3.5 w-3.5" /> Boarding Pass
                      </Button>
                    </Link>

                    {isConfirmed && !isPast && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setCancellingBooking(b);
                          setCancelReason("");
                          setCancelError(null);
                        }}
                      >
                        Cancel Ticket
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal Dialog */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-600" />
                Cancel Reservation #{cancellingBooking.pnr}
              </h3>
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Policy Reminder */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="h-4 w-4 text-blue-600" />
                <span>Tiered Cancellation Refund Rules</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800 text-[11px] pl-1">
                <li>&gt; 24 hrs before departure: <strong>90% refund</strong></li>
                <li>12 - 24 hrs before departure: <strong>75% refund</strong></li>
                <li>6 - 12 hrs before departure: <strong>50% refund</strong></li>
                <li>&lt; 6 hrs: <strong>0% refund</strong></li>
              </ul>
            </div>

            {cancelError && (
              <p className="text-xs font-semibold text-rose-600">{cancelError}</p>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Reason for Cancellation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Change in travel schedule or personal emergency..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancellingBooking(null)}
                >
                  Keep Ticket
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={cancelLoading}
                  className="font-bold"
                >
                  {cancelLoading ? "Processing Refund..." : "Confirm Cancellation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

