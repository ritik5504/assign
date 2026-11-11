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
  { source: "New York", destination: "Boston", price: 48, time: "4h 30m", busType: "Luxury Volvo" },
  { source: "Los Angeles", destination: "San Francisco", price: 75, time: "7h 00m", busType: "Royal Sleeper" },
  { source: "Seattle", destination: "Portland", price: 35, time: "3h 30m", busType: "Sound Runner" },
  { source: "Miami", destination: "Orlando", price: 55, time: "3h 50m", busType: "Sunshine Dreamer" },
];

const CITIES = [
  "New York",
  "Boston",
  "Los Angeles",
  "San Francisco",
  "Seattle",
  "Portland",
  "Chicago",
  "Detroit",
  "Washington DC",
  "Philadelphia",
  "Dallas",
  "Houston",
  "Miami",
  "Orlando",
];

export default function HomePage() {
  const router = useRouter();
  const [source, setSource] = useState("New York");
  const [destination, setDestination] = useState("Boston");
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
              <span>Next-Generation Intercity Mobility</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Smarter, Faster, <br className="hidden sm:inline" />
              <span className="text-emerald-400">Stress-Free Bus Travel</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal">
              Book guaranteed seats in real time. Instant PNR confirmation, live tracking, and guaranteed refund policies.
            </p>
          </div>

          {/* Search Box Card */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-100">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Origin */}
              <div className="md:col-span-4 space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  Departure City
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
                  Arrival City
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
                  Search Available Buses
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
              <span>Trending Connections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Popular Intercity Routes
            </h2>
          </div>
          <Link
            href="/search"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Browse all 10+ active routes <ArrowRight className="h-4 w-4" />
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
                  Est. {route.time} journey
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Fares from</span>
                  <p className="text-xl font-black text-slate-900">${route.price}</p>
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
              Engineered for Ultimate Travel Comfort
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every vehicle in our certified partner network meets rigorous comfort, security, and hygiene benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Wifi className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Gigabit WiFi & Power</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stay plugged-in and productive with individual 110V AC power sockets and high-speed satellite Wi-Fi.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Armchair className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Ergonomic Berths & Recliners</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose between extra-legroom leather recliners or private full-flat sleeper berths with fresh linen.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Guaranteed Seat Locks</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our 5-minute atomic database locking engine guarantees no double bookings or surprise cancellations.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Tiered Instant Refunds</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plans changed? Cancel effortlessly from your portal and receive up to 90% instant refund based on departure.
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
              Why 100,000+ passengers rely on SwiftTransit every month
            </h2>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Zero Double-Bookings:</strong> FAANG-grade transactional concurrency guarantees seat availability truth.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Live Operations Link:</strong> Changes made on passenger portal reflect in real time on the fleet operator dashboard.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Transparent Pricing:</strong> What you see is what you pay. No hidden station fees or surge penalties.
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

