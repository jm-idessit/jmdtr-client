"use client";

import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Coffee,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { getWeeklyAttendance } from "@/services/attendanceApi";

interface BreakRecord {
  start?: string;
  end?: string;
  isAutomatic?: boolean;
}
interface AttendanceRecord {
  _id: string;
  date: string;
  clockIn?: { time?: string; isAutomatic?: boolean };
  clockOut?: { time?: string; isAutomatic?: boolean };
  breaks?: { morning?: BreakRecord; lunch?: BreakRecord; afternoon?: BreakRecord };
  totalWorkMinutes?: number;
  lateMinutes?: number;
  undertimeMinutes?: number;
}
interface WeeklyData {
  records: AttendanceRecord[];
  totalWorkMinutes: number;
  weekStart: string;
  weekEnd: string;
}
// ─── Formatting helpers ────────────────────────────────────────────────────────
const fmtTime = (iso: string | undefined): string => {
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

const fmtDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return new Date(Date.UTC(+y, +m - 1, +d)).toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

const fmtDateShort = (dateStr: string): string => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return new Date(Date.UTC(+y, +m - 1, +d)).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

const breakDuration = (brk: BreakRecord | undefined): number => {
  if (!brk?.start || !brk?.end) return 0;
  return Math.round((new Date(brk.end).getTime() - new Date(brk.start).getTime()) / 60000);
};

export default function EmployeeRecordsPage() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeekly = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getWeeklyAttendance();
      setWeeklyData(data);
    } catch {
      setError("Failed to load weekly records. Please try again." as const);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeekly();
  }, [fetchWeekly]);

  const records = weeklyData?.records as AttendanceRecord[] || [];
  const totalWorkMinutes = weeklyData?.totalWorkMinutes || 0;
  const weekStart = weeklyData?.weekStart;
  const weekEnd = weeklyData?.weekEnd;

  const totalBreakMinutes = records.reduce((sum, r) => {
    return (
      sum +
      breakDuration(r.breaks?.morning) +
      breakDuration(r.breaks?.lunch) +
      breakDuration(r.breaks?.afternoon)
    );
  }, 0);

  const totalLateMinutes = records.reduce((s, r) => s + (r.lateMinutes || 0), 0);
  const totalUndertimeMinutes = records.reduce((s, r) => s + (r.undertimeMinutes || 0), 0);
  const daysPresent = records.filter((r) => r.clockIn?.time).length;
  const daysLate = records.filter((r) => r.lateMinutes && r.lateMinutes > 0).length;

  return (
    <div className="min-h-screen mx-auto p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Weekly Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {weekStart && weekEnd
              ? `Week of ${fmtDateShort(weekStart)} – ${fmtDateShort(weekEnd)}`
              : "Loading…"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Work Hours", value: fmtMinutes(totalWorkMinutes), icon: Clock, color: "blue" },
            { label: "Days Present", value: daysPresent, icon: CheckCircle, color: "emerald" },
            { label: "Days Late", value: daysLate, icon: AlertCircle, color: "yellow" },
            { label: "Total Breaks", value: fmtMinutes(totalBreakMinutes), icon: Coffee, color: "orange" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                    <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
                  </div>
                  <div className={`w-9 h-9 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-purple-500" />
              Daily Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <Timer className="w-10 h-10 mx-auto mb-2 opacity-30 animate-spin" />
                <p>Loading records…</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No records found for this week.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {[
                        "Date", "Clock In", "Clock Out",
                        "Morning Brk", "Lunch Brk", "Aftn Brk",
                        "Work Hours", "Late", "Undertime", "Status"
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
                    {records.map((r) => {
                      const isLate = r.lateMinutes && r.lateMinutes > 0;
                      const hasClockIn = !!r.clockIn?.time;
                      const isClosed = !!r.clockOut?.time;
                      return (
                        <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium whitespace-nowrap">{fmtDate(r.date)}</td>
                          <td className="py-3 px-2 font-mono text-gray-700">
                            {fmtTime(r.clockIn?.time)}
                            {r.clockIn?.isAutomatic && (
                              <span className="ml-1 text-xs text-blue-400">(auto)</span>
                            )}
                          </td>
                          <td className="py-3 px-2 font-mono text-gray-700">
                            {fmtTime(r.clockOut?.time)}
                            {r.clockOut?.isAutomatic && (
                              <span className="ml-1 text-xs text-blue-400">(auto)</span>
                            )}
                          </td>
                          {["morning", "lunch", "afternoon"].map((k) => {
                            const b = r.breaks?.[k as keyof typeof r.breaks];
                            const dur = breakDuration(b);
                            return (
                              <td key={k} className="py-3 px-2 text-xs text-gray-600 whitespace-nowrap">
                                {b?.start ? (
                                  <span>
                                    {fmtTime(b.start)} – {b.end ? fmtTime(b.end) : "…"}
                                    <span className="block text-gray-400">{dur > 0 ? `(${dur}m)` : ""}</span>
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-3 px-2 font-semibold text-blue-700">
                            {fmtMinutes(r.totalWorkMinutes || 0)}
                          </td>
                          <td className="py-3 px-2">
                            {isLate ? (
                              <span className="text-yellow-600 font-mono">{r.lateMinutes}m</span>
                            ) : (
                              <span className="text-emerald-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {r.undertimeMinutes && r.undertimeMinutes > 0 ? (
                              <span className="text-red-500 font-mono">{r.undertimeMinutes}m</span>
                            ) : (
                              <span className="text-emerald-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {!hasClockIn ? (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">Absent</span>
                            ) : isLate ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                <AlertCircle className="w-3 h-3" /> Late
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                                <CheckCircle className="w-3 h-3" /> Present
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Footer totals */}
                  <tfoot>
                    <tr className="border-t-2 bg-gray-50 font-semibold">
                      <td className="py-3 px-2 text-gray-600" colSpan={6}>Weekly Totals</td>
                      <td className="py-3 px-2 text-blue-700">{fmtMinutes(totalWorkMinutes)}</td>
                      <td className="py-3 px-2 text-yellow-600">{totalLateMinutes && totalLateMinutes > 0 ? `${totalLateMinutes}m` : "—"}</td>
                      <td className="py-3 px-2 text-red-500">{totalUndertimeMinutes && totalUndertimeMinutes > 0 ? `${totalUndertimeMinutes}m` : "—"}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
