"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { User, Phone } from "lucide-react";

export interface PassengerData {
  fullName: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone?: string;
}

interface PassengerFormProps {
  passengers: PassengerData[];
  seatNumbers: string[];
  onChange: (index: number, field: keyof PassengerData, value: string | number) => void;
  errors?: Record<string, string>;
}

export function PassengerForm({
  passengers,
  seatNumbers,
  onChange,
  errors = {},
}: PassengerFormProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-900">Passenger Information</h3>
        <p className="text-xs text-slate-500">
          Enter passenger details matching Aadhaar / Voter ID / Govt ID for conductor verification.
        </p>
      </div>

      <div className="space-y-4">
        {passengers.map((passenger, index) => {
          const seatNum = seatNumbers[index] || `Passenger ${index + 1}`;
          const errPrefix = `passenger_${index}`;

          return (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  Passenger {index + 1}
                </span>
                <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Seat / Berth: {seatNum}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Full name */}
                <div className="sm:col-span-5 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={passenger.fullName}
                    onChange={(e) => onChange(index, "fullName", e.target.value)}
                    className={errors[`${errPrefix}_fullName`] ? "border-rose-500" : ""}
                  />
                  {errors[`${errPrefix}_fullName`] && (
                    <p className="text-[11px] text-rose-500">{errors[`${errPrefix}_fullName`]}</p>
                  )}
                </div>

                {/* Age */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="28"
                    value={passenger.age || ""}
                    onChange={(e) => onChange(index, "age", parseInt(e.target.value, 10) || 0)}
                    className={errors[`${errPrefix}_age`] ? "border-rose-500" : ""}
                  />
                  {errors[`${errPrefix}_age`] && (
                    <p className="text-[11px] text-rose-500">{errors[`${errPrefix}_age`]}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    value={passenger.gender}
                    onChange={(e) =>
                      onChange(index, "gender", e.target.value as PassengerData["gender"])
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Phone */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mobile (+91)</label>
                  <div className="relative">
                    <Input
                      placeholder="+91 98765 43210"
                      value={passenger.phone || ""}
                      onChange={(e) => onChange(index, "phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
