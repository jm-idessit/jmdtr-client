"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FileEdit,
    CheckCircle2,
    CircleX,
    ClipboardList,
    Clock3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    approveAttendanceEditRequest,
    getAttendanceEditRequests,
    rejectAttendanceEditRequest,
} from "@/services/attendanceApi";

import ReviewAttendanceRequestModal from "../../components/modal/ReviewAttendanceRequestModal";

type RequestFilter = "all" | "pending" | "approved" | "rejected";
type EditRequestStatus = "pending" | "approved" | "rejected";

interface AttendanceEditRequest {
    _id: string;
    attendanceId: string | {
        _id: string;
        date: string;
    };
    employeeId: string | {
        _id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        name?: string;
        email?: string;
    };
    changes: {
        path: string;
        value: string | boolean | null;
    }[];
    reason?: string;
    status: EditRequestStatus;
    rejectionReason?: string;
    reviewedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
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

const getAttendanceDate = (attendance: AttendanceEditRequest["attendanceId"]) => {
    if (!attendance || typeof attendance === "string") return "N/A";
    return formatDate(attendance.date);
};

const getErrorMessage = (err: unknown) => {
    if (axios.isAxiosError(err)) {
        return (
            (err.response?.data as { message?: string } | undefined)?.message ||
            err.message ||
            "Something went wrong."
        );
    }

    if (err instanceof Error) return err.message;

    return "Something went wrong.";
};

export default function EmployerAttendanceEditRequestsPage() {
    const [filter, setFilter] = useState<RequestFilter>("all");
    const [requests, setRequests] = useState<AttendanceEditRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedRequest, setSelectedRequest] =
        useState<AttendanceEditRequest | null>(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getAttendanceEditRequests(
                filter === "all" ? {} : { status: filter }
            );
            setRequests(data.data || []);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const counts = useMemo(() => {
        return requests.reduce(
            (acc, item) => {
                acc.total += 1;
                if (item.status === "pending") acc.pending += 1;
                if (item.status === "approved") acc.approved += 1;
                if (item.status === "rejected") acc.rejected += 1;
                return acc;
            },
            { total: 0, pending: 0, approved: 0, rejected: 0 }
        );
    }, [requests]);

    const handleOpenReview = (request: AttendanceEditRequest) => {
        setSelectedRequest(request);
        setReviewError(null);
        setReviewOpen(true);
    };

    const handleCloseReview = () => {
        if (actionLoading) return;
        setReviewOpen(false);
        setSelectedRequest(null);
        setReviewError(null);
    };

    const handleApprove = async (requestId: string) => {
        try {
            setActionLoading(true);
            setReviewError(null);

            await approveAttendanceEditRequest(requestId);
            await fetchRequests();
            handleCloseReview();
        } catch (err: unknown) {
            setReviewError(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (
        requestId: string,
        rejectionReason: string
    ) => {
        try {
            setActionLoading(true);
            setReviewError(null);

            await rejectAttendanceEditRequest(requestId, rejectionReason);
            await fetchRequests();
            handleCloseReview();
        } catch (err: unknown) {
            setReviewError(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Attendance Edit Requests
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Review employee requests for attendance record corrections.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Total
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-700">
                                        {counts.total}
                                    </p>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                    <ClipboardList className="h-4 w-4 text-slate-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Pending
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-yellow-600">
                                        {counts.pending}
                                    </p>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
                                    <Clock3 className="h-4 w-4 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Approved
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-emerald-600">
                                        {counts.approved}
                                    </p>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Rejected
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-red-600">
                                        {counts.rejected}
                                    </p>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                                    <CircleX className="h-4 w-4 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileEdit className="h-4 w-4 text-indigo-500" />
                            Request Queue
                        </CardTitle>

                        <div className="flex flex-wrap gap-2">
                            {(["all", "pending", "approved", "rejected"] as RequestFilter[]).map(
                                (status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${filter === status
                                            ? "bg-indigo-600 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {status}
                                    </button>
                                )
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="py-12 text-center text-gray-400">
                                Loading requests...
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center text-red-500">{error}</div>
                        ) : requests.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">
                                No edit requests found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            {[
                                                "Employee",
                                                "Attendance Date",
                                                "Submitted",
                                                "Changes",
                                                "Status",
                                                "Action",
                                            ].map((head) => (
                                                <th
                                                    key={head}
                                                    className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                                                >
                                                    {head}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request) => (
                                            <tr
                                                key={request._id}
                                                className="border-b last:border-0 hover:bg-gray-50"
                                            >
                                                <td className="px-3 py-3 font-medium text-gray-900">
                                                    {getEmployeeName(request.employeeId)}
                                                </td>
                                                <td className="px-3 py-3 text-gray-700">
                                                    {getAttendanceDate(request.attendanceId)}
                                                </td>
                                                <td className="px-3 py-3 text-gray-700">
                                                    {formatDateTime(request.createdAt)}
                                                </td>
                                                <td className="px-3 py-3 text-gray-700">
                                                    {request.changes.length}
                                                </td>
                                                <td className="px-3 py-3">
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
                                                </td>
                                                <td className="px-3 py-3">
                                                    <button
                                                        onClick={() => handleOpenReview(request)}
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ReviewAttendanceRequestModal
                open={reviewOpen}
                request={selectedRequest}
                loading={actionLoading}
                error={reviewError}
                onClose={handleCloseReview}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}