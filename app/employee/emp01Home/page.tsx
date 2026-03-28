"use client";

import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Coffee,
  LogOut,
  LogIn,
  Timer,
  TrendingUp,
  UserX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  clockIn,
  clockOut,
  markAbsent,
  autoClockOut,
  enableOvertime,
  startBreak,
  endBreak,
  autoStartBreak,
  autoEndBreak,
  getTodayAttendance,
  getWeeklyAttendance,
  getServerTime,
  setRequiredWeeklyHours as saveRequiredWeeklyHours,
} from "@/services/attendanceApi";
import { getEmployeeProfile } from '../../../services/employeeApi';

// ─── Types ─────────────────────────────────────────────────────────────────────
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
  overtimeEnabled?: boolean;
  declaredAbsent?: boolean;
}
interface WeeklyData {
  records: AttendanceRecord[];
  totalWorkMinutes: number;
  weekStart: string;
  weekEnd: string;
  requiredWeeklyHours: number;
}
interface Toast {
  message: string;
  type: string;
}
interface AutoTracker {
  [key: string]: boolean;
}

// ─── PHT helpers (client-side, mirrors server logic) ──────────────────────────
const PHT_OFFSET_MS = 8 * 60 * 60 * 1000;

const toPHTMinutes = (isoString: string): number => {
  const d = new Date(isoString);
  const pht = new Date(d.getTime() + PHT_OFFSET_MS);
  return pht.getUTCHours() * 60 + pht.getUTCMinutes();
};

// ─── Schedule constants (must match server) ────────────────────────────────────
const SCHEDULE = {
  clockInStart: 8 * 60,
  gracePeriodEnd: 8 * 60 + 30,
  clockOutStd: 17 * 60,
  retentionEnd: 17 * 60 + 15, // auto clock-out (no overtime) at 5:15 PM
  overtimeEndManual: 22 * 60, // manual overtime clock-out at 10:00 PM
  overtimeAutoEnd: 22 * 60 + 30, // auto overtime clock-out at 10:30 PM
};
const BREAKS = {
  morning: { windowOpen: 9 * 60 + 50, start: 10 * 60, end: 10 * 60 + 15 },
  lunch: { windowOpen: 11 * 60 + 50, start: 12 * 60, end: 13 * 60, autoEnd: 13 * 60 + 10 },
  afternoon: { windowOpen: 14 * 60 + 50, start: 15 * 60, end: 15 * 60 + 15 },
};

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
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const fmtDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const [y, mo, d] = dateStr.split("-");
  return new Date(Date.UTC(+y, +mo - 1, +d)).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

// ─── Status badge ──────────────────────────────────────────────────────────────
const getStatus = (att: AttendanceRecord | null) => {
  if (att?.declaredAbsent && !att.clockIn?.time) {
    return { label: "Absent", color: "text-gray-600", bg: "bg-gray-200" };
  }
  if (!att || !att.clockIn?.time) return { label: "Not Started", color: "text-gray-400", bg: "bg-gray-100" };
  if (att.clockOut?.time) return { label: "Clocked Out", color: "text-red-600", bg: "bg-red-100" };
  const openBreak = (["morning", "lunch", "afternoon"] as const).find(
    (k) => att.breaks?.[k]?.start && !att.breaks?.[k]?.end
  );
  if (openBreak === "lunch") return { label: "Lunch Break", color: "text-orange-600", bg: "bg-orange-100" };
  if (openBreak) return { label: "On Break", color: "text-yellow-600", bg: "bg-yellow-100" };
  return { label: "Working", color: "text-emerald-600", bg: "bg-emerald-100" };
};

// ─── Which break is currently open ────────────────────────────────────────────
const openBreakType = (att: AttendanceRecord | null): string | null => {
  if (!att) return null;
  return (["morning", "lunch", "afternoon"] as const).find(
    (k) => att.breaks?.[k]?.start && !att.breaks?.[k]?.end
  ) ?? null;
};

// ─── Button availability logic ────────────────────────────────────────────────
const getButtonStates = (att: AttendanceRecord | null, phtMin: number) => {
  const notClocked = !att?.clockIn?.time;
  const clockedOut = !!att?.clockOut?.time;
  const clocked = !notClocked && !clockedOut;
  const onBreak = !!openBreakType(att);

  const canClockIn =
    notClocked && !att?.declaredAbsent && phtMin >= SCHEDULE.clockInStart - 30; // earliest 7:30 AM
  const canMarkAbsent =
    notClocked && !att?.declaredAbsent && phtMin >= SCHEDULE.clockInStart - 30;
  const overtimeEnabled = !!att?.overtimeEnabled;
  const latestManualClockOut = overtimeEnabled ? SCHEDULE.overtimeEndManual : SCHEDULE.retentionEnd; // 17:15
  const canClockOut = clocked && !onBreak && phtMin <= latestManualClockOut;

  const inBreakWindow =
    (phtMin >= BREAKS.morning.windowOpen && phtMin < BREAKS.morning.end) ||
    (phtMin >= BREAKS.lunch.windowOpen && phtMin < BREAKS.lunch.autoEnd) ||
    (phtMin >= BREAKS.afternoon.windowOpen && phtMin < BREAKS.afternoon.end);
  const canStartBreak = clocked && !onBreak && inBreakWindow;

  let availableBreakType: string | null = null;
  if (clocked && !onBreak) {
    if (phtMin >= BREAKS.morning.windowOpen && phtMin < BREAKS.morning.end) availableBreakType = "morning";
    else if (phtMin >= BREAKS.lunch.windowOpen && phtMin < BREAKS.lunch.autoEnd) availableBreakType = "lunch";
    else if (phtMin >= BREAKS.afternoon.windowOpen && phtMin < BREAKS.afternoon.end) availableBreakType = "afternoon";
  }

  const currentOpen = openBreakType(att);
  const canEndBreak = clocked && onBreak && currentOpen === "lunch";

  return { canClockIn, canMarkAbsent, canClockOut, canStartBreak, canEndBreak, availableBreakType, currentOpen };
};

// ─── Auto-action tracker ───────────────────────────────────────────────────────
const makeAutoTracker = (): AutoTracker => ({
  autoClockOut: false,
  morningBreakStart: false,
  morningBreakEnd: false,
  lunchBreakStart: false,
  lunchBreakEnd: false,
  afternoonBreakStart: false,
  afternoonBreakEnd: false,
});

type EmployeeProfile = {
  profile?: string;
  name?: string;
  email?: string;
};

// ═════════════════════════════════════════════════════════════════════════════
export default function EmployeeDTRPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [clientTime, setClientTime] = useState<Date | null>(null);
  const [serverNow, setServerNow] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  // Student input: how many hours are required for this OJT period (used to compute remaining).
  const [requiredWeeklyHours, setRequiredWeeklyHours] = useState<number>(45);
  const [toast, setToast] = useState<Toast | null>(null);
  const [loading, setLoading] = useState({
    clockIn: false,
    clockOut: false,
    break: false,
    overtime: false,
    markAbsent: false,
  });

  const autoRef = useRef<AutoTracker>(makeAutoTracker());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keeps latest attendance readable inside the polling interval (avoids async-in-setState)
  const attendanceRef = useRef<AttendanceRecord | null>(null);
  const requiredHoursSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await getEmployeeProfile();
                if (!cancelled) setEmployeeProfile(response as EmployeeProfile);
            } catch {
                // Ignore profile fetch errors (sidebar will render without profile).
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Data fetchers ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [timeRes, todayRes, weekRes] = await Promise.all([
        getServerTime(),
        getTodayAttendance(),
        getWeeklyAttendance(),
      ]);
      setServerNow(timeRes.now);
      attendanceRef.current = todayRes.attendance;
      setAttendance(todayRes.attendance);
      setWeeklyData(weekRes);
    } catch {
      // Silently fail on background refresh
    }
  }, []);

  // ── Auto-action evaluator ─────────────────────────────────────────────────
  const evaluateAutoActions = useCallback(async (now: string, att: AttendanceRecord | null) => {
    if (!now) return;
    const phtMin = toPHTMinutes(now);
    const tracker = autoRef.current;

    // Auto Break Starts
    const breakDefs = [
      { key: "morningBreakStart", breakType: "morning", min: BREAKS.morning.start },
      { key: "lunchBreakStart", breakType: "lunch", min: BREAKS.lunch.start },
      { key: "afternoonBreakStart", breakType: "afternoon", min: BREAKS.afternoon.start },
    ];
    for (const { key, breakType, min } of breakDefs) {
      if (
        phtMin >= min &&
        !tracker[key] &&
        att?.clockIn?.time &&
        !att?.clockOut?.time &&
        !att?.breaks?.[breakType as keyof typeof att.breaks]?.start
      ) {
        tracker[key] = true;
        try {
          const res = await autoStartBreak(breakType);
          attendanceRef.current = res.attendance;
          setAttendance(res.attendance);
          showToast(`Auto ${breakType} break started.`, "info");
        } catch {/* ignore */ }
      }
    }

    // Auto Break Ends
    const endDefs = [
      { key: "morningBreakEnd", breakType: "morning", min: BREAKS.morning.end },
      { key: "lunchBreakEnd", breakType: "lunch", min: BREAKS.lunch.autoEnd },
      { key: "afternoonBreakEnd", breakType: "afternoon", min: BREAKS.afternoon.end },
    ];
    for (const { key, breakType, min } of endDefs) {
      if (
        phtMin >= min &&
        !tracker[key] &&
        att?.breaks?.[breakType as keyof typeof att.breaks]?.start &&
        !att?.breaks?.[breakType as keyof typeof att.breaks]?.end
      ) {
        tracker[key] = true;
        try {
          const res = await autoEndBreak(breakType);
          attendanceRef.current = res.attendance;
          setAttendance(res.attendance);
          showToast(`Auto ${breakType} break ended.`, "info");
        } catch {/* ignore */ }
      }
    }

    // Auto Clock-Out:
    // - No overtime => 5:15 PM (retentionEnd)
    // - Overtime enabled => 10:30 PM (overtimeAutoEnd)
    const autoClockOutTarget = att?.overtimeEnabled ? SCHEDULE.overtimeAutoEnd : SCHEDULE.retentionEnd;
    if (phtMin >= autoClockOutTarget && !tracker.autoClockOut && att?.clockIn?.time && !att?.clockOut?.time) {
      tracker.autoClockOut = true;
      try {
        const res = await autoClockOut();
        attendanceRef.current = res.attendance;
        setAttendance(res.attendance);
        showToast(
          att?.overtimeEnabled
            ? "Auto clock-out recorded at 10:30 PM."
            : "Auto clock-out recorded at 5:15 PM.",
          "info"
        );
        const weekRes = await getWeeklyAttendance();
        setWeeklyData(weekRes);
      } catch {/* ignore */ }
    }
  }, [showToast]);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Keep required hours in sync with DB for the current week.
  useEffect(() => {
    if (weeklyData?.requiredWeeklyHours && weeklyData.requiredWeeklyHours >= 0.5) {
      setRequiredWeeklyHours(weeklyData.requiredWeeklyHours);
    }
  }, [weeklyData]);

  // ── Client clock ──────────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    setClientTime(new Date());
    const t = setInterval(() => setClientTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Polling loop: every 30 s — re-sync server time + evaluate auto-actions ─
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const timeRes = await getServerTime();
        setServerNow(timeRes.now);
        // Read latest attendance from ref — avoids async-in-setState anti-pattern
        evaluateAutoActions(timeRes.now, attendanceRef.current);
      } catch {/* network hiccup */ }
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [evaluateAutoActions]);

  // Run auto-actions once initial data is loaded
  useEffect(() => {
    if (serverNow) evaluateAutoActions(serverNow, attendance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverNow, attendance?.clockIn?.time]);

  // ─── Derived state ─────────────────────────────────────────────────────────
  const phtMin = serverNow ? toPHTMinutes(serverNow) : 0;
  const btnStates = getButtonStates(attendance, phtMin);
  const status = getStatus(attendance);

  const todayDate = clientTime
    ? clientTime.toLocaleDateString("en-PH", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      timeZone: "Asia/Manila",
    })
    : "--";

  // ─── Manual action handlers ────────────────────────────────────────────────
  const handleClockIn = async () => {
    setLoading((l) => ({ ...l, clockIn: true }));
    try {
      const res = await clockIn();
      attendanceRef.current = res.attendance;
      setAttendance(res.attendance);
      const late = phtMin >= SCHEDULE.gracePeriodEnd;
      showToast(late ? "Late clock-in recorded at your current time." : "Clocked in successfully! ✅");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err?.response?.data?.message || "Clock-in failed.", "error");
    } finally {
      setLoading((l) => ({ ...l, clockIn: false }));
    }
  };

  const handleMarkAbsent = async () => {
    if (!window.confirm("Mark yourself absent for today? You will not be able to clock in unless a supervisor fixes your record.")) {
      return;
    }
    setLoading((l) => ({ ...l, markAbsent: true }));
    try {
      const res = await markAbsent();
      attendanceRef.current = res.attendance;
      setAttendance(res.attendance);
      showToast(res.message || "Marked absent for today.", "info");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err?.response?.data?.message || "Could not mark absent.", "error");
    } finally {
      setLoading((l) => ({ ...l, markAbsent: false }));
    }
  };

  const handleClockOut = async () => {
    setLoading((l) => ({ ...l, clockOut: true }));
    try {
      const res = await clockOut();
      attendanceRef.current = res.attendance;
      setAttendance(res.attendance);
      showToast("Clocked out successfully! 👋");
      const weekRes = await getWeeklyAttendance();
      setWeeklyData(weekRes);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err?.response?.data?.message || "Clock-out failed.", "error");
    } finally {
      setLoading((l) => ({ ...l, clockOut: false }));
    }
  };

  const handleStartBreak = async () => {
    if (!btnStates.availableBreakType) return;
    setLoading((l) => ({ ...l, break: true }));
    try {
      const res = await startBreak(btnStates.availableBreakType);
      attendanceRef.current = res.attendance;
      setAttendance(res.attendance);
      showToast(`${btnStates.availableBreakType} break started. ☕`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err?.response?.data?.message || "Start break failed.", "error");
    } finally {
      setLoading((l) => ({ ...l, break: false }));
    }
  };

  const handleEndBreak = async () => {
    setLoading((l) => ({ ...l, break: true }));
    try {
      const res = await endBreak();
      attendanceRef.current = res.attendance;
      setAttendance(res.attendance);
      showToast("Lunch break ended. Back to work! 💪");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err?.response?.data?.message || "End break failed.", "error");
    } finally {
      setLoading((l) => ({ ...l, break: false }));
    }
  };

  // ─── Break summary display ─────────────────────────────────────────────────
  const breakLabels: Record<string, string> = { morning: "Morning", lunch: "Lunch", afternoon: "Afternoon" };
  const breakSummary = (["morning", "lunch", "afternoon"] as const).map((k) => {
    const b = attendance?.breaks?.[k];
    return { key: k, label: breakLabels[k], start: b?.start, end: b?.end, auto: b?.isAutomatic };
  });

  // ─── Weekly stats ──────────────────────────────────────────────────────────
  const weeklyTotal = fmtMinutes(weeklyData?.totalWorkMinutes ?? 0);
  const weeklyRecords = weeklyData?.records ?? [];
  const requiredWeeklyMinutes = Math.max(1, Math.round(requiredWeeklyHours * 60));
  const remainingWeeklyMinutes = Math.max(
    0,
    requiredWeeklyMinutes - (weeklyData?.totalWorkMinutes ?? 0)
  );
  const weeklyPct = Math.min(
    100,
    Math.round(
      ((weeklyData?.totalWorkMinutes ?? 0) / requiredWeeklyMinutes) * 100
    )
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen mx-auto p-4 md:p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all
            ${toast.type === "error" ? "bg-red-500" : toast.type === "info" ? "bg-blue-500" : "bg-emerald-500"}`}
        >
          {toast.message}
        </div>
      )}

      <div className="space-y-6">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-between gap-2">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900"><span className="text-emerald-700 font-bold text-2xl">{employeeProfile?.name}&apos;s</span> DTR</h1>
            <p className="text-sm text-gray-500 mt-0.5">{todayDate}</p>
          </div>
          <span
            className={`self-center sm:self-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${status.bg} ${status.color}`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {status.label}
          </span>
        </div>

        {/* ── Schedule Info ─────────────────────────────────────────────────── */}
        <Card className="border-dashed border-gray-200 bg-white/60">
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-3 text-xs text-gray-600 lg:grid-cols-4">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                <div className="leading-tight">
                  <div className="text-gray-700 font-medium">Work</div>
                  <div>8:00 AM – 5:00 PM</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                <div className="leading-tight">
                  <div className="text-gray-700 font-medium">Morning Break</div>
                  <div>10:00 – 10:15 AM</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                <div className="leading-tight">
                  <div className="text-gray-700 font-medium">Lunch</div>
                  <div>12:00 – 1:00 PM</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                <div className="leading-tight">
                  <div className="text-gray-700 font-medium">Afternoon Break</div>
                  <div>3:00 – 3:15 PM</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Clock Card ────────────────────────────────────────────────────── */}
        <Card className="bg-gradient-to-br from-emerald-600 to-purple-700 border-0 text-white overflow-hidden">
          <CardContent className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              {/* Left: Live clock + stats */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-80 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Philippine Standard Time</span>
                </div>
                <div className="text-6xl font-bold font-mono tracking-tight">
                  {isMounted && clientTime
                    ? clientTime.toLocaleTimeString("en-PH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZone: "Asia/Manila",
                    })
                    : "--:--:--"}
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <div>
                    <div className="text-xs opacity-70">Clock In</div>
                    <div className="text-lg font-semibold font-mono">{fmtTime(attendance?.clockIn?.time)}</div>
                    {attendance?.clockIn?.isAutomatic && (
                      <div className="text-xs opacity-60 mt-0.5">auto</div>
                    )}
                  </div>
                  <div className="h-10 w-px bg-white/30" />
                  <div>
                    <div className="text-xs opacity-70">Clock Out</div>
                    <div className="text-lg font-semibold font-mono">{fmtTime(attendance?.clockOut?.time)}</div>
                    {attendance?.clockOut?.isAutomatic && (
                      <div className="text-xs opacity-60 mt-0.5">auto</div>
                    )}
                  </div>
                  <div className="h-10 w-px bg-white/30" />
                  <div>
                    <div className="text-xs opacity-70">Work Hours</div>
                    <div className="text-lg font-semibold">{fmtMinutes(attendance?.totalWorkMinutes ?? 0)}</div>
                  </div>
                </div>
              </div>

              {/* Right: Action buttons */}
              <div className="flex flex-col gap-3 min-w-[180px]">
                {attendance?.declaredAbsent && !attendance?.clockIn?.time ? (
                  <p className="text-sm text-white/90 text-center py-2 px-1">
                    You marked yourself <span className="font-semibold">absent</span> for today.
                  </p>
                ) : (
                  <>
                    <Button
                      size="lg"
                      disabled={!btnStates.canClockIn || loading.clockIn}
                      className="bg-white text-emerald-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold gap-2 w-full"
                      onClick={handleClockIn}
                    >
                      <LogIn className="w-4 h-4" />
                      {loading.clockIn
                        ? "Clocking in…"
                        : phtMin >= SCHEDULE.gracePeriodEnd
                          ? "Clock In Late"
                          : "Clock In"}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      disabled={!btnStates.canMarkAbsent || loading.markAbsent}
                      className="border-white/40 bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed font-semibold gap-2 w-full"
                      onClick={handleMarkAbsent}
                    >
                      <UserX className="w-4 h-4" />
                      {loading.markAbsent ? "Saving…" : "Mark Absent Today"}
                    </Button>
                  </>
                )}

                <Button
                  size="lg"
                  disabled={
                    !attendance?.clockIn?.time ||
                    !!attendance?.clockOut?.time ||
                    !!attendance?.overtimeEnabled ||
                    phtMin > SCHEDULE.overtimeEndManual ||
                    loading.overtime
                  }
                  className="bg-white/10 border border-white/30 text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed font-semibold gap-2 w-full"
                  onClick={async () => {
                    setLoading((l) => ({ ...l, overtime: true }));
                    try {
                      const res = await enableOvertime();
                      attendanceRef.current = res.attendance;
                      setAttendance(res.attendance);
                      showToast("Overtime enabled. You can clock out up to 10:00 PM.", "info");
                    } catch (e: unknown) {
                      const err = e as { response?: { data?: { message?: string } } };
                      showToast(err?.response?.data?.message || "Enabling overtime failed.", "error");
                    } finally {
                      setLoading((l) => ({ ...l, overtime: false }));
                    }
                  }}
                >
                  {loading.overtime ? "Enabling…" : "Enable Overtime"}
                </Button>

                <Button
                  size="lg"
                  disabled={!btnStates.canClockOut || loading.clockOut}
                  className="bg-white text-red-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold gap-2 w-full"
                  onClick={handleClockOut}
                >
                  <LogOut className="w-4 h-4" />
                  {loading.clockOut ? "Clocking out…" : "Clock Out"}
                </Button>

                <Button
                  size="lg"
                  disabled={!btnStates.canStartBreak || loading.break}
                  className="bg-white/10 border border-white/30 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed font-semibold gap-2 w-full"
                  onClick={handleStartBreak}
                >
                  <Coffee className="w-4 h-4" />
                  {loading.break
                    ? "Starting…"
                    : btnStates.availableBreakType
                      ? `Start ${btnStates.availableBreakType.charAt(0).toUpperCase() + btnStates.availableBreakType.slice(1)} Break`
                      : "Start Break"}
                </Button>

                <Button
                  size="lg"
                  disabled={!btnStates.canEndBreak || loading.break}
                  className={`font-semibold gap-2 w-full disabled:opacity-30 disabled:cursor-not-allowed
                    ${btnStates.canEndBreak
                      ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300 animate-pulse"
                      : "bg-white/10 border border-white/30 text-white/50"
                    }`}
                  onClick={handleEndBreak}
                >
                  <Coffee className="w-4 h-4" />
                  {loading.break ? "Ending…" : "End Break"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Row 2: Breaks + Weekly ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Break Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Coffee className="w-4 h-4 text-orange-500" />
                Today&apos;s Breaks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {breakSummary.map(({ key, label, start, end, auto }) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 w-24">{label}</span>
                  <span className="font-mono text-gray-500">{start ? fmtTime(start) : "--:--"}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-mono text-gray-500">{end ? fmtTime(end) : "--:--"}</span>
                  {auto && start && (
                    <span className="text-xs text-blue-400 bg-blue-50 px-2 py-0.5 rounded-full">auto</span>
                  )}
                  {!auto && start && (
                    <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">manual</span>
                  )}
                  {!start && <span className="w-16" />}
                </div>
              ))}
              {(attendance?.lateMinutes ?? 0) > 0 && (
                <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                  <span className="text-yellow-600 font-medium">Late</span>
                  <span className="font-mono text-yellow-600">{attendance!.lateMinutes} min</span>
                </div>
              )}
              {(attendance?.undertimeMinutes ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-500 font-medium">Undertime</span>
                  <span className="font-mono text-red-500">{attendance!.undertimeMinutes} min</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
                  <div>
                    <div className="text-gray-600 text-sm">Rendered (Worked) Hours</div>
                    <div className="font-semibold text-gray-800 text-base">{weeklyTotal}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="requiredWeeklyHours"
                      className="text-sm text-gray-600 whitespace-nowrap"
                    >
                      Required OJT Hours
                    </label>
                    <input
                      id="requiredWeeklyHours"
                      type="number"
                      min={0.5}
                      step={0.5}
                      className="w-28 h-9 rounded-md border border-gray-200 px-2 text-sm"
                      value={requiredWeeklyHours}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isFinite(n) && n >= 0.5) {
                          setRequiredWeeklyHours(n);
                          if (requiredHoursSaveTimerRef.current) {
                            clearTimeout(requiredHoursSaveTimerRef.current);
                          }
                          requiredHoursSaveTimerRef.current = setTimeout(async () => {
                            try {
                              await saveRequiredWeeklyHours(n);
                              setWeeklyData((prev) =>
                                prev ? { ...prev, requiredWeeklyHours: n } : prev
                              );
                              showToast("Required OJT hours saved.", "info");
                            } catch (err) {
                              const e2 = err as { response?: { data?: { message?: string } } };
                              showToast(
                                e2?.response?.data?.message || "Failed to save required OJT hours.",
                                "error"
                              );
                            }
                          }, 500);
                        }
                      }}
                    />
                    <span className="text-sm text-gray-500">hrs</span>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${weeklyPct}%` }}
                  />
                </div>

                <div className="text-right text-xs text-gray-400 mt-1">
                  {weeklyPct}% of {requiredWeeklyHours}h required
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Remaining:</span>
                  <span className="font-medium text-gray-700">{fmtMinutes(remainingWeeklyMinutes)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {(["Days Present", "Days Late", "Total Hrs"] as const).map((label, i) => {
                  const vals: (string | number)[] = [
                    weeklyRecords.filter((r) => r.clockIn?.time).length,
                    weeklyRecords.filter((r) => (r.lateMinutes ?? 0) > 0).length,
                    fmtMinutes(weeklyData?.totalWorkMinutes ?? 0),
                  ];
                  const colors = ["text-emerald-600", "text-yellow-600", "text-blue-600"];
                  return (
                    <div key={label} className="text-center">
                      <div className={`text-xl font-bold ${colors[i]}`}>{vals[i]}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Weekly Attendance Table ───────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-purple-500" />
              This Week&apos;s Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Timer className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No records yet this week.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      {["Date", "Clock In", "Clock Out", "Breaks", "Work Hours", "Late", "Status"].map((h) => (
                        <th key={h} className="pb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyRecords.map((r) => {
                      const totalBreakMin =
                        (["lunch"] as const).reduce((sum, k) => {
                          const b = r.breaks?.[k];
                          if (b?.start && b?.end) {
                            // Match server rendered-hours logic:
                            // clamp break end to official scheduled end time.
                            const startMin = toPHTMinutes(b.start);
                            const rawEndMin = toPHTMinutes(b.end);
                            const officialEndMin = BREAKS[k].end;
                            const effectiveEndMin = Math.min(rawEndMin, officialEndMin);
                            return sum + Math.max(0, effectiveEndMin - startMin);
                          }
                          return sum;
                        }, 0);
                      const isLate = (r.lateMinutes ?? 0) > 0;
                      return (
                        <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium">{fmtDate(r.date)}</td>
                          <td className="py-3 px-2 font-mono text-gray-700">{fmtTime(r.clockIn?.time)}</td>
                          <td className="py-3 px-2 font-mono text-gray-700">{fmtTime(r.clockOut?.time)}</td>
                          <td className="py-3 px-2 text-gray-600">{fmtMinutes(totalBreakMin)}</td>
                          <td className="py-3 px-2 font-semibold text-blue-700">{fmtMinutes(r.totalWorkMinutes ?? 0)}</td>
                          <td className="py-3 px-2">
                            {isLate ? (
                              <span className="text-yellow-600 font-mono">{r.lateMinutes}m</span>
                            ) : (
                              <span className="text-emerald-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {!r.clockIn?.time ? (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                {r.declaredAbsent ? "Absent (declared)" : "Absent"}
                              </span>
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
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
