"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TripSearchResult } from "@/types";
import { TripCard } from "@/components/booking/TripCard";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ArrowUpDown, Bus, AlertCircle } from "lucide-react";

const POPULAR_INDIAN_CITIES = [
  "Mumbai",
  "Pune",
  "Nashik",
  "Aurangabad",
  "Bangalore",
  "Mysore",
  "Hubli",
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Hyderabad",
  "Vijayawada",
  "Delhi",
  "Jaipur",
  "Agra",
  "Lucknow",
  "Kolkata",
  "Bhubaneswar",
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [source, setSource] = useState(searchParams.get("source") || "");
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [busType, setBusType] = useState(searchParams.get("busType") || "ALL");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "departure");
  const [order, setOrder] = useState(searchParams.get("order") || "asc");

  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state when URL query params change (e.g. user navigates or clicks route from homepage)
  useEffect(() => {
    setSource(searchParams.get("source") || "");
    setDestination(searchParams.get("destination") || "");
    setDate(searchParams.get("date") || "");
    setBusType(searchParams.get("busType") || "ALL");
    setSortBy(searchParams.get("sortBy") || "departure");
    setOrder(searchParams.get("order") || "asc");
  }, [searchParams]);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const qSource = searchParams.get("source") || source;
      const qDest = searchParams.get("destination") || destination;
      const qDate = searchParams.get("date") || date;
      const qBusType = searchParams.get("busType") || busType;
      const qSortBy = searchParams.get("sortBy") || sortBy;
      const qOrder = searchParams.get("order") || order;

      const params = new URLSearchParams();
      if (qSource) params.set("source", qSource);
      if (qDest) params.set("destination", qDest);
      if (qDate) params.set("date", qDate);
      if (qBusType && qBusType !== "ALL") params.set("busType", qBusType);
      params.set("sortBy", qSortBy);
      params.set("order", qOrder);

      const res = await fetch(`/api/trips/search?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setTrips(json.data);
      } else {
        setError(json.error || "Failed to find trips");
      }
    } catch {
      setError("Network or server error while searching buses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, busType, sortBy, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (source) params.set("source", source);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    if (busType && busType !== "ALL") params.set("busType", busType);
    params.set("sortBy", sortBy);
    params.set("order", order);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-600">From</label>
            <input
              type="text"
              list="source-cities"
              placeholder="Source city (e.g. Mumbai)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <datalist id="source-cities">
              {POPULAR_INDIAN_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-600">To</label>
            <input
              type="text"
              list="dest-cities"
              placeholder="Destination city (e.g. Pune)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <datalist id="dest-cities">
              {POPULAR_INDIAN_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-600">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <Button type="submit" className="w-full h-10 font-bold gap-2">
              <Search className="h-4 w-4" />
              Update Search
            </Button>
          </div>
        </form>
      </div>

      {/* Main Results Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                Filters
              </span>
              <button
                type="button"
                onClick={() => {
                  setBusType("ALL");
                  setSortBy("departure");
                  setOrder("asc");
                }}
                className="text-[11px] font-semibold text-emerald-600 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Bus Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bus Type
              </label>
              <div className="space-y-1.5 text-xs text-slate-600">
                {[
                  { label: "All Coach Types", value: "ALL" },
                  { label: "Luxury Volvo", value: "LUXURY_VOLVO" },
                  { label: "AC Sleeper", value: "AC_SLEEPER" },
                  { label: "AC Seater", value: "AC_SEATER" },
                  { label: "Non-AC Sleeper", value: "NON_AC_SLEEPER" },
                  { label: "Non-AC Seater", value: "NON_AC_SEATER" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2 py-1 cursor-pointer hover:text-slate-900"
                  >
                    <input
                      type="radio"
                      name="busType"
                      checked={busType === item.value}
                      onChange={() => setBusType(item.value)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                Sort By
              </label>
              <select
                value={`${sortBy}-${order}`}
                onChange={(e) => {
                  const [newSort, newOrder] = e.target.value.split("-");
                  setSortBy(newSort);
                  setOrder(newOrder);
                }}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="departure-asc">Departure: Earliest First</option>
                <option value="departure-desc">Departure: Latest First</option>
                <option value="price-asc">Price: Lowest to Highest</option>
                <option value="price-desc">Price: Highest to Lowest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {loading ? "Searching buses..." : `${trips.length} Bus${trips.length === 1 ? "" : "es"} Available`}
            </h2>
            <span className="text-xs text-slate-500">Real-time seat verification active</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
              <p className="text-sm font-bold text-rose-900">{error}</p>
              <Button size="sm" variant="outline" onClick={fetchTrips}>
                Retry Search
              </Button>
            </div>
          ) : trips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
              <Bus className="h-12 w-12 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No scheduled trips found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We could not find any buses matching your exact criteria. Try clearing filters or searching for popular routes like Mumbai to Pune.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSource("");
                  setDestination("");
                  setDate("");
                  setBusType("ALL");
                  router.push("/search");
                }}
              >
                Clear All Search Criteria
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-sm text-slate-500">
          Loading Search Engine...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

