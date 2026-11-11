"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, Search, Filter, Calendar, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BookingItem = any;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPnr, setSearchPnr] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchPnr) params.set("pnr", searchPnr);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const json = await res.json();
      if (json.success) setBookings(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="h-6 w-6 text-emerald-600" />
            Passenger Bookings & PNR Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time database records of all customer ticket purchases and cancellations.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
          <Input
            placeholder="Search by PNR..."
            value={searchPnr}
            onChange={(e) => setSearchPnr(e.target.value)}
            className="h-9 text-xs"
          />
          <Button type="submit" size="sm" className="h-9 font-bold">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">PNR</th>
                <th className="p-3.5">Booking Date</th>
                <th className="p-3.5">Account / Customer</th>
                <th className="p-3.5">Corridor Route</th>
                <th className="p-3.5">Assigned Seats</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">View Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    Loading booking records...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No bookings found matching criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{b.pnr}</td>
                    <td className="p-3.5 text-slate-500">
                      {formatDate(b.bookingDate)} {formatTime(b.bookingDate)}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{b.user?.name}</p>
                      <p className="text-[11px] text-slate-400">{b.user?.email}</p>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {b.trip?.route?.source} → {b.trip?.route?.destination}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-800">
                        {b.bookingSeats?.map((bs: any) => bs.tripSeat?.seat?.seatNumber).join(", ")}
                      </span>
                    </td>
                    <td className="p-3.5 font-extrabold text-slate-900">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={b.status === "CONFIRMED" ? "default" : "destructive"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link href={`/booking/confirmation/${b.pnr}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs font-semibold gap-1">
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          Ticket Pass
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
