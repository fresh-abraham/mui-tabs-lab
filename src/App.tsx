import * as React from "react";
import { Box } from "@mui/material";
import AppShell from "./components/AppShell";

export default function App() {
  return (
    <Box sx={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <AppShell />
    </Box>
  );
}
