"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  ClipboardList,
  FilePlus,
  LayoutGrid,
  ListTree,
  Plus,
  RotateCcw,
  Search,
  Tag,
  Timer,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  type Attachment,
  type RoleCapabilities,
  type TaskLevel,
  type TaskNode,
  type TaskPriority,
  type TaskStatus,
  type TaskWorkspaceState,
  type WorkspaceMember,
  getRoleCapabilities,
  priorityMeta,
  STATUSES,
  statusMeta,
} from "./dtaskmanageRTypes";
import { loadWorkspaceState, saveWorkspaceState } from "./dtaskmanageRStorage";
import type { WorkspaceTag } from "./dtaskmanageRTypes";
import { createSeedWorkspaceState } from "./dtaskmanageRSeed";

type ViewMode = "list" | "board" | "calendar";
type WorkspaceTab = "tasks" | "workspace" | "tags";

type EditorDraft = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[]; // tag ids
  dueDateISO: string; // "" means empty (date input)
  assignee: string;
  attachments: Attachment[];
};

type EditorTarget =
  | { mode: "create"; level: TaskLevel; parentId: string | null }
  | { mode: "edit"; nodeId: string };

const STORAGE_RESET_CONFIRM_KEY = "__dtaskmanageR_reset_confirmed__";

function safeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function parseYYYYMMDDToUTC(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map((n) => Number(n));
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function formatYYYYMMDD(yyyyMmDd: string | null): string {
  if (!yyyyMmDd) return "—";
  try {
    const dt = parseYYYYMMDDToUTC(yyyyMmDd);
    return dt.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return yyyyMmDd;
  }
}

function startOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}

function isoToLocalDateKeyUTC(yyyyMmDd: string): string {
  // Keep as-is since we already store YYYY-MM-DD.
  return yyyyMmDd;
}

function nodeLevelLabel(level: TaskLevel) {
  if (level === 0) return "Main Task";
  if (level === 1) return "Subtask (L1)";
  return "Subtask (L2)";
}

function computeCanShowEditor(roleCaps: RoleCapabilities) {
  return roleCaps.canView; // editor buttons are gated by canEdit inside editor actions
}

function clampHierarchyLevel(targetLevel: TaskLevel, parentLevel: TaskLevel | null): TaskLevel {
  // UI guarantee: only allow Task(0) -> Subtask(1) -> Subtask(2).
  if (targetLevel === 0) return 0;
  if (targetLevel === 1 && parentLevel === 0) return 1;
  if (targetLevel === 2 && parentLevel === 1) return 2;
  return 1; // fallback to safe level if corrupted state exists
}

function computeDefaultDraft(): EditorDraft {
  return {
    title: "",
    description: "",
    priority: "Low",
    status: "Backlog",
    tags: [],
    dueDateISO: "",
    assignee: "",
    attachments: [],
  };
}

function getNodeDisplayedTotalMs(args: {
  nodeId: string;
  state: TaskWorkspaceState;
  nowMs: number;
}): number {
  const base = args.state.timeAccumulatedMsByNodeId[args.nodeId] ?? 0;
  if (args.state.globalRunningNodeId === args.nodeId && args.state.globalRunningSinceMs) {
    return base + Math.max(0, args.nowMs - args.state.globalRunningSinceMs);
  }
  return base;
}

function getNodeSubtreeRoot(args: { nodesById: Map<string, TaskNode>; nodeId: string }): TaskNode | null {
  const node = args.nodesById.get(args.nodeId);
  if (!node) return null;
  if (node.level === 0) return node;
  // Walk up until level=0
  let cur: TaskNode | undefined = node;
  while (cur && cur.level !== 0 && cur.parentId) {
    cur = args.nodesById.get(cur.parentId);
  }
  return cur ?? null;
}

function TagMultiSelect(props: {
  disabled?: boolean;
  availableTags: WorkspaceTag[];
  selectedTagIds: string[];
  onChange: (next: string[]) => void;
}) {
  const { disabled, availableTags, selectedTagIds, onChange } = props;
  const selectedLabels = availableTags
    .filter((t) => selectedTagIds.includes(t.id))
    .map((t) => t.label);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-between"
        >
          <span className="truncate text-left">
            {selectedLabels.length ? selectedLabels.join(", ") : "Select tags"}
          </span>
          <Tag className="h-4 w-4 opacity-70 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[320px] max-w-[90vw]">
        <div className="px-2 py-1 text-xs text-gray-500">Workspace-owned dropdown</div>
        <DropdownMenuSeparator />
        {availableTags.length === 0 ? (
          <div className="px-2 py-2 text-sm text-gray-500">No tags yet.</div>
        ) : (
          availableTags.map((t) => {
            const checked = selectedTagIds.includes(t.id);
            return (
              <DropdownMenuCheckboxItem
                key={t.id}
                checked={checked}
                disabled={disabled}
                onCheckedChange={(next) => {
                  // Radix uses boolean | "indeterminate"
                  const isChecked = next === true;
                  if (isChecked) {
                    onChange(Array.from(new Set([...selectedTagIds, t.id])));
                  } else {
                    onChange(selectedTagIds.filter((x) => x !== t.id));
                  }
                }}
              >
                <span className="truncate">{t.label}</span>
              </DropdownMenuCheckboxItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-gray-500">
          Tip: Tags apply to Task + Subtasks.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FullscreenModal(props: {
  open: boolean;
  onClose: () => void;
  variant?: "detail" | "editor";
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
}) {
  const {
    open,
    onClose,
    variant = "detail",
    title,
    description,
    children,
    footer,
    contentClassName,
  } = props;

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    try {
      // Prevent background scroll while modal is open (fixes scroll jump issues).
      body.style.overflow = "hidden";
      // Avoid layout shift when scrollbar disappears.
      body.style.paddingRight = prevPaddingRight;
    } catch {
      // ignore
    }

    return () => {
      try {
        body.style.overflow = prevOverflow;
        body.style.paddingRight = prevPaddingRight;
      } catch {
        // ignore
      }
    };
  }, [open]);

  if (!open) return null;

  const modalClassName =
    variant === "editor"
      ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl h-[85vh]"
      : "absolute inset-2 md:inset-5 lg:inset-8";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className={`${modalClassName} bg-white rounded-2xl border shadow-2xl flex flex-col overflow-hidden`}
      >
        <div className="border-b px-4 md:px-6 py-3 md:py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-gray-900">{title}</div>
            {description ? <div className="text-sm text-gray-600 mt-1">{description}</div> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className={["flex-1 overflow-auto px-4 md:px-6 py-4", contentClassName ?? ""].join(" ")}>
          {children}
        </div>

        {footer ? <div className="border-t px-4 md:px-6 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = statusMeta[status];
  return (
    <Badge className={meta.badgeClass} variant="secondary" asChild={false}>
      <span className={`inline-block w-2 h-2 rounded-full ${meta.dotClass} mr-2`} />
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = priorityMeta[priority];
  return (
    <Badge className={meta.badgeClass} variant="secondary">
      <span className={`inline-block w-2 h-2 rounded-full ${meta.dotClass} mr-2`} />
      {priority}
    </Badge>
  );
}

export default function DTaskmanageRWorkspacePage() {
  const [workspace, setWorkspace] = useState<TaskWorkspaceState>(() => loadWorkspaceState());

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    try {
      const raw = window.localStorage.getItem("dtaskmanageR.activeMemberId.v1");
      if (raw) return raw;
    } catch {
      // ignore
    }
    return workspace.members[0]?.id ?? "m_owner";
  });

  // View + internal UI state
  const [tab, setTab] = useState<WorkspaceTab>("tasks");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [query, setQuery] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorTarget | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState<EditorDraft>(() => computeDefaultDraft());

  const [activeNodeIdInDetail, setActiveNodeIdInDetail] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<string>("");

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const runningNodeId = workspace.globalRunningNodeId;

  // Only rerender time displays while a timer is running.
  useEffect(() => {
    if (runningNodeId) {
      setNowMs(Date.now());
      const t = setInterval(() => setNowMs(Date.now()), 1000);
      return () => clearInterval(t);
    }
    setNowMs(Date.now());
  }, [runningNodeId]);

  const activeMember: WorkspaceMember | undefined = useMemo(() => {
    return workspace.members.find((m) => m.id === activeMemberId) ?? workspace.members[0];
  }, [activeMemberId, workspace.members]);

  const roleCaps = useMemo(() => getRoleCapabilities(activeMember?.role ?? "Viewer"), [activeMember]);

  useEffect(() => {
    saveWorkspaceState(workspace);
  }, [workspace]);

  useEffect(() => {
    try {
      window.localStorage.setItem("dtaskmanageR.activeMemberId.v1", activeMemberId);
    } catch {
      // ignore
    }
  }, [activeMemberId]);

  const nodesById = useMemo(() => new Map(workspace.nodes.map((n) => [n.id, n])), [workspace.nodes]);
  const childrenByParentId = useMemo(() => {
    const map = new Map<string | null, TaskNode[]>();
    for (const n of workspace.nodes) {
      const key = n.parentId ?? null;
      const arr = map.get(key) ?? [];
      arr.push(n);
      map.set(key, arr);
    }
    // Keep level-1 and level-2 items stable in display order
    for (const [k, arr] of map.entries()) {
      map.set(
        k,
        [...arr].sort((a, b) => {
          // Prefer status ordering then title for predictable UX
          const sA = STATUSES.indexOf(a.status);
          const sB = STATUSES.indexOf(b.status);
          if (sA !== sB) return sA - sB;
          return a.title.localeCompare(b.title);
        }),
      );
    }
    return map;
  }, [workspace.nodes]);

  const mainTasks = useMemo(() => workspace.nodes.filter((n) => n.level === 0), [workspace.nodes]);

  const availableTags = workspace.tags;

  const filteredMainTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tagSet = new Set(selectedTagIds);

    return mainTasks.filter((t) => {
      const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const matchesTags = tagSet.size === 0 || t.tags.some((id) => tagSet.has(id));
      return matchesQuery && matchesTags;
    });
  }, [mainTasks, query, selectedTagIds]);

  const editorStateMeta = useMemo(() => {
    if (!editor) return null;
    if (editor.mode === "edit") {
      const node = nodesById.get(editor.nodeId);
      if (!node) return null;
      return { level: node.level, parentId: node.parentId };
    }
    return { level: editor.level, parentId: editor.parentId };
  }, [editor, nodesById]);

  const canShowEditor = computeCanShowEditor(roleCaps);

  function openCreateEditorForLevel(level: TaskLevel, parentId: string | null) {
    if (!canShowEditor) return;
    const parent = parentId ? nodesById.get(parentId) : null;
    const parentLevel = parent?.level ?? null;
    const nextLevel = clampHierarchyLevel(level, parentLevel as TaskLevel | null);

    setEditor({ mode: "create", level: nextLevel, parentId });
    setEditorDraft({
      ...computeDefaultDraft(),
      assignee: activeMember?.name ?? "",
      // For subtasks, default status is the same as the workspace planning stage.
      status: "Backlog",
      priority: "Low",
    });
    setEditorOpen(true);
  }

  function openEditEditorForNode(nodeId: string) {
    if (!canShowEditor) return;
    const node = nodesById.get(nodeId);
    if (!node) return;
    setEditor({ mode: "edit", nodeId });
    setEditorDraft({
      title: node.title,
      description: node.description,
      priority: node.priority,
      status: node.status,
      tags: node.tags,
      dueDateISO: node.dueDateISO ?? "",
      assignee: node.assignee,
      attachments: node.attachments,
    });
    setEditorOpen(true);
  }

  function updateNode(nodeId: string, updater: (prev: TaskNode) => TaskNode) {
    setWorkspace((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? updater(n) : n)),
    }));
  }

  function startOrStopTimer(nodeId: string) {
    if (!roleCaps.canEdit) return;
    const currentMs = Date.now();

    setWorkspace((prev) => {
      const isRunningThisNode = prev.globalRunningNodeId === nodeId;
      const runningSince = prev.globalRunningSinceMs;

      // If currently running this node -> stop it.
      if (isRunningThisNode && runningSince) {
        const elapsedMs = Math.max(0, currentMs - runningSince);
        const base = prev.timeAccumulatedMsByNodeId[nodeId] ?? 0;
        return {
          ...prev,
          globalRunningNodeId: null,
          globalRunningSinceMs: null,
          timeAccumulatedMsByNodeId: {
            ...prev.timeAccumulatedMsByNodeId,
            [nodeId]: base + elapsedMs,
          },
        };
      }

      // Otherwise start tracking this node (stopping any previous run first).
      const nextAccum = { ...prev.timeAccumulatedMsByNodeId };
      if (prev.globalRunningNodeId && prev.globalRunningSinceMs) {
        const prevNodeId = prev.globalRunningNodeId;
        const elapsedPrevMs = Math.max(0, currentMs - prev.globalRunningSinceMs);
        const basePrev = nextAccum[prevNodeId] ?? 0;
        nextAccum[prevNodeId] = basePrev + elapsedPrevMs;
      }

      return {
        ...prev,
        globalRunningNodeId: nodeId,
        globalRunningSinceMs: currentMs,
        timeAccumulatedMsByNodeId: nextAccum,
      };
    });
  }

  function moveMainTaskStatus(taskId: string, newStatus: TaskStatus) {
    if (!roleCaps.canEdit) return;
    updateNode(taskId, (prev) => ({ ...prev, status: newStatus }));
  }

  function handleDropOnStatus(status: TaskStatus, dataTransfer: DataTransfer | null) {
    if (!roleCaps.canEdit || !dataTransfer) return;
    const taskId = dataTransfer.getData("text/dtaskmanageR-nodeId");
    if (!taskId) return;
    const node = nodesById.get(taskId);
    if (!node || node.level !== 0) return;
    moveMainTaskStatus(taskId, status);
  }

  function resetWorkspaceUI() {
    // Avoid accidental resets: first click needs confirmation.
    const alreadyConfirmed = window.localStorage.getItem(STORAGE_RESET_CONFIRM_KEY);
    if (!alreadyConfirmed) {
      window.localStorage.setItem(STORAGE_RESET_CONFIRM_KEY, "1");
      setTimeout(() => {
        try {
          window.localStorage.removeItem(STORAGE_RESET_CONFIRM_KEY);
        } catch {
          // ignore
        }
      }, 3000);
      return;
    }
    setWorkspace(createSeedWorkspaceState());
    setDetailTaskId(null);
    setActiveNodeIdInDetail(null);
    setEditorOpen(false);
    setEditor(null);
    setCommentDraft("");
  }

  const detailMainTask = detailTaskId ? nodesById.get(detailTaskId) : null;

  useEffect(() => {
    if (detailMainTask) {
      setActiveNodeIdInDetail(detailMainTask.id);
    } else {
      setActiveNodeIdInDetail(null);
    }
  }, [detailTaskId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeNodeInDetail = activeNodeIdInDetail ? nodesById.get(activeNodeIdInDetail) ?? null : null;

  function postCommentForActiveNode() {
    if (!activeNodeInDetail) return;
    if (!roleCaps.canComment) return;
    const body = commentDraft.trim();
    if (!body) return;
    const authorName = activeMember?.name ?? "User";
    const newComment = {
      id: safeId("comment"),
      authorName,
      body,
      createdAtISO: new Date().toISOString(),
    };

    updateNode(activeNodeInDetail.id, (prev) => ({
      ...prev,
      comments: [newComment, ...prev.comments],
    }));
    setCommentDraft("");
  }

  function addAttachmentsToNode(nodeId: string, files: FileList | null) {
    if (!roleCaps.canEdit) return;
    if (!files || files.length === 0) return;
    const now = new Date().toISOString();
    const newAttachments: Attachment[] = Array.from(files).map((f) => ({
      id: safeId("att"),
      name: f.name,
      sizeKb: Math.max(1, Math.round(f.size / 1024)),
      addedAtISO: now,
    }));

    updateNode(nodeId, (prev) => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
  }

  function removeAttachment(nodeId: string, attachmentId: string) {
    if (!roleCaps.canEdit) return;
    updateNode(nodeId, (prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attachmentId),
    }));
  }

  function saveEditorDraft() {
    if (!editor || !editorStateMeta) return;
    if (!roleCaps.canEdit) return;

    const title = editorDraft.title.trim();
    if (!title) return;

    const tags = Array.from(new Set(editorDraft.tags));
    const dueDateISO = editorDraft.dueDateISO.trim() ? editorDraft.dueDateISO.trim() : null;
    const attachments = editorDraft.attachments;

    if (editor.mode === "edit") {
      const node = nodesById.get(editor.nodeId);
      if (!node) return;
      updateNode(editor.nodeId, (prev) => ({
        ...prev,
        title,
        description: editorDraft.description.trim(),
        priority: editorDraft.priority,
        status: editorDraft.status,
        tags,
        dueDateISO,
        assignee: editorDraft.assignee.trim(),
        attachments,
      }));
      setEditorOpen(false);
      setEditor(null);
      return;
    }

    // Create
    const parentId = editor.parentId;
    const parentNode = parentId ? nodesById.get(parentId) ?? null : null;
    const parentLevel: TaskLevel | null = parentNode ? parentNode.level : null;
    const safeLevel = clampHierarchyLevel(editorStateMeta.level, parentLevel);

    // Guard: if safeLevel is Level-2, parent must be level-1.
    if (safeLevel === 2 && parentNode?.level !== 1) return;
    // Guard: if safeLevel is Level-1, parent must be level-0.
    if (safeLevel === 1 && parentNode?.level !== 0) return;

    const newNode: TaskNode = {
      id: safeId("node"),
      parentId: safeLevel === 0 ? null : parentId,
      level: safeLevel,
      title,
      description: editorDraft.description.trim(),
      priority: editorDraft.priority,
      status: editorDraft.status,
      tags,
      dueDateISO,
      assignee: editorDraft.assignee.trim() || (activeMember?.name ?? ""),
      attachments,
      comments: [],
    };

    setWorkspace((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setEditorOpen(false);
    setEditor(null);

    // If a new subtask is created under the open main task, keep it selected.
    if (detailTaskId && safeLevel !== 0 && parentId) {
      const root = getNodeSubtreeRoot({ nodesById: new Map([...workspace.nodes, newNode].map((n) => [n.id, n] as const)), nodeId: parentId });
      if (root?.id !== detailTaskId) {
        // no-op; hierarchy is independent per main task, so this should not happen
      }
    }
  }

  function TaskRow(props: { node: TaskNode; depth: number }) {
    const { node, depth } = props;
    const totalMs = getNodeDisplayedTotalMs({ nodeId: node.id, state: workspace, nowMs });
    const isSelected = activeNodeInDetail?.id === node.id;
    const isRunning = workspace.globalRunningNodeId === node.id;

    const createChildAllowed = roleCaps.canEdit && node.level < 2;
    const canStartStop = roleCaps.canEdit;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActiveNodeIdInDetail(node.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setActiveNodeIdInDetail(node.id);
        }}
        className={[
          "rounded-xl border px-3 py-2 transition-colors",
          isSelected ? "border-emerald-300 bg-emerald-50/60" : "bg-white hover:bg-gray-50",
        ].join(" ")}
        style={{ paddingLeft: 12 + depth * 16 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-gray-600 truncate">{nodeLevelLabel(node.level)}</div>
            </div>
            <div className="font-semibold text-gray-900 truncate">{node.title}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={node.status} />
              <PriorityBadge priority={node.priority} />
              {node.dueDateISO && (
                <span className="text-xs text-gray-600 border border-gray-200 rounded-full px-2 py-0.5">
                  Due {formatYYYYMMDD(node.dueDateISO)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <Clock className="h-4 w-4 opacity-70" />
              <span className="font-mono">{formatDuration(totalMs)}</span>
              {isRunning && <span className="text-emerald-700 font-semibold">• live</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canStartStop}
                onClick={(e) => {
                  e.stopPropagation();
                  startOrStopTimer(node.id);
                }}
              >
                {isRunning ? "Stop" : "Start"}
              </Button>

              {node.level < 2 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!createChildAllowed}
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateEditorForLevel((node.level + 1) as TaskLevel, node.id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  {node.level === 0 ? "Subtask" : "Level 2"}
                </Button>
              ) : (
                <span className="text-xs text-gray-400 mt-1">Max Level</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderNodeTree(node: TaskNode, depth: number): React.ReactNode {
    const children = childrenByParentId.get(node.id) ?? [];
    return (
      <div className="space-y-2" key={node.id}>
        <TaskRow node={node} depth={depth} />
        {children.length > 0 && (
          <div className="space-y-2">
            {children
              .filter((c) => c.level === (node.level + 1) as TaskLevel)
              .map((c) => (
                <React.Fragment key={c.id}>{renderNodeTree(c, depth + 1)}</React.Fragment>
              ))}
          </div>
        )}
      </div>
    );
  }

  function TaskEditorSheet() {
    const levelLabel = editorStateMeta ? nodeLevelLabel(editorStateMeta.level) : "Task";

    const isEditorDisabled = !roleCaps.canEdit;
    const saveLabel = editor?.mode === "edit" ? "Save Changes" : "Create";

    return (
      <FullscreenModal
        open={editorOpen}
        variant="editor"
        onClose={() => setEditorOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
            {editor?.mode === "edit" ? "Edit Task" : "New Task"}
          </span>
        }
        description={`${levelLabel}. Task -> Subtask -> Level 2 only (no deeper hierarchy).`}
        contentClassName="w-full"
        footer={
          <>
            <div className="w-full flex items-center gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)} disabled={false}>
                Cancel
              </Button>
              <Button type="button" onClick={saveEditorDraft} disabled={isEditorDisabled}>
                {saveLabel}
              </Button>
            </div>
            {!roleCaps.canEdit && (
              <div className="text-xs text-gray-500 w-full text-right mt-2">
                Your current role cannot edit. Switch roles to test permissions.
              </div>
            )}
          </>
        }
      >
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Task Title</label>
              <Input
                value={editorDraft.title}
                disabled={isEditorDisabled}
                onChange={(e) => setEditorDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="e.g., Implement login permissions"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={editorDraft.description}
                disabled={isEditorDisabled}
                onChange={(e) => setEditorDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="Add details, acceptance criteria, or notes..."
                className="min-h-[110px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <Select
                  value={editorDraft.priority}
                  disabled={isEditorDisabled}
                  onValueChange={(v) => setEditorDraft((d) => ({ ...d, priority: v as TaskPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Low", "Medium", "High"] as TaskPriority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={editorDraft.status}
                  disabled={isEditorDisabled}
                  onValueChange={(v) => setEditorDraft((d) => ({ ...d, status: v as TaskStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tags</label>
              <TagMultiSelect
                disabled={isEditorDisabled}
                availableTags={availableTags}
                selectedTagIds={editorDraft.tags}
                onChange={(next) => setEditorDraft((d) => ({ ...d, tags: next }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                <Input
                  type="date"
                  value={editorDraft.dueDateISO}
                  disabled={isEditorDisabled}
                  onChange={(e) => setEditorDraft((d) => ({ ...d, dueDateISO: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assignee</label>
                <Input
                  value={editorDraft.assignee}
                  disabled={isEditorDisabled}
                  onChange={(e) => setEditorDraft((d) => ({ ...d, assignee: e.target.value }))}
                  placeholder="e.g., C. Member"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-gray-700">Attachments</label>
                <span className="text-xs text-gray-500">{editorDraft.attachments.length} added</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  multiple
                  disabled={isEditorDisabled}
                  onChange={(e) => {
                    addAttachmentsToDraft(e.target.files);
                    // Allow selecting the same file again.
                    e.currentTarget.value = "";
                  }}
                  style={{ display: "none" }}
                  id="__dtaskmanageR_editor_file_input__"
                />

                <Button
                  type="button"
                  variant="outline"
                  disabled={isEditorDisabled}
                  onClick={() => {
                    const el = document.getElementById("__dtaskmanageR_editor_file_input__") as HTMLInputElement | null;
                    el?.click();
                  }}
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Add files (metadata only)
                </Button>

                <div className="text-xs text-gray-500">
                  For UI only; backend upload later.
                </div>
              </div>

              {editorDraft.attachments.length > 0 ? (
                <div className="space-y-2">
                  {editorDraft.attachments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{a.name}</div>
                        <div className="text-xs text-gray-500">{a.sizeKb} KB</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isEditorDisabled}
                        onClick={() => setEditorDraft((d) => ({ ...d, attachments: d.attachments.filter((x) => x.id !== a.id) }))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No attachments yet.</div>
              )}
            </div>
          </div>
      </FullscreenModal>
    );
  }

  // Attachments inside editor draft need separate handler.
  // We reuse addAttachmentsToNode logic shape-wise, but update draft instead.
  // (Kept separate to avoid mixing persisted node updates with draft state.)
  function addAttachmentsToDraft(files: FileList | null) {
    if (!roleCaps.canEdit) return;
    if (!files || files.length === 0) return;
    const now = new Date().toISOString();
    const newAttachments: Attachment[] = Array.from(files).map((f) => ({
      id: safeId("att"),
      name: f.name,
      sizeKb: Math.max(1, Math.round(f.size / 1024)),
      addedAtISO: now,
    }));
    setEditorDraft((d) => ({ ...d, attachments: [...d.attachments, ...newAttachments] }));
  }

  function TaskDetailSheet() {
    const main = detailMainTask;
    if (!main) return null;

    const selectedNode = activeNodeInDetail ?? main;
    const totalSelectedMs = getNodeDisplayedTotalMs({ nodeId: selectedNode.id, state: workspace, nowMs });

    const isRunning = workspace.globalRunningNodeId === selectedNode.id;

    return (
      <FullscreenModal
        open={!!detailTaskId}
        onClose={() => setDetailTaskId(null)}
        title={
          <span className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200">
              <LayoutGrid className="h-5 w-5 text-emerald-700" />
            </span>
            <span className="truncate">{main.title}</span>
          </span>
        }
        description="Main task workspace. Subtasks are capped at Level 2."
        contentClassName="max-w-7xl w-full mx-auto"
        footer={
          <div className="w-full flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">Hierarchy rule: Task to Subtask to Level 2 only.</div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setDetailTaskId(null)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={main.status} />
                <PriorityBadge priority={main.priority} />
                <span className="text-sm text-gray-600 border border-gray-200 rounded-full px-3 py-1">
                  Assignee: <span className="font-semibold">{main.assignee || "—"}</span>
                </span>
                <span className="text-sm text-gray-600 border border-gray-200 rounded-full px-3 py-1">
                  Due: <span className="font-semibold">{formatYYYYMMDD(main.dueDateISO)}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {main.tags.length ? (
                  main.tags.map((tagId) => {
                    const label = workspace.tags.find((t) => t.id === tagId)?.label ?? tagId;
                    return (
                      <Badge key={tagId} variant="outline" className="bg-white">
                        <Tag className="h-3 w-3 mr-1" />
                        {label}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-500">No tags</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Total tracked time for selected:{" "}
                  <span className="font-semibold font-mono text-gray-900">{formatDuration(totalSelectedMs)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!roleCaps.canEdit}
                    onClick={() => openEditEditorForNode(main.id)}
                  >
                    Edit Main Task
                  </Button>
                </div>
              </div>

              <div className="border rounded-2xl p-3 bg-white/60">
                {renderNodeTree(main, 0)}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="border rounded-2xl p-4 bg-gray-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-500">{nodeLevelLabel(selectedNode.level)}</div>
                    <div className="text-base font-bold text-gray-900 truncate">{selectedNode.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={selectedNode.status} />
                      <PriorityBadge priority={selectedNode.priority} />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Due: <span className="font-semibold">{formatYYYYMMDD(selectedNode.dueDateISO)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Assignee: <span className="font-semibold">{selectedNode.assignee || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {selectedNode.tags.length ? (
                    selectedNode.tags.map((tagId) => {
                      const label = workspace.tags.find((t) => t.id === tagId)?.label ?? tagId;
                      return (
                        <Badge key={tagId} variant="outline" className="bg-white">
                          {label}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500">No tags</span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Button
                    type="button"
                    variant={isRunning ? "destructive" : "default"}
                    disabled={!roleCaps.canEdit}
                    onClick={() => startOrStopTimer(selectedNode.id)}
                    className="w-full justify-center"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    {isRunning ? "Stop Timer" : "Start Timer"}
                  </Button>
                </div>

                <div className="mt-2 text-sm text-gray-600 flex items-center justify-between">
                  <span>Tracked total</span>
                  <span className="font-mono font-semibold text-gray-900">{formatDuration(totalSelectedMs)}</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!roleCaps.canEdit}
                    onClick={() => openEditEditorForNode(selectedNode.id)}
                  >
                    Edit fields
                  </Button>
                </div>
              </div>

              <div className="border rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-700" />
                    <div className="font-semibold text-sm">Attachments</div>
                  </div>
                  <span className="text-xs text-gray-500">{selectedNode.attachments.length}</span>
                </div>

                <div className="mt-3 space-y-2">
                  {selectedNode.attachments.length === 0 ? (
                    <div className="text-sm text-gray-500">No attachments yet.</div>
                  ) : (
                    selectedNode.attachments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2 bg-white">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{a.name}</div>
                          <div className="text-xs text-gray-500">{a.sizeKb} KB</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={!roleCaps.canEdit}
                          onClick={() => removeAttachment(selectedNode.id, a.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3">
                  <input
                    type="file"
                    multiple
                    disabled={!roleCaps.canEdit}
                    onChange={(e) => addAttachmentsToNode(selectedNode.id, e.target.files)}
                  />
                  <div className="text-xs text-gray-500 mt-1">UI-only: saves file metadata.</div>
                </div>
              </div>

              <div className="border rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-700" />
                    <div className="font-semibold text-sm">Comments</div>
                  </div>
                  {roleCaps.canComment ? null : (
                    <span className="text-xs text-gray-500">View-only</span>
                  )}
                </div>

                <div className="mt-3 space-y-3">
                  {selectedNode.comments.length === 0 ? (
                    <div className="text-sm text-gray-500">No comments yet.</div>
                  ) : (
                    selectedNode.comments.map((c) => (
                      <div key={c.id} className="border rounded-xl p-3 bg-white">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold">{c.authorName}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(c.createdAtISO).toLocaleString("en-PH")}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{c.body}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <Textarea
                    value={commentDraft}
                    disabled={!roleCaps.canComment}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder={roleCaps.canComment ? "Write a comment..." : "Your role cannot comment."}
                    className="min-h-[90px]"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-500">
                      Commenting is permission-gated by role.
                    </div>
                    <Button
                      type="button"
                      onClick={postCommentForActiveNode}
                      disabled={!roleCaps.canComment || commentDraft.trim().length === 0}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </FullscreenModal>
    );
  }

  function WorkspaceMembersPanel() {
    const canManage = roleCaps.canManageUsers;

    const [inviteName, setInviteName] = useState<string>("");
    const [inviteEmail, setInviteEmail] = useState<string>("");
    const [inviteRole, setInviteRole] = useState<string>("Member");

    function inviteMember() {
      if (!canManage) return;
      const name = inviteName.trim();
      const email = inviteEmail.trim();
      if (!name || !email) return;

      setWorkspace((prev) => {
        if (prev.members.some((m) => m.email.toLowerCase() === email.toLowerCase())) return prev;
        const nextMember: WorkspaceMember = {
          id: safeId("m"),
          name,
          email,
          role: inviteRole as WorkspaceMember["role"],
        };
        return { ...prev, members: [...prev.members, nextMember] };
      });
      setInviteName("");
      setInviteEmail("");
      setInviteRole("Member");
    }

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-700" />
              Workspace Members
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Invite users and assign permissions (Owner/Admin/Member/Viewer).
            </div>
          </div>
          <Badge variant="outline" className="bg-white">
            Current role: <span className="font-semibold ml-2">{activeMember?.role}</span>
          </Badge>
        </div>

        <div className="border rounded-2xl p-4 bg-white/70">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-sm">Invite member</div>
            {!canManage && <span className="text-xs text-gray-500">Only Owner/Admin can invite</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <Input
              disabled={!canManage}
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Name"
            />
            <Input
              disabled={!canManage}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email"
            />
            <Select
              value={inviteRole}
              disabled={!canManage}
              onValueChange={(v) => setInviteRole(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Owner", "Admin", "Member", "Viewer"] as WorkspaceMember["role"][]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button type="button" onClick={inviteMember} disabled={!canManage}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </div>

        <div className="border rounded-2xl p-4 bg-white/70">
          <div className="font-semibold text-sm mb-3">Members</div>
          <div className="space-y-2">
            {workspace.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 border rounded-xl px-3 py-2 bg-white">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{m.name}</div>
                  <div className="text-xs text-gray-500 truncate">{m.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={m.role} disabled={!canManage} onValueChange={(v) => {
                    const role = v as WorkspaceMember["role"];
                    setWorkspace((prev) => ({
                      ...prev,
                      members: prev.members.map((x) => (x.id === m.id ? { ...x, role } : x)),
                    }));
                    if (m.id === activeMemberId) setActiveMemberId(m.id);
                  }}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["Owner", "Admin", "Member", "Viewer"] as WorkspaceMember["role"][]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function WorkspaceTagsPanel() {
    const canManage = roleCaps.canManageTags;
    const [tagLabel, setTagLabel] = useState<string>("");

    function addTag() {
      if (!canManage) return;
      const label = tagLabel.trim();
      if (!label) return;
      const normalized = label.toLowerCase();
      if (workspace.tags.some((t) => t.label.toLowerCase() === normalized)) return;
      const newTag: WorkspaceTag = { id: safeId("tag"), label };
      setWorkspace((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      setTagLabel("");
    }

    function deleteTag(tagId: string) {
      if (!canManage) return;
      setWorkspace((prev) => {
        const nextTags = prev.tags.filter((t) => t.id !== tagId);
        const nextNodes = prev.nodes.map((n) => ({ ...n, tags: n.tags.filter((id) => id !== tagId) }));
        return { ...prev, tags: nextTags, nodes: nextNodes };
      });
    }

    function renameTag(tagId: string, nextLabel: string) {
      if (!canManage) return;
      const label = nextLabel.trim();
      if (!label) return;
      setWorkspace((prev) => ({
        ...prev,
        tags: prev.tags.map((t) => (t.id === tagId ? { ...t, label } : t)),
      }));
    }

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-emerald-700" />
              Tags Management
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Tags are workspace-owned dropdown values used across Tasks and Subtasks.
            </div>
          </div>
          <Badge variant="outline" className="bg-white">
            Only Owner/Admin can manage
          </Badge>
        </div>

        <div className="border rounded-2xl p-4 bg-white/70">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-sm">Add a tag</div>
            {!canManage && <span className="text-xs text-gray-500">Read-only</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <Input
              disabled={!canManage}
              value={tagLabel}
              onChange={(e) => setTagLabel(e.target.value)}
              placeholder="e.g., Mobile UX"
            />
            <div className="sm:col-span-2 flex items-center justify-end">
              <Button type="button" onClick={addTag} disabled={!canManage}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Tip: Updating tags immediately updates dropdown options in task editors.
          </div>
        </div>

        <div className="border rounded-2xl p-4 bg-white/70">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-sm">Existing tags</div>
            <div className="text-xs text-gray-500">{workspace.tags.length} total</div>
          </div>
          <div className="mt-3 space-y-2">
            {workspace.tags.length === 0 ? (
              <div className="text-sm text-gray-500">No tags yet.</div>
            ) : (
              workspace.tags.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 border rounded-xl px-3 py-2 bg-white">
                  <div className="flex items-center gap-2 min-w-[180px]">
                    <Badge variant="outline" className="bg-white">
                      {t.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <Input
                      disabled={!canManage}
                      value={t.label}
                      onChange={(e) => renameTag(t.id, e.target.value)}
                      className="w-[220px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!canManage}
                      onClick={() => deleteTag(t.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  function BoardView() {
    const columns = STATUSES;

    // Computed each render: small dataset, keeps hook dependencies error-free.
    const tasksByStatus = new Map<TaskStatus, TaskNode[]>();
    for (const s of columns) tasksByStatus.set(s, []);
    for (const t of filteredMainTasks) {
      const arr = tasksByStatus.get(t.status) ?? [];
      arr.push(t);
      tasksByStatus.set(t.status, arr);
    }
    for (const [k, arr] of tasksByStatus.entries()) {
      tasksByStatus.set(
        k,
        [...arr].sort((a, b) => a.dueDateISO?.localeCompare(b.dueDateISO ?? "") ?? 0),
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {columns.map((col) => (
            <div
              key={col}
              className="border rounded-2xl bg-white/60 overflow-hidden"
              onDragOver={(e) => {
                if (!roleCaps.canEdit) return;
                e.preventDefault();
              }}
              onDrop={(e) => handleDropOnStatus(col, e.dataTransfer)}
            >
              <div className="p-3 border-b bg-white/70">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusMeta[col].dotClass}`} />
                    {col}
                  </div>
                  <span className="text-xs text-gray-500">{tasksByStatus.get(col)?.length ?? 0}</span>
                </div>
              </div>
              <div className="p-3 space-y-3 min-h-[240px]">
                {(tasksByStatus.get(col) ?? []).map((t) => {
                  const totalMs = getNodeDisplayedTotalMs({ nodeId: t.id, state: workspace, nowMs });
                  const isRunning = workspace.globalRunningNodeId === t.id;
                  return (
                    <div
                      key={t.id}
                      draggable={roleCaps.canEdit}
                      onDragStart={(e) => {
                        if (!roleCaps.canEdit) return;
                        e.dataTransfer.setData("text/dtaskmanageR-nodeId", t.id);
                      }}
                      className={[
                        "border rounded-xl p-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer",
                        detailTaskId === t.id ? "border-emerald-300" : "border-gray-200",
                      ].join(" ")}
                      onClick={() => setDetailTaskId(t.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setDetailTaskId(t.id);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{t.title}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {t.description}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={t.priority} />
                        <span className="text-xs text-gray-600 border border-gray-200 rounded-full px-2 py-0.5">
                          Due {formatYYYYMMDD(t.dueDateISO)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {t.tags.slice(0, 2).map((tagId) => {
                          const label = workspace.tags.find((x) => x.id === tagId)?.label ?? tagId;
                          return (
                            <Badge key={tagId} variant="outline" className="bg-white">
                              {label}
                            </Badge>
                          );
                        })}
                        {t.tags.length > 2 && (
                          <Badge variant="outline" className="bg-white">
                            +{t.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-gray-600 flex items-center justify-between">
                        <span className="truncate">Assignee: {t.assignee || "—"}</span>
                        <span className="font-mono">
                          <Clock className="h-4 w-4 inline mr-1 opacity-70" /> {formatDuration(totalMs)}
                          {isRunning ? " • live" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {filteredMainTasks.filter((t) => t.status === col).length === 0 && (
                  <div className="text-sm text-gray-400">
                    Drop tasks here or create one.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!roleCaps.canEdit && (
          <div className="text-xs text-gray-500">
            Dragging is disabled for your role. Switch roles to test moving tasks.
          </div>
        )}
      </div>
    );
  }

  function ListView() {
    return (
      <div className="space-y-3">
        <div className="border rounded-2xl bg-white/70">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  {["Task", "Status", "Priority", "Due", "Assignee", "Tags", "Time"].map((h) => (
                    <th key={h} className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMainTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No tasks match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredMainTasks.map((t) => {
                    const totalMs = getNodeDisplayedTotalMs({ nodeId: t.id, state: workspace, nowMs });
                    return (
                      <tr
                        key={t.id}
                        className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setDetailTaskId(t.id)}
                        role="button"
                      >
                        <td className="p-3">
                          <div className="font-semibold text-gray-900">{t.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-2">{t.description}</div>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="p-3">
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td className="p-3 text-gray-700">{formatYYYYMMDD(t.dueDateISO)}</td>
                        <td className="p-3 text-gray-700">{t.assignee || "—"}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {t.tags.slice(0, 2).map((tagId) => {
                              const label = workspace.tags.find((x) => x.id === tagId)?.label ?? tagId;
                              return (
                                <Badge key={tagId} variant="outline" className="bg-white">
                                  {label}
                                </Badge>
                              );
                            })}
                            {t.tags.length > 2 && (
                              <Badge variant="outline" className="bg-white">
                                +{t.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono">{formatDuration(totalMs)}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function CalendarView() {
    const todayKey = isoToLocalDateKeyUTC(
      `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, "0")}-${String(
        new Date().getUTCDate(),
      ).padStart(2, "0")}`,
    );

    const [monthCursorUTC, setMonthCursorUTC] = useState<Date>(() => new Date());
    const monthStart = startOfMonthUTC(monthCursorUTC);
    const monthEnd = endOfMonthUTC(monthCursorUTC);

    const daysInMonth = monthEnd.getUTCDate();
    const startWeekday = monthStart.getUTCDay(); // 0 (Sun) .. 6
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    // Computed each render: calendar dataset is small and it avoids hook warnings.
    const tasksByDayKey = new Map<string, TaskNode[]>();
    for (const t of filteredMainTasks) {
      if (!t.dueDateISO) continue;
      if (!tasksByDayKey.has(t.dueDateISO)) tasksByDayKey.set(t.dueDateISO, []);
      tasksByDayKey.get(t.dueDateISO)!.push(t);
    }
    for (const [k, arr] of tasksByDayKey.entries()) {
      tasksByDayKey.set(
        k,
        [...arr].sort((a, b) => {
          const sA = STATUSES.indexOf(a.status);
          const sB = STATUSES.indexOf(b.status);
          if (sA !== sB) return sA - sB;
          return b.priority.localeCompare(a.priority);
        }),
      );
    }

    const cells = Array.from({ length: totalCells }, (_, idx) => {
      const dayNum = idx - startWeekday + 1;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      if (!inMonth) return null;
      const dt = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), dayNum));
      const key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(
        dt.getUTCDate(),
      ).padStart(2, "0")}`;
      return { key, dayNum };
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white">
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar View
            </Badge>
            <div className="text-sm text-gray-600">
              {monthCursorUTC.toLocaleString("en-PH", { month: "long", year: "numeric", timeZone: "UTC" })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMonthCursorUTC((d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)))}
            >
              Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMonthCursorUTC((d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)))}
            >
              Next
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMonthCursorUTC(new Date())}
            >
              Today
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-xs text-gray-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-semibold">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, idx) => {
            if (!cell) return <div key={idx} className="h-28 bg-gray-50 rounded-xl border" />;
            const tasks = tasksByDayKey.get(cell.key) ?? [];
            const isToday = cell.key === todayKey;

            return (
              <div
                key={cell.key}
                className={[
                  "rounded-xl border bg-white p-2 h-28 overflow-hidden",
                  isToday ? "border-emerald-300 ring-1 ring-emerald-200" : "border-gray-200",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-700">{cell.dayNum}</div>
                  {tasks.length > 0 ? (
                    <Badge variant="outline" className="bg-white">
                      {tasks.length}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-2 space-y-1">
                  {tasks.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      className="w-full text-left px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      onClick={() => setDetailTaskId(t.id)}
                      type="button"
                    >
                      <div className="text-xs font-medium truncate">{t.title}</div>
                      <div className="text-[11px] text-gray-600 truncate">{t.status}</div>
                    </button>
                  ))}
                  {tasks.length > 3 && (
                    <div className="text-xs text-gray-500">+{tasks.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function TasksToolbar() {
    return (
      <div className="border rounded-2xl bg-white/70 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200">
                <ClipboardList className="h-4 w-4 text-emerald-700" />
              </span>
              <span className="font-semibold">DTaskmanageR Task Workspace</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Create main tasks, add subtasks (max Level 2), track time, and collaborate via role permissions.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-auto">
              <Select
                value={activeMemberId}
                onValueChange={(v) => setActiveMemberId(v)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Switch role (demo)" />
                </SelectTrigger>
                <SelectContent>
                  {workspace.members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={viewMode === "list" ? "secondary" : "outline"}
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <ListTree className="h-4 w-4" />
                List
              </Button>
              <Button
                type="button"
                variant={viewMode === "board" ? "secondary" : "outline"}
                onClick={() => setViewMode("board")}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Board
              </Button>
              <Button
                type="button"
                variant={viewMode === "calendar" ? "secondary" : "outline"}
                onClick={() => setViewMode("calendar")}
                className="gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                Calendar
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetWorkspaceUI}
                className="gap-2"
                title="Create a fresh demo workspace (client-only UI data)"
              >
                <RotateCcw className="h-4 w-4" />
                New Workspace
              </Button>
              <Button
                type="button"
                onClick={() => openCreateEditorForLevel(0, null)}
                disabled={!roleCaps.canEdit}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 border rounded-xl bg-white px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks..."
              className="border-0 p-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="lg:col-span-2">
            <TagMultiSelect
              availableTags={availableTags}
              selectedTagIds={selectedTagIds}
              onChange={(next) => setSelectedTagIds(next)}
            />
          </div>
        </div>

        {workspace.globalRunningNodeId ? (
          <div className="mt-4 flex items-center justify-between gap-3 border rounded-2xl px-4 py-3 bg-emerald-50/40">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white">
                <Timer className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-gray-900">Time tracking active</div>
                <div className="text-xs text-gray-600">
                  Tracking: <span className="font-semibold">{nodesById.get(workspace.globalRunningNodeId)?.title ?? "—"}</span>
                </div>
              </div>
            </div>
            <div className="text-sm font-mono text-gray-900">
              {formatDuration(getNodeDisplayedTotalMs({ nodeId: workspace.globalRunningNodeId, state: workspace, nowMs }))}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs text-gray-500">
            No timer running. Use Start/Stop in a task/subtask row.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] p-4 md:p-6 lg:p-8 bg-gradient-to-b from-white to-gray-50">
      <Tabs value={tab} onValueChange={(v) => setTab(v as WorkspaceTab)}>
        <TabsList className="bg-white/80 border rounded-2xl px-2 py-2 mb-4 flex flex-wrap">
          <TabsTrigger value="tasks" className="px-4">
            <ClipboardList className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="workspace" className="px-4">
            <Users className="h-4 w-4 mr-2" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="tags" className="px-4">
            <Tag className="h-4 w-4 mr-2" />
            Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="space-y-4">
            <TasksToolbar />

            {viewMode === "list" && <ListView />}
            {viewMode === "board" && <BoardView />}
            {viewMode === "calendar" && <CalendarView />}
          </div>
        </TabsContent>

        <TabsContent value="workspace">
          <div className="py-2">
            <WorkspaceMembersPanel />
          </div>
        </TabsContent>

        <TabsContent value="tags">
          <div className="py-2">
            <WorkspaceTagsPanel />
          </div>
        </TabsContent>
      </Tabs>

      <TaskDetailSheet />
      <TaskEditorSheet />
    </div>
  );
}

