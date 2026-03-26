import type { TaskWorkspaceState } from "./dtaskmanageRTypes";
import { createSeedWorkspaceState } from "./dtaskmanageRSeed";

const STORAGE_KEY = "dtaskmanageR.workspaceState.v1";

export function loadWorkspaceState(): TaskWorkspaceState {
  if (typeof window === "undefined") {
    // Next server render fallback; we always mount this component as client-side anyway.
    return createSeedWorkspaceState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedWorkspaceState();
    const parsed = JSON.parse(raw) as TaskWorkspaceState;
    if (!parsed?.id || !Array.isArray(parsed?.nodes)) return createSeedWorkspaceState();
    return parsed;
  } catch {
    return createSeedWorkspaceState();
  }
}

export function saveWorkspaceState(state: TaskWorkspaceState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore localStorage quota errors for now (UI remains functional).
  }
}

