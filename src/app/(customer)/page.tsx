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
  { source: "Mumbai", destination: "Pune", price: 850, time: "3h 00m", busType: "Sharma Falcon Volvo" },
  { source: "Bangalore", destination: "Mysore", price: 950, time: "2h 30m", busType: "Patel Star Sleeper" },
  { source: "Chennai", destination: "Coimbatore", price: 500, time: "7h 00m", busType: "Patel Night Rider" },
  { source: "Delhi", destination: "Jaipur", price: 1100, time: "5h 00m", busType: "VRL Mysore King" },
];

const CITIES = [
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

export default function HomePage() {
  const router = useRouter();
  const [source, setSource] = useState("Mumbai");
  const [destination, setDestination] = useState("Pune");
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
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-32">
        {/* Animated ambient gradient backdrops */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/10 to-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-15" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5 mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/90 border border-emerald-500/40 px-4 py-1.5 text-xs font-semibold text-emerald-400 shadow-lg shadow-emerald-950/50 backdrop-blur-md animate-pulse-glow">
              <Sparkles className="h-4 w-4 animate-spin text-emerald-300" style={{ animationDuration: "6s" }} />
              <span className="tracking-wide">India&apos;s Next-Gen Bus Mobility & Real-Time Booking</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              Smarter, Faster, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Stress-Free Bus Travel
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Book guaranteed seats in real time with atomic 5-minute locks. Instant PNR confirmation, live fleet tracking, and instant refunds.
            </p>
          </div>

          {/* Search Box Card */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-white/95 backdrop-blur-xl text-slate-900 p-6 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 transition-all hover:shadow-[0_30px_70px_-15px_rgba(16,185,129,0.25)]">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Origin */}
              <div className="md:col-span-4 space-y-1.5 text-left group">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 transition-transform group-hover:scale-125" />
                  Departure City
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-white hover:border-slate-300 cursor-pointer"
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
                  className="h-11 w-11 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 shadow-sm flex items-center justify-center text-slate-600 transition-all hover:rotate-180 active:scale-90"
                  title="Swap Origin and Destination"
                >
                  ⇄
                </button>
              </div>

              {/* Destination */}
              <div className="md:col-span-4 space-y-1.5 text-left group">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 transition-transform group-hover:scale-125" />
                  Arrival City
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-white hover:border-slate-300 cursor-pointer"
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
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-white hover:border-slate-300 cursor-pointer"
                />
              </div>

              {/* Search Button */}
              <div className="md:col-span-12 pt-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 font-extrabold text-base gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] rounded-xl"
                >
                  <Search className="h-5 w-5 animate-pulse" />
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
              className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-50 rounded-full blur-xl group-hover:scale-150 transition-transform pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                  {route.busType}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2.5 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  {route.source} <span className="text-emerald-500 font-normal">→</span> {route.destination}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  Est. {route.time} journey
                </p>
              </div>

              <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Fares from</span>
                  <p className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">₹{route.price}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all group-hover:scale-110 shadow-sm">
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
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
            <div className="rounded-2xl bg-white p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 space-y-3.5 group">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white shadow-sm">
                <Wifi className="h-7 w-7" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">Gigabit WiFi & Power</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stay plugged-in and productive with individual 230V AC power sockets and high-speed satellite Wi-Fi.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 space-y-3.5 group">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white shadow-sm">
                <Armchair className="h-7 w-7" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">Ergonomic Berths & Recliners</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose between extra-legroom leather recliners or private full-flat sleeper berths with fresh sanitised linen.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 space-y-3.5 group">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white shadow-sm">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">Guaranteed Seat Locks</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our 5-minute atomic database locking engine guarantees zero double bookings or unexpected ticket cancellations.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 space-y-3.5 group">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white shadow-sm">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">Tiered Instant Refunds</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plans changed? Cancel effortlessly from your portal and receive up to 90% instant automated refund directly.
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
              Why 10,00,000+ passengers rely on SwiftTransit every month
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

