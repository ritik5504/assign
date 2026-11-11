"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { TicketCard } from "@/components/booking/TicketCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket, AlertCircle } from "lucide-react";

export default function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ pnr: string }>;
}) {
  const { pnr } = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/bookings/pnr/${pnr}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setBooking(json.data);
        } else {
          setError(json.error || "Booking not found");
        }
      })
      .catch(() => setError("Failed to fetch ticket"))
      .finally(() => setLoading(false));
  }, [pnr]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-lg mx-auto" />
        <p className="text-xs text-slate-500">Generating verified boarding pass...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{error || "Ticket not found"}</h2>
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between no-print">
        <Link href="/my-bookings">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-600">
            <Ticket className="h-4 w-4" /> View All My Bookings
          </Button>
        </Link>
      </div>

      <TicketCard booking={booking} />
    </div>
  );
}
