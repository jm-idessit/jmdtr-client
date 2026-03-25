"use client";

import {
  Users,
  Clock,
  Search,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Coffee,
  TrendingUp,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { getAllAttendance } from "@/services/attendanceApi";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BreakRecord {
  start?: string;
  end?: string;
  isAutomatic?: boolean;
}
interface EmployeeInfo {
  _id: string;
  employeeId?: string;
  name?: string;
  department?: string;
  position?: string;
  email?: string;
}
interface AttendanceRecord {
  _id: string;
  date: string;
  employeeId: EmployeeInfo;
  clockIn?: { time?: string; isAutomatic?: boolean };
  clockOut?: { time?: string; isAutomatic?: boolean };
  breaks?: { morning?: BreakRecord; lunch?: BreakRecord; afternoon?: BreakRecord };
  totalWorkMinutes?: number;
  lateMinutes?: number;
  undertimeMinutes?: number;
}

// ─── Formatting helpers ────────────────────────────────────────────────────────
const fmtTime = (iso?: string): string => {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
};

const fmtMinutes = (mins: number): string => {
  if (!mins && mins !== 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const fmtDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const [y, mo, d] = dateStr.split("-");
  return new Date(Date.UTC(+y, +mo - 1, +d)).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

const breakDuration = (brk?: BreakRecord): number => {
  if (!brk?.start || !brk?.end) return 0;
  return Math.round((new Date(brk.end).getTime() - new Date(brk.start).getTime()) / 60000);
};

const totalBreakMin = (r: AttendanceRecord): number =>
  breakDuration(r.breaks?.morning) +
  breakDuration(r.breaks?.lunch) +
  breakDuration(r.breaks?.afternoon);

// ─── Status helpers ────────────────────────────────────────────────────────────
const getStatusBadge = (r: AttendanceRecord) => {
  if (!r.clockIn?.time) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
        <XCircle className="w-3 h-3" /> Absent
      </span>
    );
  }
  if ((r.lateMinutes ?? 0) > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
        <AlertCircle className="w-3 h-3" /> Late
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
      <CheckCircle className="w-3 h-3" /> Present
    </span>
  );
};

// ─── Get Monday of current week ────────────────────────────────────────────────
const getCurrentWeekMonday = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - ((dayOfWeek + 6) % 7);
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().slice(0, 10);
};

const initials = (name?: string): string =>
  name
    ? name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

// ═════════════════════════════════════════════════════════════════════════════
export default function EmployerDashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [weekFilter, setWeekFilter] = useState(getCurrentWeekMonday());
  const [filterMode, setFilterMode] = useState<"week" | "day" | "all">("week");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filterMode === "day" && dateFilter) params.date = dateFilter;
      if (filterMode === "week" && weekFilter) params.weekStart = weekFilter;
      const data = await getAllAttendance(params);
      setRecords(data.records || []);
    } catch {
      setError("Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  }, [filterMode, dateFilter, weekFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Client-side search filter
  const filtered = records.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const emp = r.employeeId;
    return (
      emp?.name?.toLowerCase().includes(q) ||
      emp?.employeeId?.toLowerCase().includes(q) ||
      emp?.department?.toLowerCase().includes(q)
    );
  });

  // ─── Aggregate stats ─────────────────────────────────────────────────────
  const totalPresent = filtered.filter((r) => r.clockIn?.time).length;
  const totalLate = filtered.filter((r) => (r.lateMinutes ?? 0) > 0).length;
  const totalWorkMinutes = filtered.reduce((s, r) => s + (r.totalWorkMinutes ?? 0), 0);
  const presentCount = filtered.filter((r) => r.clockIn?.time).length;
  // Fixed operator precedence: divide by (presentCount || 1) before rounding
  const avgWorkMinutes = presentCount > 0 ? Math.round(totalWorkMinutes / presentCount) : 0;

  return (
    <div className="min-h-screen mx-auto p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitor and review employee time records</p>
          </div>
          <Button onClick={fetchRecords} variant="outline" className="gap-2 self-start sm:self-auto">
            <Clock className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Records Found</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">{filtered.length}</p>
                </div>
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Present</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600">{totalPresent}</p>
                </div>
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Late Arrivals</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-600">{totalLate}</p>
                </div>
                <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Avg Work Hours</p>
                  <p className="text-2xl font-bold mt-1 text-purple-600">{fmtMinutes(avgWorkMinutes)}</p>
                </div>
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Mode toggle */}
              <div className="flex rounded-lg overflow-hidden border">
                {(["week", "day", "all"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setFilterMode(key)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors
                      ${filterMode === key
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {filterMode === "week" && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 font-medium">Week of</label>
                  <input
                    type="date"
                    value={weekFilter}
                    onChange={(e) => setWeekFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              )}
              {filterMode === "day" && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 font-medium">Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              )}

              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, ID, or department…"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button onClick={fetchRecords} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Search className="w-4 h-4" /> Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Main Table ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-blue-500" />
              Attendance Records
              <span className="ml-auto text-sm text-gray-400 font-normal">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16 text-gray-400">
                <Timer className="w-10 h-10 mx-auto mb-2 opacity-30 animate-spin" />
                <p>Loading records…</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-400">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No records match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {[
                        "Employee", "Date", "Clock In", "Clock Out",
                        "Breaks", "Work Hours", "Late", "Undertime", "Status", "Auto?"
                      ].map((h) => (
                        <th
                          key={h}
                          className="py-2.5 px-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const emp = r.employeeId;
                      const totalBreaks = totalBreakMin(r);
                      const isAutoCI = r.clockIn?.isAutomatic;
                      const isAutoCO = r.clockOut?.isAutomatic;
                      return (
                        <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50">
                          {/* Employee */}
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {initials(emp?.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 truncate">{emp?.name || "Unknown"}</div>
                                <div className="text-xs text-gray-400">{emp?.employeeId} · {emp?.department}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-2 whitespace-nowrap text-gray-700">{fmtDate(r.date)}</td>

                          <td className="py-3 px-2 font-mono text-gray-700 whitespace-nowrap">
                            {fmtTime(r.clockIn?.time)}
                          </td>

                          <td className="py-3 px-2 font-mono text-gray-700 whitespace-nowrap">
                            {fmtTime(r.clockOut?.time)}
                          </td>

                          {/* Breaks */}
                          <td className="py-3 px-2 text-xs text-gray-600 whitespace-nowrap">
                            {totalBreaks > 0 ? (
                              <div className="space-y-0.5">
                                {(["morning", "lunch", "afternoon"] as const).map((k) => {
                                  const dur = breakDuration(r.breaks?.[k]);
                                  if (!dur) return null;
                                  return (
                                    <div key={k} className="flex items-center gap-1">
                                      <Coffee className="w-3 h-3 text-orange-400" />
                                      <span className="capitalize">{k}: {dur}m</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="py-3 px-2 font-semibold text-blue-700 whitespace-nowrap">
                            {fmtMinutes(r.totalWorkMinutes ?? 0)}
                          </td>

                          <td className="py-3 px-2 whitespace-nowrap">
                            {(r.lateMinutes ?? 0) > 0 ? (
                              <span className="text-yellow-600 font-mono">{r.lateMinutes}m</span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="py-3 px-2 whitespace-nowrap">
                            {(r.undertimeMinutes ?? 0) > 0 ? (
                              <span className="text-red-500 font-mono">{r.undertimeMinutes}m</span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="py-3 px-2">{getStatusBadge(r)}</td>

                          <td className="py-3 px-2 text-xs text-gray-500 whitespace-nowrap">
                            {(isAutoCI || isAutoCO) ? (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full">
                                {[isAutoCI && "CI", isAutoCO && "CO"].filter(Boolean).join(" & ")}
                              </span>
                            ) : (
                              <span className="text-gray-300">manual</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals footer */}
                  {filtered.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 bg-gray-50 font-semibold text-sm">
                        <td colSpan={5} className="py-3 px-2 text-gray-600">
                          Totals for {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                        </td>
                        <td className="py-3 px-2 text-blue-700">{fmtMinutes(totalWorkMinutes)}</td>
                        <td className="py-3 px-2 text-yellow-600">
                          {filtered.reduce((s, r) => s + (r.lateMinutes ?? 0), 0) > 0
                            ? `${filtered.reduce((s, r) => s + (r.lateMinutes ?? 0), 0)}m`
                            : "—"}
                        </td>
                        <td className="py-3 px-2 text-red-500">
                          {filtered.reduce((s, r) => s + (r.undertimeMinutes ?? 0), 0) > 0
                            ? `${filtered.reduce((s, r) => s + (r.undertimeMinutes ?? 0), 0)}m`
                            : "—"}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
