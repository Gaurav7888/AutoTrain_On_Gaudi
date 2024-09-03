import React from "react";
import { Box } from "@mui/material";
import HomePage from "@/components/home-page";

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <HomePage />
    </Box>
  );
}
