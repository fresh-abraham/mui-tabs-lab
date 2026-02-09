import * as React from "react";
import { Box } from "@mui/material";

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
  const draggingRef = React.useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
  };

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const x = e.clientX;

      // wir messen relativ zum Split-Container
      const container = document.getElementById("split-root");
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const next = Math.max(minLeft, Math.min(maxLeft, x - rect.left));

      onLeftWidthChange(next);
    };

    const onUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [maxLeft, minLeft, onLeftWidthChange]);

  return (
    <Box id="split-root" sx={{ height: "100%", display: "flex", minWidth: 0 }}>
      <Box sx={{ width: leftWidth, minWidth: 0, bgcolor: "#1e1e1e" }}>{left}</Box>

      {/* Drag handle */}
      <Box
        onMouseDown={onMouseDown}
        sx={{
          width: 6,
          cursor: "col-resize",
          bgcolor: "transparent",
          "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
        }}
      />

      <Box sx={{ flex: 1, minWidth: 0, bgcolor: "#1e1e1e" }}>{right}</Box>
    </Box>
  );
}
