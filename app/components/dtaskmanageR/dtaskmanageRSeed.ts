import type { TaskWorkspaceState } from "./dtaskmanageRTypes";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

// Static "starter" data so the UI works immediately (client-only).
export function createSeedWorkspaceState(): TaskWorkspaceState {
  const ownerId = "m_owner";
  const adminId = "m_admin";
  const memberId = "m_member";
  const viewerId = "m_viewer";

  const tBug = "tag_bugfix";
  const tDoc = "tag_docs";
  const tFE = "tag_frontend";
  const tBE = "tag_backend";
  const tDesign = "tag_design";

  const mainA = "node_main_a";
  const l1A1 = "node_l1_a1";
  const l2A1 = "node_l2_a1";
  const l1A2 = "node_l1_a2";

  const mainB = "node_main_b";
  const l1B1 = "node_l1_b1";
  const l1B2 = "node_l1_b2";
  const l2B2 = "node_l2_b2";

  const now = Date.now();

  return {
    id: "workspace_seed_1",
    name: "DTaskmanageR Workspace",
    tags: [
      { id: tFE, label: "Frontend" },
      { id: tBE, label: "Backend" },
      { id: tBug, label: "Bugfix" },
      { id: tDoc, label: "Documentation" },
      { id: tDesign, label: "Design" },
    ],
    members: [
      { id: ownerId, name: "A. Owner", email: "owner@workspace.local", role: "Owner" },
      { id: adminId, name: "B. Admin", email: "admin@workspace.local", role: "Admin" },
      { id: memberId, name: "C. Member", email: "member@workspace.local", role: "Member" },
      { id: viewerId, name: "D. Viewer", email: "viewer@workspace.local", role: "Viewer" },
    ],
    nodes: [
      {
        id: mainA,
        parentId: null,
        level: 0,
        title: "Build DTaskmanageR Task Workspace UI",
        description:
          "Create the core task flow: main tasks, nested subtasks (max Level 2), time tracking, tags, and collaboration screens.",
        priority: "High",
        status: "Backlog",
        tags: [tFE, tDesign],
        dueDateISO: "2026-04-02",
        assignee: "A. Owner",
        attachments: [],
        comments: [
          {
            id: id("c"),
            authorName: "B. Admin",
            body: "Let’s keep the hierarchy capped at Level 2 for usability. Also include List/Board/Calendar views.",
            createdAtISO: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
          },
        ],
      },
      {
        id: l1A1,
        parentId: mainA,
        level: 1,
        title: "Implement Board + Drag Workflow",
        description: "Cards should move across Backlog → To Do → In Progress → Completed.",
        priority: "Medium",
        status: "To Do",
        tags: [tBE],
        dueDateISO: "2026-04-05",
        assignee: "C. Member",
        attachments: [],
        comments: [],
      },
      {
        id: l2A1,
        parentId: l1A1,
        level: 2,
        title: "Add status dropdown fallback",
        description: "If drag-drop isn’t available (touch/edge cases), provide a Move action.",
        priority: "Low",
        status: "In Progress",
        tags: [tBug],
        dueDateISO: "2026-04-07",
        assignee: "C. Member",
        attachments: [],
        comments: [],
      },
      {
        id: l1A2,
        parentId: mainA,
        level: 1,
        title: "Time Tracking UX (Start/Stop + total)",
        description: "Users can start/stop timer per task/subtask, with totals persisted across sessions.",
        priority: "Medium",
        status: "Backlog",
        tags: [tDoc],
        dueDateISO: "2026-04-10",
        assignee: "A. Owner",
        attachments: [],
        comments: [],
      },

      {
        id: mainB,
        parentId: null,
        level: 0,
        title: "Workspace Collaboration + Permissions",
        description:
          "Invite members to the workspace. Gate actions by role (Owner/Admin/Member/Viewer) and show permission states in the UI.",
        priority: "Medium",
        status: "In Progress",
        tags: [tBE, tDesign],
        dueDateISO: "2026-04-12",
        assignee: "B. Admin",
        attachments: [],
        comments: [],
      },
      {
        id: l1B1,
        parentId: mainB,
        level: 1,
        title: "Members panel (invite + role change)",
        description: "Owner/Admin can invite users and manage roles.",
        priority: "High",
        status: "To Do",
        tags: [tBE],
        dueDateISO: "2026-04-15",
        assignee: "B. Admin",
        attachments: [],
        comments: [],
      },
      {
        id: l1B2,
        parentId: mainB,
        level: 1,
        title: "Tags management (workspace-owned dropdowns)",
        description: "Owner/Admin can create, edit, and delete tags used across tasks/subtasks.",
        priority: "Low",
        status: "Backlog",
        tags: [tDoc],
        dueDateISO: "2026-04-20",
        assignee: "A. Owner",
        attachments: [],
        comments: [],
      },
      {
        id: l2B2,
        parentId: l1B2,
        level: 2,
        title: "Tag UX polish (multi-select)",
        description: "Provide tag multi-select with checkboxes in a dropdown.",
        priority: "Low",
        status: "Backlog",
        tags: [tFE],
        dueDateISO: "2026-04-22",
        assignee: "D. Viewer",
        attachments: [],
        comments: [],
      },
    ],
    globalRunningNodeId: null,
    globalRunningSinceMs: null,
    timeAccumulatedMsByNodeId: {
      [mainA]: 1000 * 60 * 50, // 50m
      [l1A1]: 1000 * 60 * 25, // 25m
      [l2A1]: 1000 * 60 * 10, // 10m
      [l1A2]: 1000 * 60 * 0,
      [mainB]: 1000 * 60 * 35,
      [l1B1]: 1000 * 60 * 15,
      [l1B2]: 1000 * 60 * 5,
      [l2B2]: 1000 * 60 * 0,
    },
  };
}

