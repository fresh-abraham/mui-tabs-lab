import * as React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import type {
  Page1PanelsOpen,
  Page1PanelWeights,
  WorkspaceState,
} from "../../types";

type PanelKey = keyof Page1PanelsOpen;
const ORDER: PanelKey[] = ["tabs", "outline", "timeline"];

const TITLES: Record<PanelKey, string> = {
  tabs: "Tabs",
  outline: "Outline",
  timeline: "Timeline",
};

const HEADER_H = 34;
const RESIZER_H = 6;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#ddd" }}>
          {title}
        </Typography>
      </Box>

      <Tooltip title={isOpen ? "Einklappen" : "Ausklappen"}>
        <IconButton
          size="small"
          onClick={onToggle}
          sx={{ color: "#bbb" }}
        >
          {isOpen ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
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
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const openKeys = ORDER.filter((k) => open[k]);
  const openCount = openKeys.length;

  // Wenn nur 1 offen ist, ist weight egal (nimmt Resthöhe vollständig).
  const getGrow = (key: PanelKey) => {
    if (!open[key]) return 0;
    if (openCount <= 1) return 1;
    return Math.max(0.1, weights[key] ?? 1);
  };

  const setOpen = (key: PanelKey, next: boolean) => {
    const nextOpen = { ...open, [key]: next };

    // Sicherheitsnetz: mindestens eins offen lassen
    const nextCount = ORDER.filter((k) => nextOpen[k]).length;
    if (nextCount === 0) return;

    onChange({ page1PanelsOpen: nextOpen });
  };

  // Drag zwischen zwei offenen Panels: wir ändern ihre "weights"
  const dragState = React.useRef<{
    a: PanelKey;
    b: PanelKey;
    startY: number;
    startWA: number;
    startWB: number;
    heightAvailable: number;
  } | null>(null);

  const beginDrag = (a: PanelKey, b: PanelKey) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    // verfügbare Höhe (gesamt minus Header minus Resizer)
    const rect = containerRef.current.getBoundingClientRect();
    const resizerCount = Math.max(0, openCount - 1);
    const heightAvailable =
      rect.height - ORDER.length * HEADER_H - resizerCount * RESIZER_H;

    dragState.current = {
      a,
      b,
      startY: e.clientY,
      startWA: weights[a] ?? 1,
      startWB: weights[b] ?? 1,
      heightAvailable: Math.max(120, heightAvailable),
    };
  };

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const d = dragState.current;

      // Pixel -> weight delta: proportional zur verfügbaren Höhe
      const dy = e.clientY - d.startY;

      // wie stark reagieren? 1 "weight" ~ 120px (grob)
      const scale = d.heightAvailable / 6; // je größer der Container, desto sanfter
      const deltaW = dy / scale;

      let nextA = d.startWA + deltaW;
      let nextB = d.startWB - deltaW;

      // clamp: beide müssen >0 bleiben
      nextA = clamp(nextA, 0.2, 100);
      nextB = clamp(nextB, 0.2, 100);

      onChange({
        page1PanelWeights: {
          ...weights,
          [d.a]: nextA,
          [d.b]: nextB,
        },
      });
    };

    const onUp = () => {
      dragState.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onChange, openCount, weights]);

  // Helper: liefert für jedes Panel den "nächsten offenen" PanelKey, damit wir Resizer nur zwischen offenen malen
  const nextOpenAfter = (key: PanelKey): PanelKey | null => {
    const idx = ORDER.indexOf(key);
    for (let i = idx + 1; i < ORDER.length; i++) {
      const k = ORDER[i];
      if (open[k]) return k;
    }
    return null;
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "#1e1e1e",
        minHeight: 0,
      }}
    >
      {ORDER.map((key) => {
        const isOpen = open[key];
        const next = isOpen ? nextOpenAfter(key) : null;

        return (
          <React.Fragment key={key}>
            <Box sx={{ flex: "0 0 auto" }}>
              <PanelHeader
                title={TITLES[key]}
                isOpen={isOpen}
                onToggle={() => setOpen(key, !isOpen)}
              />
            </Box>

            {/* Content Area */}
            <Box
              sx={{
                flexGrow: getGrow(key),
                flexBasis: 0,
                minHeight: 0,
                display: isOpen ? "block" : "none",
                overflow: "auto",
                px: 1,
                py: 1,
                color: "#ddd",
              }}
            >
              <Typography sx={{ fontSize: 12, opacity: 0.85 }}>
                Placeholder Content für <b>{TITLES[key]}</b>
              </Typography>
              <Typography sx={{ fontSize: 12, opacity: 0.7, mt: 1 }}>
                Öffne 2 Panels → sie teilen sich die Höhe. Ziehe den Splitter dazwischen.
              </Typography>
            </Box>

            {/* Resizer nur zwischen offenen Panels */}
            {isOpen && next && (
              <Box
                onMouseDown={beginDrag(key, next)}
                sx={{
                  height: RESIZER_H,
                  cursor: "row-resize",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}
