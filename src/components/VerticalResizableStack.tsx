import * as React from "react";
import { Box } from "@mui/material";

const RESIZER_H = 6;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export type VerticalStackItem<K extends string> = {
  key: K;
  header: React.ReactNode;  // wird immer gerendert
  content: React.ReactNode; // wird nur gerendert wenn open
};

export default function VerticalResizableStack<K extends string>({
  items,
  order,
  open,
  weights,
  onWeightsChange,
  minContentPx = 60,
}: {
  items: Record<K, VerticalStackItem<K>>;
  order: K[];
  open: Record<K, boolean>;
  weights: Partial<Record<K, number>>;
  onWeightsChange: (next: Partial<Record<K, number>>) => void;
  minContentPx?: number;
}) {
  const contentRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const openKeys = order.filter((k) => open[k]);
  const openCount = openKeys.length;

  const getGrow = (key: K) => {
    if (!open[key]) return 0;
    if (openCount <= 1) return 1;
    return Math.max(0.1, weights[key] ?? 1);
  };

  const nextOpenAfter = (key: K): K | null => {
    const idx = order.indexOf(key);
    for (let i = idx + 1; i < order.length; i++) {
      const k = order[i];
      if (open[k]) return k;
    }
    return null;
  };

  const dragRef = React.useRef<{
    a: K;
    b: K;
    startY: number;
    startPxA: number;
    startPxB: number;
    sumPx: number;
    sumW: number;
  } | null>(null);

  const beginDrag = (a: K, b: K) => (e: React.MouseEvent) => {
    e.preventDefault();

    const elA = contentRefs.current[a] ?? null;
    const elB = contentRefs.current[b] ?? null;
    if (!elA || !elB) return;

    const startPxA = elA.getBoundingClientRect().height;
    const startPxB = elB.getBoundingClientRect().height;
    const sumPx = Math.max(1, startPxA + startPxB);

    const wa = weights[a] ?? 1;
    const wb = weights[b] ?? 1;
    const sumW = Math.max(0.0001, wa + wb);

    dragRef.current = {
      a,
      b,
      startY: e.clientY,
      startPxA,
      startPxB,
      sumPx,
      sumW,
    };
  };

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const d = dragRef.current;

      const dy = e.clientY - d.startY;

      // Pixel 1:1
      let nextPxA = d.startPxA + dy;
      const loA = minContentPx;
      const hiA = d.sumPx - minContentPx;

      nextPxA = clamp(nextPxA, loA, hiA);
      const nextPxB = d.sumPx - nextPxA;

      // px -> weights proportional zur Summe der beiden
      const fracA = nextPxA / d.sumPx;
      const nextWA = clamp(d.sumW * fracA, 0.2, 100);
      const nextWB = clamp(d.sumW - nextWA, 0.2, 100);

      onWeightsChange({
        ...weights,
        [d.a]: nextWA,
        [d.b]: nextWB,
      });
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [minContentPx, onWeightsChange, weights]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        justifyContent: openCount === 0 ? "flex-end" : "flex-start",
      }}
    >
      {order.map((key) => {
        const isOpen = open[key];
        const next = isOpen ? nextOpenAfter(key) : null;

        return (
          <React.Fragment key={key}>
            {/* Header immer */}
            <Box sx={{ flex: "0 0 auto" }}>{items[key].header}</Box>

            {/* Content */}
            <Box
              ref={(node) => {
                contentRefs.current[key] = node;
              }}
              sx={{
                flexGrow: getGrow(key),
                flexBasis: 0,
                minHeight: 0,
                display: isOpen ? "block" : "none",
                overflow: "auto",
              }}
            >
              {items[key].content}
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
                  flex: "0 0 auto",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}
