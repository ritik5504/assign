"use client";

import React, { useEffect, useState } from "react";
import { Building2, Plus, Phone, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OperatorItem = any;

export default function OperatorManagementPage() {
  const [operators, setOperators] = useState<OperatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOperators = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/operators");
      const json = await res.json();
      if (json.success) setOperators(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contactDetails, status: "ACTIVE" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to create operator");
        return;
      }

      setShowAddModal(false);
      setName("");
      setContactDetails("");
      loadOperators();
    } catch {
      setError("Network error creating operator");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600" />
            Bus Operators & Transit Agencies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered franchise operators and coach dispatch companies.
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} className="gap-1.5 font-bold">
          <Plus className="h-4 w-4" /> Add Operator
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Loading operators...
          </div>
        ) : operators.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            No operators found.
          </div>
        ) : (
          operators.map((op) => (
            <div
              key={op.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">{op.name}</h3>
                <Badge variant={op.status === "ACTIVE" ? "default" : "destructive"}>
                  {op.status}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Contact & Support:</p>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                  {op.contactDetails}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Assigned Fleet:</span>
                <span className="font-bold text-slate-800">
                  {op.buses?.length || 0} coaches
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Bus Operator</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

            <form onSubmit={handleCreateOperator} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Company / Operator Name</label>
                <Input
                  required
                  placeholder="e.g. Zenith Intercity Coaches"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Contact Details & Phone</label>
                <Input
                  required
                  placeholder="e.g. support@zenith.com | +1-800-555-0199"
                  value={contactDetails}
                  onChange={(e) => setContactDetails(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="font-bold">
                  {submitting ? "Adding..." : "Add Operator"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
