"use client";

import { useState } from "react";
import { CheckCircle2, CircleX, FileEdit, X } from "lucide-react";

type EditRequestStatus = "pending" | "approved" | "rejected";

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
    breaks?: {
        morning?: BreakRecord;
        lunch?: BreakRecord;
        afternoon?: BreakRecord;
    };
    totalWorkMinutes?: number;
    lateMinutes?: number;
    undertimeMinutes?: number;
}

interface EmployeeSummary {
    _id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    name?: string;
    email?: string;
}

interface AttendanceEditChange {
    path: string;
    value: string | boolean | null;
}

export interface AttendanceEditRequest {
    _id: string;
    attendanceId: AttendanceRecord | string;
    employeeId: EmployeeSummary | string;
    changes: AttendanceEditChange[];
    reason?: string;
    status: EditRequestStatus;
    rejectionReason?: string;
    reviewedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

type Props = {
    open: boolean;
    request: AttendanceEditRequest | null;
    loading?: boolean;
    error?: string | null;
    onClose: () => void;
    onApprove: (requestId: string) => Promise<void>;
    onReject: (requestId: string, rejectionReason: string) => Promise<void>;
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Manila",
    });
};

const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
    });
};

const prettifyPath = (path: string) => {
    return path
        .replaceAll(".", " → ")
        .replace(/\b\w/g, (m) => m.toUpperCase());
};

const formatValue = (value: string | boolean | null) => {
    if (value === null) return "Clear value";
    if (typeof value === "boolean") return value ? "Yes" : "No";

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime()) && value.includes("T")) {
        return parsed.toLocaleString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Manila",
        });
    }

    return String(value);
};

const getEmployeeName = (employee: AttendanceEditRequest["employeeId"]) => {
    if (!employee || typeof employee === "string") return "Unknown employee";

    return (
        employee.fullName ||
        employee.name ||
        [employee.firstName, employee.lastName].filter(Boolean).join(" ") ||
        employee.email ||
        "Unknown employee"
    );
};

const getOriginalValue = (path: string, attendanceRecord: AttendanceRecord | null) => {
    if (!attendanceRecord) return null;

    // Logic to find the original value based on the change path
    // For example, checking the `attendanceRecord` fields like clockIn, clockOut, etc.
    switch (path) {
        case "clockIn.time":
            return attendanceRecord.clockIn?.time;
        case "clockOut.time":
            return attendanceRecord.clockOut?.time;
        // Add more cases for other fields you want to show the original value for
        default:
            return null;
    }
};

export default function ReviewAttendanceRequestModal({
    open,
    request,
    loading = false,
    error = null,
    onClose,
    onApprove,
    onReject,
}: Props) {
    const [rejectionReason, setRejectionReason] = useState("");

    const employeeName = getEmployeeName(request?.employeeId ?? "");
    const attendanceRecord =
        request?.attendanceId && typeof request.attendanceId !== "string"
            ? request.attendanceId
            : null;

    if (!open || !request) return null;

    const handleClose = () => {
        setRejectionReason("");
        onClose();
    };

    if (!open || !request) return null;

    const handleApprove = async () => {
        await onApprove(request._id);
    };

    const handleReject = async () => {
        await onReject(request._id, rejectionReason.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div key={request._id} className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <FileEdit className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Review Attendance Edit Request
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Review the requested changes before approving or rejecting them.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[85vh] space-y-6 overflow-y-auto px-6 py-5">
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Employee
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {employeeName}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Attendance Date
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {formatDate(attendanceRecord?.date)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Submitted At
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {formatDateTime(request.createdAt)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Status
                            </p>
                            <p className="mt-1">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${request.status === "pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : request.status === "approved"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {request.status}
                                </span>
                            </p>
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-900">
                            Employee Reason
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            {request.reason?.trim() || "No reason provided."}
                        </p>
                    </section>

                    <section className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-900">
                            Requested Changes
                        </p>

                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Field
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Original Value
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Requested Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {request.changes.map((change, index) => {
                                        // Find the original value from the attendance record
                                        const originalValue = getOriginalValue(change.path, attendanceRecord);
                                        return (
                                            <tr key={`${change.path}-${index}`} className="border-b last:border-0">
                                                <td className="px-3 py-3 text-gray-700">
                                                    {prettifyPath(change.path)}
                                                </td>
                                                <td className="px-3 py-3 text-gray-900">
                                                    {originalValue ? formatValue(originalValue) : "N/A"}
                                                </td>
                                                <td className="px-3 py-3 font-medium text-gray-900">
                                                    {formatValue(change.value)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {request.status === "pending" ? (
                        <section className="rounded-xl border border-gray-200 p-4">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Reason for Declining (optional)
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                                placeholder="Explain why this request is being declined."
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Recommended when declining a request.
                            </p>
                        </section>
                    ) : request.status === "rejected" && request.rejectionReason ? (
                        <section className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-semibold text-red-700">
                                Rejection Reason
                            </p>
                            <p className="mt-2 text-sm text-red-600">
                                {request.rejectionReason}
                            </p>
                        </section>
                    ) : null}

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
                        Close
                    </button>

                    {request.status === "pending" ? (
                        <>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CircleX className="h-4 w-4" />
                                {loading ? "Processing..." : "Decline"}
                            </button>

                            <button
                                type="button"
                                onClick={handleApprove}
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {loading ? "Processing..." : "Approve"}
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}