import * as React from "react";
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import MySamePage from "./MySamePage";
import type { PageState } from "./MySamePage";

type TabId = string;

type TabModel = {
  id: TabId;
  label: string;
  state: PageState;
};

const STORAGE_TABS_KEY = "mui_tabs_lab.tabs.v1";
const STORAGE_ACTIVE_KEY = "mui_tabs_lab.activeId.v1";

const makeId = () => crypto.randomUUID();

const defaultPageState = (): PageState => ({
  counter: 0,
});

// Close-Icon in einem MUI Tab Label:
// Wichtig: Tab ist ein <button>, IconButton default auch <button> -> "button in button"
// => component="span" verhindert das.
function ClosableTabLabel({
  tabId,
  label,
  onClose,
}: {
  tabId: string;
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
        aria-label={`tab-close-${tabId}`}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
}

function safeParseTabs(raw: string | null): TabModel[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    const tabs: TabModel[] = parsed
      .filter((t) => t && typeof t === "object")
      .map((t: any) => ({
        id: typeof t.id === "string" ? t.id : makeId(),
        label: typeof t.label === "string" ? t.label : "Tab",
        state: {
          counter: typeof t?.state?.counter === "number" ? t.state.counter : 0,
        },
      }));

    return tabs.length > 0 ? tabs : null;
  } catch {
    return null;
  }
}

export default function ChromeLikeTabs() {
  // Initial aus localStorage laden (oder Default)
  const [tabs, setTabs] = React.useState<TabModel[]>(() => {
    const loaded = safeParseTabs(localStorage.getItem(STORAGE_TABS_KEY));
    if (loaded) return loaded;

    return [{ id: makeId(), label: "Tab 1", state: defaultPageState() }];
  });

  const [activeId, setActiveId] = React.useState<TabId>(() => {
    const saved = localStorage.getItem(STORAGE_ACTIVE_KEY);
    return saved ?? (tabs[0]?.id ?? makeId());
  });

  // ActiveId korrigieren, falls Storage ungültig ist
  React.useEffect(() => {
    if (!tabs.some((t) => t.id === activeId)) {
      setActiveId(tabs[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  // Persistenz
  React.useEffect(() => {
    localStorage.setItem(STORAGE_TABS_KEY, JSON.stringify(tabs));
  }, [tabs]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVE_KEY, activeId);
  }, [activeId]);

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === activeId));
  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  const addTabEmptyAndActivate = () => {
    const id = makeId();
    setTabs((prev) => [
      ...prev,
      { id, label: `Tab ${prev.length + 1}`, state: defaultPageState() },
    ]);
    setActiveId(id);
  };

  const duplicateActiveTab = () => {
    const source = activeTab;
    const id = makeId();

    setTabs((prev) => [
      ...prev,
      {
        id,
        label: `${source.label} Kopie`,
        state: structuredClone(source.state),
      },
    ]);

    setActiveId(id);
  };

  const closeTab = (id: TabId) => {
    setTabs((prev) => {
      if (prev.length === 1) return prev;

      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);

      if (id === activeId) {
        const fallback = next[Math.max(0, idx - 1)] ?? next[0];
        setActiveId(fallback.id);
      }

      return next;
    });
  };

  const updateActiveTabState = (patch: Partial<PageState>) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeId ? { ...t, state: { ...t.state, ...patch } } : t
      )
    );
  };

  const resetStorage = () => {
    localStorage.removeItem(STORAGE_TABS_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_KEY);
    const first = { id: makeId(), label: "Tab 1", state: defaultPageState() };
    setTabs([first]);
    setActiveId(first.id);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tab Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
          px: 1,
        }}
      >
        <Tabs
          value={activeIndex}
          onChange={(_, newIndex) => setActiveId(tabs[newIndex].id)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((t) => (
            <Tab
              key={t.id}
              label={
                <ClosableTabLabel
                  tabId={t.id}
                  label={t.label}
                  onClose={(e) => {
                    e.stopPropagation();
                    closeTab(t.id);
                  }}
                />
              }
            />
          ))}
        </Tabs>

        <Tooltip title="Neuen Tab öffnen">
          <IconButton aria-label="new-tab" onClick={addTabEmptyAndActivate}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Toolbar */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button aria-label="duplicate-tab" variant="outlined" onClick={duplicateActiveTab}>
            Tab duplizieren
          </Button>
          <Button aria-label="reset-storage" variant="text" onClick={resetStorage}>
            Storage zurücksetzen
          </Button>

          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Aktiver Tab: <b>{activeTab.label}</b> ({tabs.length} Tabs)
          </Typography>
        </Stack>
      </Box>

      {/* Page */}
      <Box sx={{ p: 2 }}>
        <MySamePage
          tabId={activeTab.id}
          state={activeTab.state}
          onChange={updateActiveTabState}
        />
      </Box>
    </Box>
  );
}
