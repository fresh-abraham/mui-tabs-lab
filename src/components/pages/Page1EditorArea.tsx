import * as React from "react";
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import type { EditorGroup, EditorTab, WorkspaceState } from "../../types";

const makeId = () => crypto.randomUUID();

type DropHint = "none" | "left" | "right" | "center";

type DragPayload = {
  tabId: string;
  fromGroupId: string;
};

function ClosableTabLabel({
  label,
  onClose,
}: {
  label: string;
  onClose: (e: React.MouseEvent) => void;
}) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <span>{label}</span>
      <IconButton
        component="span"
        size="small"
        onClick={onClose}
        onMouseDown={(e) => e.stopPropagation()}
        sx={{ ml: 0.5 }}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
}

function getDropHint(e: React.DragEvent, rect: DOMRect): DropHint {
  const x = e.clientX - rect.left;
  const ratio = x / rect.width;

  if (ratio < 0.25) return "left";
  if (ratio > 0.75) return "right";
  return "center";
}

function extractDragPayload(e: React.DragEvent): DragPayload | null {
  const raw = e.dataTransfer.getData("application/x-vscode-tab");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

export default function EditorArea({
  editorGroups,
  activeGroupId,
  onChange,
}: {
  editorGroups: EditorGroup[];
  activeGroupId: string;
  onChange: (patch: Partial<WorkspaceState>) => void;
}) {
  const [hover, setHover] = React.useState<{ groupId: string; hint: DropHint } | null>(null);

  const groups = editorGroups.length ? editorGroups : [];
  const activeGroup =
    groups.find((g) => g.id === activeGroupId) ?? groups[0];

  // ---------- Actions ----------
  const setActiveGroup = (id: string) => onChange({ activeEditorGroupId: id });

  const setActiveTab = (groupId: string, tabId: string) => {
    const next = groups.map((g) => (g.id === groupId ? { ...g, activeTabId: tabId } : g));
    onChange({ editorGroups: next, activeEditorGroupId: groupId });
  };

  const addTabToGroup = (groupId: string) => {
    const id = makeId();
    const next = groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            tabs: [...g.tabs, { id, label: `Tab ${g.tabs.length + 1}`, state: { counter: 0 } }],
            activeTabId: id,
          }
        : g
    );
    onChange({ editorGroups: next, activeEditorGroupId: groupId });
  };

  const duplicateTabInGroup = (groupId: string) => {
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    const active = g.tabs.find((t) => t.id === g.activeTabId) ?? g.tabs[0];
    if (!active) return;

    const id = makeId();
    const cloned: EditorTab = { id, label: `${active.label} Kopie`, state: structuredClone(active.state) };

    const next = groups.map((x) =>
      x.id === groupId ? { ...x, tabs: [...x.tabs, cloned], activeTabId: id } : x
    );
    onChange({ editorGroups: next, activeEditorGroupId: groupId });
  };

  const closeTab = (groupId: string, tabId: string) => {
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    if (g.tabs.length === 1) return;

    const idx = g.tabs.findIndex((t) => t.id === tabId);
    const nextTabs = g.tabs.filter((t) => t.id !== tabId);

    const nextActive = tabId === g.activeTabId
      ? (nextTabs[Math.max(0, idx - 1)] ?? nextTabs[0]).id
      : g.activeTabId;

    const next = groups.map((x) => (x.id === groupId ? { ...x, tabs: nextTabs, activeTabId: nextActive } : x));
    onChange({ editorGroups: next, activeEditorGroupId: groupId });
  };

  const incrementCounter = () => {
    const g = activeGroup;
    const next = groups.map((x) => {
      if (x.id !== g.id) return x;
      return {
        ...x,
        tabs: x.tabs.map((t) =>
          t.id === x.activeTabId ? { ...t, state: { ...t.state, counter: t.state.counter + 1 } } : t
        ),
      };
    });
    onChange({ editorGroups: next });
  };

  // ---------- Drag & Drop ----------
  const onDragStartTab = (fromGroupId: string, tabId: string) => (e: React.DragEvent) => {
    const payload: DragPayload = { tabId, fromGroupId };
    e.dataTransfer.setData("application/x-vscode-tab", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOverGroup = (groupId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const hint = getDropHint(e, rect);
    setHover({ groupId, hint });
    e.dataTransfer.dropEffect = "move";
  };

  const onDragLeaveGroup = (groupId: string) => () => {
    setHover((h) => (h?.groupId === groupId ? null : h));
  };

  const onDropGroup = (toGroupId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const payload = extractDragPayload(e);
    setHover(null);
    if (!payload) return;

    const { tabId, fromGroupId } = payload;
    const fromGroup = groups.find((g) => g.id === fromGroupId);
    if (!fromGroup) return;

    const tab = fromGroup.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const hint = getDropHint(e, rect);

    // remove from source group
    const fromIdx = fromGroup.tabs.findIndex((t) => t.id === tabId);
    const fromTabsAfter = fromGroup.tabs.filter((t) => t.id !== tabId);

    // if we removed the active tab, choose fallback
    const fromActiveAfter =
      fromGroup.activeTabId === tabId
        ? (fromTabsAfter[Math.max(0, fromIdx - 1)] ?? fromTabsAfter[0])?.id ?? ""
        : fromGroup.activeTabId;

    // helper to replace one group
    const replaceGroup = (arr: EditorGroup[], group: EditorGroup) =>
      arr.map((g) => (g.id === group.id ? group : g));

    // Case 1: Only 1 group and user drops left/right -> split into 2 groups
    if (groups.length === 1 && (hint === "left" || hint === "right")) {
      const remainingGroup: EditorGroup = {
        ...fromGroup,
        tabs: fromTabsAfter.length ? fromTabsAfter : fromGroup.tabs, // safety
        activeTabId: fromTabsAfter.length ? (fromActiveAfter || fromTabsAfter[0].id) : fromGroup.activeTabId,
      };

      const newGroupId = makeId();
      const newGroup: EditorGroup = {
        id: newGroupId,
        tabs: [structuredClone(tab)],
        activeTabId: tab.id,
      };

      const nextGroups = hint === "left" ? [newGroup, remainingGroup] : [remainingGroup, newGroup];

      onChange({
        editorGroups: nextGroups,
        activeEditorGroupId: newGroupId,
      });
      return;
    }

    // Case 2: Move between existing groups (or inside same group)
    const toGroup = groups.find((g) => g.id === toGroupId);
    if (!toGroup) return;

    // if same group: no split; just keep it simple (append at end)
    const toTabsAfter =
      fromGroupId === toGroupId
        ? [...toGroup.tabs.filter((t) => t.id !== tabId), structuredClone(tab)]
        : [...toGroup.tabs, structuredClone(tab)];

    const toGroupAfter: EditorGroup = {
      ...toGroup,
      tabs: toTabsAfter,
      activeTabId: tab.id,
    };

    let nextGroups = groups;

    // update source group if different or if we re-appended
    const fromGroupAfter: EditorGroup = {
      ...fromGroup,
      tabs: fromTabsAfter.length ? fromTabsAfter : fromGroup.tabs,
      activeTabId:
        fromTabsAfter.length
          ? (fromActiveAfter || fromTabsAfter[0].id)
          : fromGroup.activeTabId,
    };

    nextGroups = replaceGroup(nextGroups, fromGroupAfter);
    nextGroups = replaceGroup(nextGroups, toGroupAfter);

    onChange({
      editorGroups: nextGroups,
      activeEditorGroupId: toGroupId,
    });
  };

  // ---------- UI ----------
  const DropOverlay = ({ hint }: { hint: DropHint }) => {
    if (hint === "none") return null;

    const common = {
      position: "absolute" as const,
      top: 6,
      bottom: 6,
      border: "2px solid rgba(0,122,204,0.9)",
      bgcolor: "rgba(0,122,204,0.18)",
      borderRadius: 1,
      pointerEvents: "none" as const,
    };

    if (hint === "center") {
      return <Box sx={{ ...common, left: 10, right: 10 }} />;
    }
    if (hint === "left") {
      return <Box sx={{ ...common, left: 10, width: "45%" }} />;
    }
    return <Box sx={{ ...common, right: 10, width: "45%" }} />;
  };

  return (
    <Box sx={{ height: "100%", display: "flex", minHeight: 0 }}>
      {groups.map((g, idx) => {
        const activeIdx = Math.max(0, g.tabs.findIndex((t) => t.id === g.activeTabId));
        const activeTab = g.tabs.find((t) => t.id === g.activeTabId) ?? g.tabs[0];
        const isActiveGroup = g.id === activeGroupId;

        const hoverHint = hover?.groupId === g.id ? hover.hint : "none";

        return (
          <Box
            key={g.id}
            onDragOver={onDragOverGroup(g.id)}
            onDragLeave={onDragLeaveGroup(g.id)}
            onDrop={onDropGroup(g.id)}
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              borderLeft: idx > 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
              position: "relative",
              outline: isActiveGroup ? "1px solid rgba(0,122,204,0.35)" : "none",
              outlineOffset: "-1px",
            }}
            onMouseDown={() => setActiveGroup(g.id)}
          >
            <DropOverlay hint={hoverHint} />

            {/* Tabs Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Tabs
                value={activeIdx}
                onChange={(_, tabIndex) => setActiveTab(g.id, g.tabs[tabIndex].id)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 36,
                  "& .MuiTab-root": {
                    minHeight: 36,
                    textTransform: "none",
                    fontSize: 12,
                    color: "#ddd",
                  },
                }}
              >
                {g.tabs.map((t) => (
                  <Tab
                    key={t.id}
                    draggable
                    onDragStart={onDragStartTab(g.id, t.id)}
                    label={
                      <ClosableTabLabel
                        label={t.label}
                        onClose={(e) => {
                          e.stopPropagation();
                          closeTab(g.id, t.id);
                        }}
                      />
                    }
                  />
                ))}
              </Tabs>

              <Tooltip title="Neuen Tab">
                <IconButton
                  size="small"
                  onClick={() => addTabToGroup(g.id)}
                  sx={{ ml: "auto", color: "#ddd" }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Tab duplizieren">
                <IconButton
                  size="small"
                  onClick={() => duplicateTabInGroup(g.id)}
                  sx={{ color: "#ddd" }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2, color: "#ddd" }}>
              <Stack spacing={1}>
                <Typography sx={{ fontSize: 12, opacity: 0.8 }}>
                  Drag a tab → drop links/center zeigt blau an.  
                  Drop links/rechts bei 1 Gruppe ⇒ Split in 2 Gruppen.
                </Typography>

                <Button
                  variant="contained"
                  onClick={incrementCounter}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Count: {activeTab?.state.counter ?? 0}
                </Button>
              </Stack>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
