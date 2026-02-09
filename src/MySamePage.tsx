import * as React from "react";
import { Box, Button, Typography, Stack } from "@mui/material";

export type PageState = {
  counter: number;
};

export default function MySamePage({
  tabId,
  state,
  onChange,
}: {
  tabId: string;
  state: PageState;
  onChange: (patch: Partial<PageState>) => void;
}) {
  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Tab-ID: <code>{tabId}</code>
        </Typography>

        <Button
          variant="contained"
          onClick={() => onChange({ counter: state.counter + 1 })}
        >
          Count: {state.counter}
        </Button>

        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Test: Ändere Count in Tab A, wechsel zu Tab B — Counts bleiben getrennt.
          Reload (F5) — Counts bleiben gespeichert.
        </Typography>
      </Stack>
    </Box>
  );
}
