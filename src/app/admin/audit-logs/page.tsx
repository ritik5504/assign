"use client";

import React, { useEffect, useState } from "react";
import { FileText, Shield, Clock, User } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuditLogItem = any;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setLogs(json.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-600" />
          System Audit Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit trail of critical administrative, operational, and financial transactions.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Metadata Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 font-sans">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {log.user ? (
                        <span>
                          {log.user.name} ({log.user.role})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">SYSTEM</span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-800">
                      {log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ""}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate" title={log.metadata}>
                      {log.metadata}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
