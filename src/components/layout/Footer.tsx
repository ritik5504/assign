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
              <span className="text-xl font-bold tracking-tight text-white">SwiftTransit</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enterprise-grade intercity bus booking platform. Real-time seat inventory, instantaneous PNR generation, and flexible refunds.
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
              Explore Routes
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/search?source=Mumbai&destination=Pune" className="hover:text-emerald-400 transition-colors">
                  Mumbai → Pune Express
                </Link>
              </li>
              <li>
                <Link href="/search?source=Bangalore&destination=Mysore" className="hover:text-emerald-400 transition-colors">
                  Bangalore → Mysore Shuttle
                </Link>
              </li>
              <li>
                <Link href="/search?source=Chennai&destination=Coimbatore" className="hover:text-emerald-400 transition-colors">
                  Chennai → Coimbatore Cruiser
                </Link>
              </li>
              <li>
                <Link href="/search?source=Delhi&destination=Jaipur" className="hover:text-emerald-400 transition-colors">
                  Delhi → Jaipur Express
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400">Cancellation Policy: &gt;24h (90%), 12-24h (75%)</span>
              </li>
              <li>
                <span className="text-slate-400">Seat Lock Time: 5 Minutes Window</span>
              </li>
              <li>
                <span className="text-slate-400">Instant Automated E-Ticket & PNR</span>
              </li>
              <li>
                <span className="text-slate-400">24/7 Roadside Passenger Support</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Headquarters
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>No. 1, MG Road, Bengaluru - 560001, Karnataka, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>1800-123-4567 (Toll-Free)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>dispatch@swifttransit.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SwiftTransit Systems Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Carriage</span>
            <span>Safety Guidelines</span>
            <span>Operator Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

