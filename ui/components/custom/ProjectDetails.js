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

const tasksOpts = [
  { value: "llm:sft", label: "LLM: Supervised Finetuning" },
  { value: "llm:generic", label: "LLM: Generic" },
  { value: "text-classification", label: "Text: Text Classification" },
  { value: "text-regression", label: "Text: Text Regression" },
  { value: "audio-classification", label: "Audio: Audio Classification" },
  { value: "causual-language-modeling", label: "Causal Language Modeling" },
];

export default function ProjectDetails({ projectData, onDataChange }) {
  const handleChange = (field, value) => {
    onDataChange({ [field]: value });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "space-evenly",
        }}
      >
        {tasksOpts.map((option) => (
          <Card
            elevation={3}
            onClick={() => handleChange("task", option.value)}
            key={option.value}
            sx={{
              backgroundColor:
                projectData.task === option.value ? "#e0f8ff" : "white",
              transition: "background-color 0.3s",
              width: "30%",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <CardActionArea>
              <CardContent>
                <Typography>{option.label}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
