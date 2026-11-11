"use client";

import React from "react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Printer, CheckCircle2, ShieldCheck, MapPin, User, Calendar, Clock, QrCode } from "lucide-react";

interface TicketPassenger {
  fullName: string;
  age: number;
  gender: string;
  phone?: string | null;
}

interface TicketSeat {
  tripSeat: {
    seat: {
      seatNumber: string;
      seatType: string;
    };
  };
  fare: number;
}

interface TicketData {
  id: string;
  pnr: string;
  status: string;
  bookingDate: string;
  totalAmount: number;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
  trip: {
    departureDateTime: string;
    arrivalDateTime: string;
    bus: {
      busName: string;
      registrationNumber: string;
      busType: string;
      operator: {
        name: string;
        contactDetails: string;
      };
    };
    route: {
      source: string;
      destination: string;
      distance: number;
    };
  };
  passengers: TicketPassenger[];
  bookingSeats: TicketSeat[];
}

export function TicketCard({ booking }: { booking: TicketData }) {
  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = booking.status === "CONFIRMED";
  const isCancelled = booking.status === "CANCELLED";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          {isConfirmed && <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
          <h2 className="text-xl font-bold text-slate-900">
            {isConfirmed ? "Booking Confirmed!" : "Booking Status: " + booking.status}
          </h2>
        </div>
        <Button onClick={handlePrint} variant="outline" className="gap-2 font-semibold shadow-sm">
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>

      {/* Printable Boarding Ticket */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden printable-ticket">
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">SwiftTransit Pass</h1>
              <p className="text-xs text-slate-400">Official Electronic Boarding Ticket</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Booking PNR
            </span>
            <span className="text-2xl font-mono font-black text-emerald-400 tracking-wider">
              {booking.pnr}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status & Timestamp */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Badge
                variant={isConfirmed ? "default" : isCancelled ? "destructive" : "secondary"}
                className="text-xs px-3 py-1 font-bold"
              >
                STATUS: {booking.status}
              </Badge>
              <span className="text-xs text-slate-500">
                Booked on {formatDate(booking.bookingDate)} at {formatTime(booking.bookingDate)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verified E-Ticket</span>
            </div>
          </div>

          {/* Journey Route & Timing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
            {/* Origin */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Boarding From
              </span>
              <p className="text-2xl font-black text-slate-900">{booking.trip.route.source}</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(booking.trip.departureDateTime)}</span>
              </div>
              <p className="text-xs text-slate-500">{formatDate(booking.trip.departureDateTime)}</p>
            </div>

            {/* Travel Mode */}
            <div className="flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-slate-200 py-4 md:py-0">
              <Bus className="h-6 w-6 text-emerald-600 mb-1" />
              <p className="text-xs font-bold text-slate-800">{booking.trip.bus.busName}</p>
              <p className="text-[11px] text-slate-500">#{booking.trip.bus.registrationNumber}</p>
              <span className="mt-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                {booking.trip.bus.busType.replace(/_/g, " ")}
              </span>
            </div>

            {/* Destination */}
            <div className="space-y-1 text-left md:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Dropping At
              </span>
              <p className="text-2xl font-black text-slate-900">
                {booking.trip.route.destination}
              </p>
              <div className="flex items-center md:justify-end gap-1.5 text-xs font-semibold text-emerald-700">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(booking.trip.arrivalDateTime)}</span>
              </div>
              <p className="text-xs text-slate-500">{formatDate(booking.trip.arrivalDateTime)}</p>
            </div>
          </div>

          {/* Passenger & Assigned Seats Manifest */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Passenger Manifest & Assigned Seats
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Passenger Name</th>
                    <th className="p-3">Age / Gender</th>
                    <th className="p-3">Assigned Seat</th>
                    <th className="p-3 text-right">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.passengers.map((p, idx) => {
                    const seat = booking.bookingSeats[idx]?.tripSeat?.seat;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-800">{p.fullName}</td>
                        <td className="p-3 text-slate-600">
                          {p.age} yrs • {p.gender}
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-black text-xs">
                            {seat?.seatNumber || "N/A"}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-800">
                          {formatCurrency(booking.bookingSeats[idx]?.fare || 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ticket Footer / Fare Summary & QR simulation */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border-2 border-slate-900 p-1 flex items-center justify-center">
                <QrCode className="h-12 w-12 text-slate-900" />
              </div>
              <div className="space-y-0.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Operator: {booking.trip.bus.operator.name}</p>
                <p>Helpline: {booking.trip.bus.operator.contactDetails}</p>
                <p className="text-[11px] text-slate-400">Scan at boarding gate for instant check-in</p>
              </div>
            </div>

            <div className="text-right bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-slate-500 font-medium">Total Paid Fare</span>
              <p className="text-2xl font-black text-emerald-800">
                {formatCurrency(booking.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

