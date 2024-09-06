// ./custom/ProjectDetails.js
import React from "react";
import {
  Box,
  TextField,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import { tasksOpts } from "@/config/tasksConfig";

export default function ProjectDetails({ projectData, onDataChange }) {
  const handleChange = (field, value) => {
    const newValue = projectData[field] === value ? "" : value;
    onDataChange({ [field]: newValue });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // alignItems: "center",
        // justifyContent: "center",
        gap: "1rem",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
        <TextField
          label="Project Name"
          value={projectData.projectName}
          onChange={(e) => handleChange("projectName", e.target.value)}
          margin="normal"
          fullWidth
        />
        <TextField
          label="Dataset Name"
          value={projectData.datasetName}
          onChange={(e) => handleChange("datasetName", e.target.value)}
          margin="normal"
          fullWidth
        />
      </Box>
      <Typography variant="h6">Choose Task</Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          // gap: "1rem",
          justifyContent: "space-evenly",
        }}
      >
        {tasksOpts.map((category) => (
          <Box
            key={category.category}
            sx={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              // gap: "1rem",
              // justifyContent: "space-evenly",
            }}
          >
            <Typography variant="h6" style={{ color: category.color }}>
              {category.category}
            </Typography>
            {category.options.map((option) => (
              <Box
                disabled={option.enabled}
                onClick={() => handleChange("task", option.value)}
                key={option.value}
                style={{
                  backgroundColor: option.enabled
                    ? projectData.task === option.value
                      ? category.color
                      : "white"
                    : "#c4c4c4",
                  color:
                    option.enabled && projectData.task === option.value
                      ? "white"
                      : "black",
                  transition: "background-color 0.3s",
                  width: "85%",
                  cursor: "pointer",
                  border: `2px solid ${option.borderColor}`,
                  padding: "10px",
                  margin: "5px 0",
                  borderRadius: "0.7rem",
                }}
              >
                {option.label}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
