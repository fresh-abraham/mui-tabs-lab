// import * as React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Page1 from "./pages/Page1";
import type { WorkspaceState, NavPage } from "../types";

export default function WorkspaceView({
  workspace,
  onUpdate,
}: {
  workspace: WorkspaceState;
  onUpdate: (patch: Partial<WorkspaceState>) => void;
}) {
  const setPage = (page: NavPage) => onUpdate({ activePage: page });

  return (
    <Box sx={{ height: "100%", display: "flex", bgcolor: "#252526" }}>
      <Sidebar
        expanded={workspace.sidebarExpanded}
        activePage={workspace.activePage}
        onToggleExpanded={() => onUpdate({ sidebarExpanded: !workspace.sidebarExpanded })}
        onNavigate={setPage}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {workspace.activePage === "page1" ? (
          <Page1 workspace={workspace} onUpdate={onUpdate} />
        ) : (
          <Box sx={{ p: 2, color: "#ccc" }}>Seite 2 (placeholder)</Box>
        )}
      </Box>
    </Box>
  );
}
