import { API } from "../utils/api";

// ─── Clock In / Out ───────────────────────────────────────────────────────────

export const clockIn = async () => {
  const res = await API.post("/attendance/clock-in", {
    withCredentials: true,
  });
  return res.data;
};

export const autoClockIn = async () => {
  const res = await API.post("/attendance/auto-clock-in", {
    withCredentials: true,
  });
  return res.data;
};

export const clockOut = async () => {
  const res = await API.post("/attendance/clock-out", {
    withCredentials: true,
  });
  return res.data;
};

export const autoClockOut = async () => {
  const res = await API.post("/attendance/auto-clock-out", {
    withCredentials: true,
  });
  return res.data;
};

// ─── Breaks ───────────────────────────────────────────────────────────────────

export const startBreak = async (breakType) => {
  const res = await API.post("/attendance/break/start", { breakType }, {
    withCredentials: true,
  });
  return res.data;
};

export const autoStartBreak = async (breakType) => {
  const res = await API.post("/attendance/break/auto-start", { breakType }, {
    withCredentials: true,
  });
  return res.data;
};

export const endBreak = async () => {
  const res = await API.post("/attendance/break/end", {
    withCredentials: true,
  });
  return res.data;
};

export const autoEndBreak = async (breakType) => {
  const res = await API.post("/attendance/break/auto-end", { breakType }, {
    withCredentials: true,
  });
  return res.data;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getTodayAttendance = async () => {
  const res = await API.get("/attendance/today", {
    withCredentials: true,
  });
  return res.data;
};

export const getWeeklyAttendance = async () => {
  const res = await API.get("/attendance/weekly", {
    withCredentials: true,
  });
  return res.data;
};

export const getServerTime = async () => {
  const res = await API.get("/attendance/server-time", {
    withCredentials: true,
  });
  return res.data; // { now: string (ISO), timezone: s  tring }
};

// ─── Employer ─────────────────────────────────────────────────────────────────

export const getAllAttendance = async (params = {}) => {
  const res = await API.get("/attendance/all", { params, withCredentials: true });
  return res.data;
};

