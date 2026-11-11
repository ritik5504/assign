"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TripSearchResult } from "@/types";
import { formatCurrency, formatTime, formatDate, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Clock, Wifi, Zap, Wind, Coffee, ChevronDown, ChevronUp, MapPin } from "lucide-react";

interface TripCardProps {
  trip: TripSearchResult;
}

export function TripCard({ trip }: TripCardProps) {
  const [showStops, setShowStops] = useState(false);

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("wifi")) return <Wifi className="h-3 w-3" />;
    if (lower.includes("ac") || lower.includes("air")) return <Wind className="h-3 w-3" />;
    if (lower.includes("charging") || lower.includes("power") || lower.includes("usb"))
      return <Zap className="h-3 w-3" />;
    return <Coffee className="h-3 w-3" />;
  };

  const isLowSeats = trip.availableSeatsCount <= 5;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Operator & Bus Details */}
        <div className="space-y-2 lg:w-1/4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-900">{trip.busName}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Operated by <span className="text-slate-800 font-semibold">{trip.operatorName}</span>
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Badge variant="secondary" className="text-[10px] tracking-wide uppercase">
              {trip.busType.replace(/_/g, " ")}
            </Badge>
            <span className="text-[11px] text-slate-400">#{trip.registrationNumber}</span>
          </div>
        </div>

        {/* Schedule & Duration Timeline */}
        <div className="flex-1 flex items-center justify-between gap-4 py-2 border-y lg:border-y-0 lg:border-x border-slate-100 lg:px-6">
          {/* Departure */}
          <div className="text-left">
            <p className="text-lg font-extrabold text-slate-900">
              {formatTime(trip.departureDateTime)}
            </p>
            <p className="text-xs font-semibold text-slate-700">{trip.source}</p>
            <p className="text-[10px] text-slate-400">{formatDate(trip.departureDateTime)}</p>
          </div>

          {/* Duration line */}
          <div className="flex flex-col items-center flex-1 px-4">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>{formatDuration(trip.estimatedDuration)}</span>
            </div>
            <div className="relative w-full my-1.5 flex items-center">
              <div className="h-0.5 w-full bg-slate-200" />
              <div className="absolute left-0 h-2 w-2 rounded-full bg-emerald-500" />
              <div className="absolute right-0 h-2 w-2 rounded-full bg-emerald-600" />
            </div>
            {trip.stops.length > 2 ? (
              <button
                type="button"
                onClick={() => setShowStops(!showStops)}
                className="text-[10px] font-semibold text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                {trip.stops.length - 2} intermediate stop{trip.stops.length > 3 ? "s" : ""}
                {showStops ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            ) : (
              <span className="text-[10px] text-emerald-600 font-medium">Direct Express</span>
            )}
          </div>

          {/* Arrival */}
          <div className="text-right">
            <p className="text-lg font-extrabold text-slate-900">
              {formatTime(trip.arrivalDateTime)}
            </p>
            <p className="text-xs font-semibold text-slate-700">{trip.destination}</p>
            <p className="text-[10px] text-slate-400">{formatDate(trip.arrivalDateTime)}</p>
          </div>
        </div>

        {/* Pricing, Availability and CTA */}
        <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 lg:w-1/4">
          <div className="text-left lg:text-right">
            <span className="text-xs text-slate-400">Starting from</span>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(trip.baseFare)}</p>
            <div className="flex items-center lg:justify-end gap-1 mt-0.5">
              <span
                className={`text-xs font-semibold ${
                  isLowSeats ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {trip.availableSeatsCount} seats left
              </span>
            </div>
          </div>

          <Link href={`/booking/${trip.id}`} className="w-full sm:w-auto">
            <Button
              className="w-full font-bold shadow-md shadow-emerald-700/20"
              disabled={trip.availableSeatsCount === 0}
            >
              {trip.availableSeatsCount === 0 ? "Sold Out" : "Select Seats"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Amenities preview */}
      {trip.amenities && trip.amenities.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Amenities:
          </span>
          {trip.amenities.map((amenity, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 border border-slate-200/60"
            >
              {getAmenityIcon(amenity)}
              {amenity}
            </span>
          ))}
        </div>
      )}

      {/* Intermediate stops collapsible view */}
      {showStops && (
        <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
          <p className="text-xs font-bold text-slate-700">Route Stoppages & Timetable</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {trip.stops.map((stop) => (
              <div key={stop.stopId} className="flex items-start gap-2 text-xs">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">{stop.stopName}</p>
                  <p className="text-[11px] text-slate-500">
                    Arr +{stop.arrivalOffset}m • Dep +{stop.departureOffset}m
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
