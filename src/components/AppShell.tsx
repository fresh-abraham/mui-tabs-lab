import * as React from "react";
import { Box } from "@mui/material";
import HeaderBar from "./HeaderBar";
import WorkspaceView from "./WorkspaceView";
import type { WorkspaceState, EditorGroup } from "../types";

const STORAGE_KEY = "vscode_like.workspaces.v1";
const makeId = () => crypto.randomUUID();

const defaultWorkspace = (n: number): WorkspaceState => {
  const tabId = makeId();
  const groupId = makeId();

  const group: EditorGroup = {
    id: groupId,
    tabs: [{ id: tabId, label: "Tab 1", state: { counter: 0 } }],
    activeTabId: tabId,
  };

  return {
    id: makeId(),
    label: `Workspace ${n}`,
    activePage: "page1",
    sidebarExpanded: true,
    leftPanelWidth: 280,

    page1PanelsOpen: { tabs: true, outline: false, timeline: false },
    page1PanelWeights: { tabs: 1, outline: 1, timeline: 1 },

    editorGroups: [group],
    activeEditorGroupId: groupId,
  };
};

function safeLoad(): WorkspaceState[] | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as WorkspaceState[];
  } catch {
    return null;
  }
}

export default function AppShell() {
  const [workspaces, setWorkspaces] = React.useState<WorkspaceState[]>(() => {
    const loaded = safeLoad();
    return loaded ?? [defaultWorkspace(1)];
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = React.useState<string>(() => {
    return workspaces[0].id;
  });

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  }, [workspaces]);

  React.useEffect(() => {
    if (!workspaces.some((w) => w.id === activeWorkspaceId)) {
      setActiveWorkspaceId(workspaces[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces]);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

  const updateWorkspace = (id: string, patch: Partial<WorkspaceState>) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  };

  const addWorkspace = () => {
    const next = defaultWorkspace(workspaces.length + 1);
    setWorkspaces((prev) => [...prev, next]);
    setActiveWorkspaceId(next.id);
  };

  const duplicateWorkspace = () => {
    const src = activeWorkspace;

    // Deep clone + neue IDs für groups/tabs
    const clonedGroups = src.editorGroups.map((g) => {
      const newGroupId = makeId();
      const newTabs = g.tabs.map((t) => ({
        id: makeId(),
        label: t.label,
        state: structuredClone(t.state),
      }));
      return {
        id: newGroupId,
        tabs: newTabs,
        activeTabId: newTabs[0]?.id ?? makeId(),
      };
    });

    const cloned: WorkspaceState = {
      ...structuredClone(src),
      id: makeId(),
      label: `${src.label} Kopie`,
      editorGroups: clonedGroups,
      activeEditorGroupId: clonedGroups[0]?.id ?? makeId(),
    };

    setWorkspaces((prev) => [...prev, cloned]);
    setActiveWorkspaceId(cloned.id);
  };

  const closeWorkspace = (id: string) => {
    setWorkspaces((prev) => {
      if (prev.length === 1) return prev;
      const idx = prev.findIndex((w) => w.id === id);
      const next = prev.filter((w) => w.id !== id);

      if (id === activeWorkspaceId) {
        const fallback = next[Math.max(0, idx - 1)] ?? next[0];
        setActiveWorkspaceId(fallback.id);
      }
      return next;
    });
  };

  const resetStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    const ws = defaultWorkspace(1);
    setWorkspaces([ws]);
    setActiveWorkspaceId(ws.id);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <HeaderBar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onChangeActive={setActiveWorkspaceId}
        onAddWorkspace={addWorkspace}
        onDuplicateWorkspace={duplicateWorkspace}
        onCloseWorkspace={closeWorkspace}
        onResetStorage={resetStorage}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <WorkspaceView
          workspace={activeWorkspace}
          onUpdate={(patch) => updateWorkspace(activeWorkspace.id, patch)}
        />
      </Box>
    </Box>
  );
}
