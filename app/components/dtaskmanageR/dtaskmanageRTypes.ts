export type TaskLevel = 0 | 1 | 2; // 0 = Main Task, 1 = Subtask, 2 = Level-2 Subtask
export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Backlog" | "To Do" | "In Progress" | "Completed";
export type WorkspaceRole = "Owner" | "Admin" | "Member" | "Viewer";

export type Attachment = {
  id: string;
  name: string;
  sizeKb: number;
  addedAtISO: string;
};

export type WorkspaceTag = {
  id: string;
  label: string;
};

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
};

export type TaskComment = {
  id: string;
  authorName: string;
  body: string;
  createdAtISO: string;
};

export type TaskNode = {
  id: string;
  parentId: string | null; // null = Main Task root
  level: TaskLevel;

  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[]; // tag ids
  dueDateISO: string | null; // YYYY-MM-DD (date input)
  assignee: string;

  attachments: Attachment[];
  comments: TaskComment[];
};

export type TaskWorkspaceState = {
  id: string;
  name: string;
  tags: WorkspaceTag[];
  members: WorkspaceMember[];

  nodes: TaskNode[]; // contains main tasks + subtasks + level-2 subtasks

  // Time tracking (client-only UI)
  // - Only one running timer at a time per workspace.
  globalRunningNodeId: string | null;
  globalRunningSinceMs: number | null;
  timeAccumulatedMsByNodeId: Record<string, number>; // persisted
};

export const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];
export const STATUSES: TaskStatus[] = ["Backlog", "To Do", "In Progress", "Completed"];
export const ROLES: WorkspaceRole[] = ["Owner", "Admin", "Member", "Viewer"];

export type RoleCapabilities = {
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
  canManageUsers: boolean;
  canManageTags: boolean;
};

export function getRoleCapabilities(role: WorkspaceRole): RoleCapabilities {
  switch (role) {
    case "Owner":
      return { canView: true, canEdit: true, canComment: true, canManageUsers: true, canManageTags: true };
    case "Admin":
      return { canView: true, canEdit: true, canComment: true, canManageUsers: true, canManageTags: true };
    case "Member":
      return { canView: true, canEdit: true, canComment: true, canManageUsers: false, canManageTags: false };
    case "Viewer":
      return { canView: true, canEdit: false, canComment: false, canManageUsers: false, canManageTags: false };
    default:
      return { canView: true, canEdit: false, canComment: false, canManageUsers: false, canManageTags: false };
  }
}

export const statusMeta: Record<TaskStatus, { badgeClass: string; dotClass: string }> = {
  Backlog: { badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", dotClass: "bg-emerald-500" },
  "To Do": { badgeClass: "bg-blue-50 text-blue-700 border-blue-200", dotClass: "bg-blue-500" },
  "In Progress": { badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200", dotClass: "bg-yellow-500" },
  Completed: { badgeClass: "bg-gray-100 text-gray-800 border-gray-200", dotClass: "bg-gray-500" },
};

export const priorityMeta: Record<TaskPriority, { badgeClass: string; dotClass: string }> = {
  Low: { badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", dotClass: "bg-emerald-500" },
  Medium: { badgeClass: "bg-blue-50 text-blue-700 border-blue-200", dotClass: "bg-blue-500" },
  High: { badgeClass: "bg-red-50 text-red-700 border-red-200", dotClass: "bg-red-500" },
};

