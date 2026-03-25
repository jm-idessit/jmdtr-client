import { API } from "../utils/api";

// ─── Clock In / Out ───────────────────────────────────────────────────────────

export const clockIn = async () => {
  const res = await API.post("/attendance/clock-in");
  return res.data;
};

export const autoClockIn = async () => {
  const res = await API.post("/attendance/auto-clock-in");
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

export const getWeeklyAttendance = async () => {
  const res = await API.get("/attendance/weekly");
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

