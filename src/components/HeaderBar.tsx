import * as React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import RestoreIcon from "@mui/icons-material/RestartAlt";

import type { WorkspaceState } from "../types";

function useMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  return {
    open,
    anchorEl,
    openMenu: (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget),
    closeMenu: () => setAnchorEl(null),
  };
}

function HeaderDropDown({ label }: { label: string }) {
  const m = useMenu();

  return (
    <>
      <Typography
        onClick={m.openMenu}
        sx={{
          cursor: "pointer",
          fontSize: 12,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
          userSelect: "none",
        }}
      >
        {label}
      </Typography>

      <Menu anchorEl={m.anchorEl} open={m.open} onClose={m.closeMenu}>
        <MenuItem onClick={m.closeMenu}>Eintrag 1</MenuItem>
        <MenuItem onClick={m.closeMenu}>Eintrag 2</MenuItem>
        <MenuItem onClick={m.closeMenu}>Eintrag 3</MenuItem>
      </Menu>
    </>
  );
}

export default function HeaderBar({
  workspaces,
  activeWorkspaceId,
  onChangeActive,
  onAddWorkspace,
  onDuplicateWorkspace,
  onCloseWorkspace,
  onResetStorage,
}: {
  workspaces: WorkspaceState[];
  activeWorkspaceId: string;
  onChangeActive: (id: string) => void;
  onAddWorkspace: () => void;
  onDuplicateWorkspace: () => void;
  onCloseWorkspace: (id: string) => void;
  onResetStorage: () => void;
}) {
  const activeIndex = Math.max(0, workspaces.findIndex((w) => w.id === activeWorkspaceId));

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: "#1f1f1f" }}>
      <Toolbar
        variant="dense"
        sx={{ minHeight: 36, height: 36, px: 1, gap: 1 }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: 0.5,
              bgcolor: "#4fc3f7",
            }}
          />
          <Typography sx={{ fontSize: 12, opacity: 0.9 }}>
            MyApp
          </Typography>
        </Box>

        {/* Header links as dropdowns */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <HeaderDropDown label="File" />
          <HeaderDropDown label="Edit" />
          <HeaderDropDown label="View" />
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Workspace Tabs (thin) */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 360, maxWidth: "50vw" }}>
          <Tabs
            value={activeIndex}
            onChange={(_, idx) => onChangeActive(workspaces[idx].id)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 32,
              height: 32,
              "& .MuiTab-root": {
                minHeight: 32,
                height: 32,
                fontSize: 12,
                textTransform: "none",
                px: 1,
              },
            }}
          >
            {workspaces.map((w) => (
              <Tab
                key={w.id}
                label={
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <span>{w.label}</span>
                    <IconButton
                        component="span"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCloseWorkspace(w.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        sx={{ color: "inherit" }}
                        >
                        <CloseIcon fontSize="inherit" />
                        </IconButton>

                  </Box>
                }
              />
            ))}
          </Tabs>

          <Tooltip title="Neuen Workspace Tab öffnen">
            <IconButton size="small" onClick={onAddWorkspace} sx={{ ml: 0.5, color: "inherit" }}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Workspace duplizieren">
            <IconButton size="small" onClick={onDuplicateWorkspace} sx={{ color: "inherit" }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="localStorage zurücksetzen">
            <IconButton size="small" onClick={onResetStorage} sx={{ color: "inherit" }}>
              <RestoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "rgba(255,255,255,0.15)" }} />
      </Toolbar>
    </AppBar>
  );
}
