import React from "react";
import Link from "next/link";
import { Bus, ShieldCheck, Clock, Award, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 no-print">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Bus className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">SwiftTransit India</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India&apos;s leading intercity bus mobility platform. Live seat inventory, instantaneous PNR ticket generation, and automated policy refunds across Indian highways.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> 100% Secure
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-emerald-400" /> On-Time Guarantee
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Popular Routes
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/search?source=Delhi&destination=Jaipur" className="hover:text-emerald-400 transition-colors">
                  Delhi → Jaipur Express
                </Link>
              </li>
              <li>
                <Link href="/search?source=Mumbai&destination=Pune" className="hover:text-emerald-400 transition-colors">
                  Mumbai → Pune Expressway
                </Link>
              </li>
              <li>
                <Link href="/search?source=Bengaluru&destination=Chennai" className="hover:text-emerald-400 transition-colors">
                  Bengaluru → Chennai Club Class
                </Link>
              </li>
              <li>
                <Link href="/search?source=Mumbai&destination=Goa" className="hover:text-emerald-400 transition-colors">
                  Mumbai → Goa Royal Sleeper
                </Link>
              </li>
              <li>
                <Link href="/search?source=Delhi&destination=Manali" className="hover:text-emerald-400 transition-colors">
                  Delhi → Manali Volvo Shuttle
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Passenger Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400">Cancellation: &gt;24h (90%), 12-24h (75%)</span>
              </li>
              <li>
                <span className="text-slate-400">Seat Hold Window: 5 Minutes</span>
              </li>
              <li>
                <span className="text-slate-400">Instant Automated E-Ticket & PNR</span>
              </li>
              <li>
                <span className="text-slate-400">GST Invoice & Highway Passenger Insurance</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              India Headquarters
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Barakhamba Road, Connaught Place, New Delhi - 110001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>1800-102-SWIFT (Toll-Free India)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>dispatch@swifttransit.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SwiftTransit Mobility India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Carriage</span>
            <span>Motor Vehicles Act Compliance</span>
            <span>Safety Protocols</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
