import * as React from "react";
import { Box } from "@mui/material";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ResizableSplit({
  leftWidth,
  onLeftWidthChange,
  left,
  right,
  minLeft = 180,
  maxLeft = 520,
}: {
  leftWidth: number;
  onLeftWidthChange: (w: number) => void;
  left: React.ReactNode;
  right: React.ReactNode;
  minLeft?: number;
  maxLeft?: number;
}) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const dragRef = React.useRef<{ dragging: boolean; startX: number; startW: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { dragging: true, startX: e.clientX, startW: leftWidth };
  };

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current?.dragging) return;
      const root = rootRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const dx = e.clientX - dragRef.current.startX;

      const next = clamp(dragRef.current.startW + dx, minLeft, maxLeft);

      // Optional: wenn du 1:1 absolut zum Container willst, nimm e.clientX - rect.left,
      // aber startW+dx fühlt sich meist stabiler an (keine Sprünge wenn Cursor vom Handle "wegdriftet").
      onLeftWidthChange(next);
    };

    const onUp = () => {
      if (dragRef.current) dragRef.current.dragging = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [leftWidth, maxLeft, minLeft, onLeftWidthChange]);

  return (
    <Box ref={rootRef} sx={{ height: "100%", display: "flex", minWidth: 0 }}>
      <Box sx={{ width: leftWidth, minWidth: 0, bgcolor: "#1e1e1e" }}>{left}</Box>

      <Box
        onMouseDown={onMouseDown}
        sx={{
          width: 6,
          cursor: "col-resize",
          bgcolor: "transparent",
          "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
          flex: "0 0 auto",
        }}
      />

      <Box sx={{ flex: 1, minWidth: 0, bgcolor: "#1e1e1e" }}>{right}</Box>
    </Box>
  );
}
