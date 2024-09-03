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
  {
    category: "LLM",
    color: "#023e8a",
    options: [
      {
        value: "llm:sft",
        label: "Supervised Fine Tuning",
        borderColor: "#0077b6",
      },
      {
        value: "llm:generic",
        label: "Causal Language Modelling",
        borderColor: "#0077b6",
      },
    ],
  },
  {
    category: "Text",
    color: "#015b9f",
    options: [
      {
        value: "text-classification",
        label: "Text Classification",
        borderColor: "#00b4d8",
      },
      {
        value: "text-regression",
        label: "Text Regression",
        borderColor: "#00b4d8",
      },
    ],
  },
  {
    category: "Audio",
    color: "#0077b6",
    options: [
      {
        value: "audio-classification",
        label: "Audio Classification",
        borderColor: "#48cae4",
      },
    ],
  },
  {
    category: "Image",
    color: "#0096c7",
    options: [
      {
        value: "image-generation",
        label: "Image Generation",
        borderColor: "#ade8f4",
      },
      {
        value: "image-classification",
        label: "Image Classification",
        borderColor: "#ade8f4",
      },
    ],
  },
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
                onClick={() => handleChange("task", option.value)}
                key={option.value}
                style={{
                  backgroundColor:
                    projectData.task === option.value
                      ? category.color
                      : "white",
                  color: projectData.task === option.value ? "white" : "black",
                  // boxShadow:
                  //   projectData.task === option.value
                  //     ? "0 0 5px #2155bf"
                  //     : "0 0 5px white",
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
