import React from "react";
import { Box, Typography } from "@mui/material";

export default function Script({ projectData }) {
  return (
    <Box>
      <Typography variant="h6">Script Component</Typography>
      {/* Add your script component implementation here */}
      <pre>{JSON.stringify(projectData, null, 2)}</pre>
    </Box>
  );
}
