import * as React from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";

import type { NavPage } from "../types";

export default function Sidebar({
  expanded,
  activePage,
  onToggleExpanded,
  onNavigate,
}: {
  expanded: boolean;
  activePage: NavPage;
  onToggleExpanded: () => void;
  onNavigate: (page: NavPage) => void;
}) {
  const width = expanded ? 200 : 56;

  return (
    <Box
      sx={{
        width,
        flex: "0 0 auto",
        bgcolor: "#1f1f1f",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ height: 40, display: "flex", alignItems: "center", px: 1 }}>
        <Tooltip title={expanded ? "Einklappen" : "Ausklappen"}>
          <IconButton size="small" onClick={onToggleExpanded} sx={{ color: "#ddd" }}>
            {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <List dense sx={{ color: "#ddd" }}>
        <ListItemButton
          selected={activePage === "page1"}
          onClick={() => onNavigate("page1")}
          sx={{
            "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.08)" },
            "&.Mui-selected:hover": { bgcolor: "rgba(255,255,255,0.10)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          {expanded && <ListItemText primary="Seite 1" primaryTypographyProps={{ fontSize: 12 }} />}
        </ListItemButton>

        <ListItemButton
          selected={activePage === "page2"}
          onClick={() => onNavigate("page2")}
          sx={{
            "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.08)" },
            "&.Mui-selected:hover": { bgcolor: "rgba(255,255,255,0.10)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          {expanded && <ListItemText primary="Seite 2" primaryTypographyProps={{ fontSize: 12 }} />}
        </ListItemButton>
      </List>
    </Box>
  );
}
