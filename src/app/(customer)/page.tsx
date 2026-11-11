"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Search,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Wifi,
  Armchair,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const POPULAR_ROUTES = [
  { source: "Delhi", destination: "Jaipur", price: "₹650", time: "5h 00m", busType: "Garuda Volvo 9600" },
  { source: "Mumbai", destination: "Pune", price: "₹450", time: "3h 00m", busType: "Royal Multi-Axle" },
  { source: "Bengaluru", destination: "Chennai", price: "₹750", time: "6h 00m", busType: "Airavat Club Class" },
  { source: "Mumbai", destination: "Goa", price: "₹1,450", time: "11h 00m", busType: "Grand AC Sleeper" },
];

const CITIES = [
  "Delhi",
  "Jaipur",
  "Bengaluru",
  "Chennai",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Vijayawada",
  "Goa",
  "Ahmedabad",
  "Surat",
  "Manali",
  "Gurugram",
  "Navi Mumbai",
];

export default function HomePage() {
  const router = useRouter();
  const [source, setSource] = useState("Delhi");
  const [destination, setDestination] = useState("Jaipur");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (source) params.set("source", source);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    router.push(`/search?${params.toString()}`);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-28">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>India&apos;s Premium Intercity Smart Bus Network</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Comfortable, Safe, <br className="hidden sm:inline" />
              <span className="text-emerald-400">Intercity Bus Travel across India</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal">
              Book live verified seats with instant PNR generation. Zero double-booking guarantee and up to 90% instant policy refunds.
            </p>
          </div>

          {/* Search Box Card */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-100">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Origin */}
              <div className="md:col-span-4 space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  Leaving From
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="hidden md:flex md:col-span-1 items-center justify-center pt-5">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="h-10 w-10 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-transform active:rotate-180"
                  title="Swap Origin and Destination"
                >
                  ⇄
                </button>
              </div>

              {/* Destination */}
              <div className="md:col-span-4 space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  Going To
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Travel Date */}
              <div className="md:col-span-3 space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  Journey Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Search Button */}
              <div className="md:col-span-12 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 font-bold text-base gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Search className="h-5 w-5" />
                  Search Buses in India
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase">
              <TrendingUp className="h-4 w-4" />
              <span>Trending Indian Corridors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Popular Intercity Routes
            </h2>
          </div>
          <Link
            href="/search"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Browse all 10+ highway routes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_ROUTES.map((route, idx) => (
            <Link
              key={idx}
              href={`/search?source=${encodeURIComponent(route.source)}&destination=${encodeURIComponent(
                route.destination
              )}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {route.busType}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1 group-hover:text-emerald-600 transition-colors">
                  {route.source} → {route.destination}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Approx. {route.time}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Fares from</span>
                  <p className="text-xl font-black text-slate-900">{route.price}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Premium Fleet & Amenities */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Engineered for Ultimate Travel Comfort on Indian Highways
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every Volvo, BharatBenz, and Scania coach in our partner fleet satisfies stringent hygiene, safety, and timing audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Wifi className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">WiFi & Fast Charging</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stay connected with onboard WiFi and personal 230V sockets and USB charging ports on every berth and seat.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Armchair className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">AC Sleepers & Pushback Seats</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose between individual flat sleeper berths with clean linen or ergonomic calf-rest recliners.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Zero Double-Booking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our 5-minute atomic database locking engine guarantees you never lose your selected seat to another passenger.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Instant UPI & Policy Refunds</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plans changed? Cancel seamlessly and receive up to 90% instant simulated refund credited automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 overflow-hidden relative">
          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Why Indian travelers trust SwiftTransit every journey
            </h2>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Live Operations Mirror:</strong> Passenger bookings reflect instantaneously on the operator console and driver manifest.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Transparent Rupee Pricing:</strong> Fixed fares in INR (₹) inclusive of GST and highway toll surcharges.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Safety First:</strong> Live GPS tracking, verified driver rosters, and 24x7 highway helpline.
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="/search">
                <Button size="lg" className="font-bold">
                  Book Your Seat Now
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold">
                  Create Passenger Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
