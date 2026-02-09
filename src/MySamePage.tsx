// import * as React from "react";
import { Box, Typography } from "@mui/material";

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
    <Box
      sx={{
        backgroundColor: "green",
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h6" sx={{ color: "white", textTransform: "uppercase" }}>
        map
      </Typography>
    </Box>
  );
}
