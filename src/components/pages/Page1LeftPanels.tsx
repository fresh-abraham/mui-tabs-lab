import * as React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import type {
  Page1PanelsOpen,
  Page1PanelWeights,
  WorkspaceState,
} from "../../types";

import VerticalResizableStack from "../VerticalResizableStack";

type PanelKey = keyof Page1PanelsOpen;
const ORDER: PanelKey[] = ["tabs", "outline", "timeline"];

const TITLES: Record<PanelKey, string> = {
  tabs: "Route",
  outline: "Layer",
  timeline: "Heatmap",
};

const HEADER_H = 28;

function PanelHeader({
  title,
  isOpen,
  onToggle,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      sx={{
        height: HEADER_H,
        px: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "#252526",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={onToggle}
    >
      <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#ddd" }}>
        {title}
      </Typography>

      <Tooltip title={isOpen ? "Einklappen" : "Ausklappen"}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          sx={{ color: "#bbb" }}
        >
          {isOpen ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ChevronRightIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function LeftPanels({
  open,
  weights,
  onChange,
}: {
  open: Page1PanelsOpen;
  weights: Page1PanelWeights;
  onChange: (patch: Partial<WorkspaceState>) => void;
}) {
  const setOpen = (key: PanelKey, next: boolean) => {
    const nextOpen = { ...open, [key]: next };
    onChange({ page1PanelsOpen: nextOpen });
  };

  const items = React.useMemo(() => {
    const record = {} as Record<
      PanelKey,
      {
        key: PanelKey;
        header: React.ReactNode;
        content: React.ReactNode;
      }
    >;

    for (const key of ORDER) {
      record[key] = {
        key,
        header: (
          <PanelHeader
            title={TITLES[key]}
            isOpen={open[key]}
            onToggle={() => setOpen(key, !open[key])}
          />
        ),
        content: (
          <Box sx={{ px: 1, py: 1, color: "#ddd" }}>
            <Typography sx={{ fontSize: 12, opacity: 0.85 }}>
              Placeholder Content für <b>{TITLES[key]}</b>
            </Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.7, mt: 1 }}>
              Öffne 2 Panels → sie teilen sich die Höhe. Ziehe den Splitter dazwischen.
            </Typography>
          </Box>
        ),
      };
    }
    return record;
  }, [open]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "#1b1a1a",
        minHeight: 0,
      }}
    >
      <VerticalResizableStack
        items={items}
        order={ORDER}
        open={open}
        weights={weights}
        minContentPx={60}
        onWeightsChange={(next) => onChange({ page1PanelWeights: next as Page1PanelWeights })}
      />
    </Box>
  );
}
