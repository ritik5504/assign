"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { SeatLayout } from "@/components/booking/SeatLayout";
import { PassengerForm, PassengerData } from "@/components/booking/PassengerForm";
import { SeatWithStatus, SessionUser } from "@/types";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Bus,
  ArrowLeft,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface TripSeatResponse {
  tripId: string;
  busName: string;
  busType: string;
  totalSeats: number;
  baseFare: number;
  departureDateTime: string;
  arrivalDateTime: string;
  source: string;
  destination: string;
  seats: SeatWithStatus[];
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  const router = useRouter();

  const [tripData, setTripData] = useState<TripSeatResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Flow Steps: 1 = Seat Selection, 2 = Passenger Details & Checkout
  const [step, setStep] = useState<1 | 2>(1);

  // Selected Seats
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Lock State & Timer
  const [lockExpiresAt, setLockExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [lockingLoading, setLockingLoading] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Fetch Current User
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data?.user) {
          setCurrentUser(data.data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Trip Seats
  const loadSeats = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/seats`);
      const json = await res.json();
      if (json.success) {
        setTripData(json.data);
      } else {
        setError(json.error || "Failed to load seat layout");
      }
    } catch {
      setError("Network error loading trip seats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  // Lock countdown timer
  useEffect(() => {
    if (!lockExpiresAt) return;

    const interval = setInterval(() => {
      const diffMs = lockExpiresAt.getTime() - Date.now();
      if (diffMs <= 0) {
        setTimeLeft("0:00");
        clearInterval(interval);
        alert("Your temporary seat reservation has expired. Please select seats again.");
        setLockExpiresAt(null);
        setStep(1);
        loadSeats();
      } else {
        const totalSecs = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setTimeLeft(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const handleToggleSeat = (seat: SeatWithStatus) => {
    if (selectedSeatIds.includes(seat.seatId)) {
      // Remove
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.seatId));
      setPassengers((prev) => prev.slice(0, prev.length - 1));
    } else {
      // Max 6 seats
      if (selectedSeatIds.length >= 6) {
        alert("You can select a maximum of 6 seats per booking.");
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.seatId]);
      setPassengers((prev) => [
        ...prev,
        {
          fullName: prev.length === 0 && currentUser ? currentUser.name : "",
          age: 30,
          gender: "MALE",
          phone: currentUser?.phone || "",
        },
      ]);
    }
  };

  const handleProceedToPassengers = async () => {
    if (!currentUser) {
      alert("Please sign in or register to complete your booking.");
      router.push(`/login?redirect=/booking/${tripId}`);
      return;
    }

    if (selectedSeatIds.length === 0) {
      alert("Please select at least one seat to proceed.");
      return;
    }

    setLockingLoading(true);
    setError(null);

    try {
      // Attempt backend atomic lock on seats
      const res = await fetch(`/api/trips/${tripId}/seats/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatIds: selectedSeatIds }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Selected seats are no longer available. Refreshing layout...");
        await loadSeats();
        return;
      }

      setLockExpiresAt(new Date(json.data.expiresAt));
      setStep(2);
    } catch {
      setError("Failed to reserve seats. Please try again.");
    } finally {
      setLockingLoading(false);
    }
  };

  const handlePassengerChange = (
    index: number,
    field: keyof PassengerData,
    value: string | number
  ) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validatePassengers = (): boolean => {
    const errs: Record<string, string> = {};
    passengers.forEach((p, idx) => {
      if (!p.fullName || p.fullName.trim().length < 2) {
        errs[`passenger_${idx}_fullName`] = "Full name is required (min 2 chars)";
      }
      if (!p.age || p.age < 1 || p.age > 120) {
        errs[`passenger_${idx}_age`] = "Valid age between 1-120 is required";
      }
    });
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmBooking = async () => {
    if (!validatePassengers()) {
      return;
    }

    setSubmittingBooking(true);
    setError(null);

    try {
      const idempotencyKey = `bk_${tripId}_${selectedSeatIds.sort().join("_")}_${Date.now()}`;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          seatIds: selectedSeatIds,
          passengers,
          idempotencyKey,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Booking could not be confirmed.");
        if (json.error?.includes("CONCURRENCY") || json.error?.includes("BOOKED")) {
          // Re-load layout
          await loadSeats();
          setStep(1);
        }
        return;
      }

      // Success! Redirect to official PNR boarding confirmation
      const confirmedPNR = json.data.pnr;
      router.push(`/booking/confirmation/${confirmedPNR}`);
    } catch {
      setError("An unexpected network error occurred while confirming booking.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg mx-auto" />
        <p className="text-xs text-slate-500">Checking live seat inventory and bus layout...</p>
      </div>
    );
  }

  if (error && !tripData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{error}</h2>
        <Button onClick={() => router.push("/search")}>Back to Trip Search</Button>
      </div>
    );
  }

  if (!tripData) return null;

  const selectedSeatNumbers = tripData.seats
    .filter((s) => selectedSeatIds.includes(s.seatId))
    .map((s) => s.seatNumber);

  const totalFare = selectedSeatIds.length * tripData.baseFare;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Trip Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">
              {tripData.source} → {tripData.destination}
            </h1>
            <Badge variant="secondary" className="uppercase text-[10px]">
              {tripData.busType.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Coach: <strong className="text-slate-800">{tripData.busName}</strong> • Departure:{" "}
            <strong className="text-slate-800">{formatDate(tripData.departureDateTime)}</strong> at{" "}
            <strong className="text-emerald-700">{formatTime(tripData.departureDateTime)}</strong>
          </p>
        </div>

        {/* Lock Timer Banner when in Step 2 */}
        {step === 2 && lockExpiresAt && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-amber-900">
            <Clock className="h-4 w-4 text-amber-600 animate-spin" />
            <div className="text-xs">
              <span className="font-bold">Seats Reserved: </span>
              <span className="font-mono font-bold text-amber-800 text-sm">{timeLeft}</span>
              <span className="text-[11px] text-amber-700 block">Complete payment before timer expires</span>
            </div>
          </div>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-8 border-b border-slate-200 pb-4">
        <div className={`flex items-center gap-2 text-sm font-bold ${step === 1 ? "text-emerald-600" : "text-slate-400"}`}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
            1
          </div>
          <span>Select Seats</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />
        <div className={`flex items-center gap-2 text-sm font-bold ${step === 2 ? "text-emerald-600" : "text-slate-400"}`}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
            2
          </div>
          <span>Passenger Details & Checkout</span>
        </div>
      </div>

      {/* Step 1: Seat Layout */}
      {step === 1 && (
        <div className="space-y-6">
          <SeatLayout
            seats={tripData.seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
            baseFare={tripData.baseFare}
          />

          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              onClick={handleProceedToPassengers}
              disabled={selectedSeatIds.length === 0 || lockingLoading}
              className="gap-2 font-bold px-8"
            >
              <Lock className="h-4 w-4" />
              {lockingLoading ? "Holding seats..." : `Reserve ${selectedSeatIds.length} Seat(s) & Continue`}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Passenger Details and Checkout */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <PassengerForm
              passengers={passengers}
              seatNumbers={selectedSeatNumbers}
              onChange={handlePassengerChange}
              errors={validationErrors}
            />

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="gap-1 text-slate-600"
              >
                <ArrowLeft className="h-4 w-4" /> Change Seat Selection
              </Button>
            </div>
          </div>

          {/* Checkout Fare Breakdown Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Fare Breakdown
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Fare ({selectedSeatIds.length} × {formatCurrency(tripData.baseFare)})</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(totalFare)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & Station Utility</span>
                  <span className="font-semibold text-emerald-700">INCLUDED</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Instant PNR Generation</span>
                  <span className="font-semibold text-emerald-700">FREE</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">{formatCurrency(totalFare)}</span>
                </div>
              </div>

              {/* Simulated Payment Notice */}
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Simulated Instant Payment</span>
                </div>
                <p>
                  No real card required. Clicking below executes an atomic database transaction to generate your confirmed PNR ticket immediately.
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleConfirmBooking}
                disabled={submittingBooking}
                className="w-full font-bold shadow-lg shadow-emerald-700/20"
              >
                {submittingBooking ? "Confirming Booking..." : `Pay ${formatCurrency(totalFare)} & Book Ticket`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

