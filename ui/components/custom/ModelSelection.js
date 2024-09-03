// ./custom/ModelSelection.js
import React, { useState, useEffect } from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import axios from "axios";
import { SERVER_URL } from "@/lib/constants";

export default function ModelSelection({ projectData, onDataChange }) {
  const [modelChoice, setModelChoice] = useState([]);

  useEffect(() => {
    const fetchModelChoices = async () => {
      if (projectData.task) {
        try {
          const response = await axios.get(
            `${SERVER_URL}/ui/model_choices/${projectData.task}`
          );
          setModelChoice(response.data);
        } catch (error) {
          console.error("Error fetching model choices:", error);
        }
      }
    };

    fetchModelChoices();
  }, [projectData.task]);

  const handleModelChoiceChange = (event) => {
    const selectedModel = event.target.value;
    onDataChange({ model: selectedModel });
  };

  return (
    <Box>
      <TextField
        select
        label="Choose Model"
        value={projectData.model}
        onChange={handleModelChoiceChange}
        fullWidth
        margin="normal"
      >
        {modelChoice.map((option) => (
          <MenuItem key={option.id} value={option.name}>
            {option.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
