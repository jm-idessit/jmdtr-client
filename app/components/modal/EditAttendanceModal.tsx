"use client";

import { useEffect, useMemo, useState } from "react";
import { X, PencilLine } from "lucide-react";

interface BreakRecord {
    start?: string;
    end?: string;
    isAutomatic?: boolean;
}

export interface AttendanceRecord {
    _id: string;
    date: string;
    clockIn?: { time?: string; isAutomatic?: boolean };
    clockOut?: { time?: string; isAutomatic?: boolean };
    breaks?: {
        morning?: BreakRecord;
        lunch?: BreakRecord;
        afternoon?: BreakRecord;
    };
    totalWorkMinutes?: number;
    lateMinutes?: number;
    undertimeMinutes?: number;
}

type EditAttendanceModalProps = {
    open: boolean;
    record: AttendanceRecord | null;
    loading?: boolean;
    error?: string | null;
    onClose: () => void;
    onSubmit: (
        attendanceId: string,
        payload: {
            reason: string;
            changes: {
                clockIn?: { time: string | null };
                clockOut?: { time: string | null };
                breaks?: {
                    morning?: { start: string | null; end: string | null };
                    lunch?: { start: string | null; end: string | null };
                    afternoon?: { start: string | null; end: string | null };
                };
            };
        }
    ) => Promise<void>;
};

const toInputDateTime = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const toIsoOrNull = (value: string) => {
    if (!value.trim()) return null;
    return new Date(value).toISOString();
};

export default function EditAttendanceModal({
    open,
    record,
    loading = false,
    error = null,
    onClose,
    onSubmit,
}: EditAttendanceModalProps) {
    const [clockIn, setClockIn] = useState("");
    const [clockOut, setClockOut] = useState("");

    const [morningStart, setMorningStart] = useState("");
    const [morningEnd, setMorningEnd] = useState("");

    const [lunchStart, setLunchStart] = useState("");
    const [lunchEnd, setLunchEnd] = useState("");

    const [afternoonStart, setAfternoonStart] = useState("");
    const [afternoonEnd, setAfternoonEnd] = useState("");

    const [reason, setReason] = useState("");

    useEffect(() => {
        if (!record || !open) return;

        setClockIn(toInputDateTime(record.clockIn?.time));
        setClockOut(toInputDateTime(record.clockOut?.time));

        setMorningStart(toInputDateTime(record.breaks?.morning?.start));
        setMorningEnd(toInputDateTime(record.breaks?.morning?.end));

        setLunchStart(toInputDateTime(record.breaks?.lunch?.start));
        setLunchEnd(toInputDateTime(record.breaks?.lunch?.end));

        setAfternoonStart(toInputDateTime(record.breaks?.afternoon?.start));
        setAfternoonEnd(toInputDateTime(record.breaks?.afternoon?.end));

        setReason("");
    }, [record, open]);

    const formattedDate = useMemo(() => {
        if (!record?.date) return "";
        const [y, m, d] = record.date.split("-");
        return new Date(Date.UTC(+y, +m - 1, +d)).toLocaleDateString("en-PH", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
        });
    }, [record]);

    if (!open || !record) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            reason: reason.trim(),  // reason is now passed separately, outside of changes
            changes: {
                clockIn: { time: toIsoOrNull(clockIn) },
                clockOut: { time: toIsoOrNull(clockOut) },
                breaks: {
                    morning: {
                        start: toIsoOrNull(morningStart),
                        end: toIsoOrNull(morningEnd),
                    },
                    lunch: {
                        start: toIsoOrNull(lunchStart),
                        end: toIsoOrNull(lunchEnd),
                    },
                    afternoon: {
                        start: toIsoOrNull(afternoonStart),
                        end: toIsoOrNull(afternoonEnd),
                    },
                },
            },
        };

        await onSubmit(record._id, payload);  // Now the reason is sent separately
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <PencilLine className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Edit Attendance Request
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Changes will be sent for employer approval before they appear in your records.
                        </p>
                        <p className="mt-2 text-sm font-medium text-gray-700">
                            Record Date: {formattedDate}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[85vh] overflow-y-auto">
                    <div className="space-y-6 px-6 py-5">
                        <section>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                Main Time Entries
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Clock In
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={clockIn}
                                        onChange={(e) => setClockIn(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Clock Out
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={clockOut}
                                        onChange={(e) => setClockOut(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                Breaks
                            </h3>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="rounded-xl border border-gray-200 p-4">
                                    <p className="mb-3 text-sm font-semibold text-gray-800">
                                        Morning Break
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Start
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={morningStart}
                                                onChange={(e) => setMorningStart(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                End
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={morningEnd}
                                                onChange={(e) => setMorningEnd(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-4">
                                    <p className="mb-3 text-sm font-semibold text-gray-800">
                                        Lunch Break
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Start
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={lunchStart}
                                                onChange={(e) => setLunchStart(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                End
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={lunchEnd}
                                                onChange={(e) => setLunchEnd(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 p-4">
                                    <p className="mb-3 text-sm font-semibold text-gray-800">
                                        Afternoon Break
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Start
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={afternoonStart}
                                                onChange={(e) => setAfternoonStart(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                End
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={afternoonEnd}
                                                onChange={(e) => setAfternoonEnd(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Reason for Edit Request
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                                required
                                placeholder="Explain why this attendance record needs correction."
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </section>

                        {error ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Submitting..." : "Submit for Approval"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}