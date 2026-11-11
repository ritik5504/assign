"use client";

import React from "react";
import { SeatWithStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Check, Lock, Ban } from "lucide-react";

interface SeatLayoutProps {
  seats: SeatWithStatus[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: SeatWithStatus) => void;
  baseFare: number;
}

export function SeatLayout({
  seats,
  selectedSeatIds,
  onToggleSeat,
  baseFare,
}: SeatLayoutProps) {
  // Check if sleeper or seater
  const isSleeper = seats.some(
    (s) => s.seatType === "UPPER_SLEEPER" || s.seatType === "LOWER_SLEEPER"
  );

  const lowerDeck = seats.filter((s) => s.seatType !== "UPPER_SLEEPER");
  const upperDeck = seats.filter((s) => s.seatType === "UPPER_SLEEPER");

  const renderSeatButton = (seat: SeatWithStatus) => {
    const isSelected = selectedSeatIds.includes(seat.seatId);
    const isBooked = seat.status === "BOOKED";
    const isLocked = seat.status === "LOCKED";
    const isAvailable = seat.status === "AVAILABLE";

    let stateClasses = "border-slate-300 bg-white text-slate-800 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer";
    let icon = null;

    if (isBooked) {
      stateClasses = "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60";
      icon = <Ban className="h-3 w-3 text-slate-400" />;
    } else if (isLocked && !isSelected) {
      stateClasses = "border-amber-300 bg-amber-50 text-amber-700 cursor-not-allowed";
      icon = <Lock className="h-3 w-3 text-amber-600" />;
    } else if (isSelected) {
      stateClasses = "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold";
      icon = <Check className="h-3.5 w-3.5 text-white" />;
    }

    const isWindow = seat.seatType === "WINDOW";
    const isSleeperSeat = seat.seatType === "UPPER_SLEEPER" || seat.seatType === "LOWER_SLEEPER";

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isBooked || (isLocked && !isSelected)}
        onClick={() => onToggleSeat(seat)}
        className={`group relative flex flex-col items-center justify-center rounded-lg border-2 text-xs font-semibold transition-all ${
          isSleeperSeat ? "h-20 w-12" : "h-12 w-12"
        } ${stateClasses}`}
        title={`Seat ${seat.seatNumber} (${seat.seatType}) - ${formatCurrency(baseFare)}`}
      >
        <span className="text-[11px] font-bold">{seat.seatNumber}</span>
        {icon}
        {isWindow && !isSelected && !isBooked && (
          <span className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-blue-500" title="Window Seat" />
        )}
      </button>
    );
  };

  const renderDeckGrid = (deckSeats: SeatWithStatus[], title: string) => {
    // Group by row
    const rowMap = new Map<number, SeatWithStatus[]>();
    for (const seat of deckSeats) {
      const list = rowMap.get(seat.row) || [];
      list.push(seat);
      rowMap.set(seat.row, list);
    }
    const rows = Array.from(rowMap.keys()).sort((a, b) => a - b);

    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {title}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Front</span>
            <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">
              ☸
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((rowNum) => {
            const seatsInRow = (rowMap.get(rowNum) || []).sort((a, b) => a.column - b.column);
            return (
              <div key={rowNum} className="flex items-center justify-center gap-3">
                {seatsInRow.map((seat, index) => (
                  <React.Fragment key={seat.id}>
                    {/* Add aisle gap between column 2 and 3 in standard 2+2 layout */}
                    {index === 2 && !isSleeper && <div className="w-6" />}
                    {index === 1 && isSleeper && <div className="w-6" />}
                    {renderSeatButton(seat)}
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-slate-300 bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-emerald-600 bg-emerald-600 flex items-center justify-center text-white">
            <Check className="h-3 w-3" />
          </div>
          <span className="font-medium text-emerald-800">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-amber-300 bg-amber-50 flex items-center justify-center">
            <Lock className="h-3 w-3 text-amber-600" />
          </div>
          <span>Locked (in checkout)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
            <Ban className="h-3 w-3" />
          </div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span>Window Seat</span>
        </div>
      </div>

      {/* Decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {isSleeper ? (
          <>
            {renderDeckGrid(lowerDeck, "Lower Berth Deck")}
            {renderDeckGrid(upperDeck, "Upper Berth Deck")}
          </>
        ) : (
          <div className="col-span-full max-w-sm mx-auto w-full">
            {renderDeckGrid(seats, "Passenger Cabin")}
          </div>
        )}
      </div>

      {/* Dynamic Summary Bar */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">Selected Seats ({selectedSeatIds.length})</p>
          <div className="flex items-center gap-2 mt-0.5">
            {selectedSeatIds.length > 0 ? (
              seats
                .filter((s) => selectedSeatIds.includes(s.seatId))
                .map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-xs"
                  >
                    {s.seatNumber}
                  </span>
                ))
            ) : (
              <span className="text-xs text-slate-400 italic">No seats selected yet</span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">Total Calculated Fare</p>
          <p className="text-xl font-extrabold text-emerald-700">
            {formatCurrency(selectedSeatIds.length * baseFare)}
          </p>
        </div>
      </div>
    </div>
  );
}

