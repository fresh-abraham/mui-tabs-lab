import * as React from "react";
import { Box } from "@mui/material";
import ResizableSplit from "../ResizableSplit";
import LeftPanels from "./Page1LeftPanels";
import EditorArea from "./Page1EditorArea";
import type { WorkspaceState } from "../../types";

export default function Page1({
  workspace,
  onUpdate,
}: {
  workspace: WorkspaceState;
  onUpdate: (patch: Partial<WorkspaceState>) => void;
}) {
  return (
    <Box sx={{ height: "100%", minHeight: 0 }}>
      <ResizableSplit
        leftWidth={workspace.leftPanelWidth}
        onLeftWidthChange={(w) => onUpdate({ leftPanelWidth: w })}
        left={
          <LeftPanels
            open={workspace.page1PanelsOpen}
            weights={workspace.page1PanelWeights}
            onChange={(patch) => onUpdate(patch)}
          />
        }
        right={
          <EditorArea
            editorGroups={workspace.editorGroups}
            activeGroupId={workspace.activeEditorGroupId}
            onChange={(patch) => onUpdate(patch)}
          />
        }
      />
    </Box>
  );
}
