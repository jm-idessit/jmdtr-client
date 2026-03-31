import { API } from "../utils/api";

// ─── Clock In / Out ───────────────────────────────────────────────────────────

export const clockIn = async () => {
  const res = await API.post("/attendance/clock-in");
  return res.data;
};

export const markAbsent = async () => {
  const res = await API.post("/attendance/mark-absent");
  return res.data;
};

export const clockOut = async () => {
  const res = await API.post("/attendance/clock-out");
  return res.data;
};

export const autoClockOut = async () => {
  const res = await API.post("/attendance/auto-clock-out");
  return res.data;
};

export const enableOvertime = async () => {
  const res = await API.post("/attendance/overtime/enable");
  return res.data;
};

// ─── Breaks ───────────────────────────────────────────────────────────────────

export const startBreak = async (breakType) => {
  const res = await API.post("/attendance/break/start", { breakType });
  return res.data;
};

export const autoStartBreak = async (breakType) => {
  const res = await API.post("/attendance/break/auto-start", { breakType });
  return res.data;
};

export const endBreak = async () => {
  const res = await API.post("/attendance/break/end");
  return res.data;
};

export const autoEndBreak = async (breakType) => {
  const res = await API.post("/attendance/break/auto-end", { breakType });
  return res.data;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getTodayAttendance = async () => {
  const res = await API.get("/attendance/today");
  return res.data;
};

export const getEmployeeAttendanceRecords = async () => {
  const res = await API.get("/attendance/records");
  return res.data;
};

export const setRequiredWeeklyHours = async (requiredHours) => {
  const res = await API.post("/attendance/ojt/required-hours", { requiredHours });
  return res.data;
};

export const getServerTime = async () => {
  const res = await API.get("/attendance/server-time");
  return res.data; // { now: string (ISO), timezone: string }
};

// ─── Employer ─────────────────────────────────────────────────────────────────

export const getAllAttendance = async (params = {}) => {
  const res = await API.get("/attendance/all", { params });
  return res.data;
};

// ─── Employee — Delete Attendance Record ──────────────────────────────────────

export const deleteAttendanceRecord = async (recordId) => {
  const res = await API.delete(`/attendance/record/${recordId}`);
  return res.data;
};

// ─── Employee — Edit Requests ─────────────────────────────────────────────────

export const submitAttendanceEditRequest = async (attendanceId, payload) => {
  const res = await API.post(`/attendance/edit-requests/${attendanceId}`, payload);
  return res.data;
};

export const getMyAttendanceEditRequests = async () => {
  const res = await API.get("/attendance/edit-requests/mine");
  return res.data;
};

// ─── Employer — Edit Requests ─────────────────────────────────────────────────

export const getAttendanceEditRequests = async (params = {}) => {
  const res = await API.get("/attendance/edit-requests", { params });
  return res.data;
};

export const approveAttendanceEditRequest = async (requestId) => {
  const res = await API.patch(`/attendance/edit-requests/${requestId}/approve`);
  return res.data;
};

export const rejectAttendanceEditRequest = async (requestId, rejectionReason) => {
  const res = await API.patch(`/attendance/edit-requests/${requestId}/reject`, { rejectionReason });
  return res.data;
} 



