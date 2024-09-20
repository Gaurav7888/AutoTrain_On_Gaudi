// ./custom/ModelSelection.js
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { SERVER_URL } from "@/lib/constants";

export default function ModelSelection({ projectData, onDataChange }) {
  const [modelChoice, setModelChoice] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModelChoices = async () => {
      if (projectData.task) {
        try {
          const response = await axios.get(
            `${SERVER_URL}/ui/model_choices/${projectData.task}`
          );
          setModelChoice(response.data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching model choices:", error);
        }
      }
    };

    fetchModelChoices();
  }, [projectData.task]);

  const handleModelChoiceChange = (selectedModel) => {
    onDataChange({ model: selectedModel });
  };

  return (
    <Box
      sx={{
        height: "66vh",
        width: "100%",
        overflowY: "auto",
        padding: 2,
        border: "1px solid #ccc",
        borderRadius: "0.2rem",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading ? (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <CircularProgress />
            <Typography>Loading Model Choices</Typography>
          </Box>
        </>
      ) : (
        <Grid container spacing={2}>
          {modelChoice
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((option) => (
              <Grid item xs={6} sm={4} md={3} key={option.id}>
                <Card
                  onClick={() => handleModelChoiceChange(option.name)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "4rem",
                    cursor: "pointer",
                    border:
                      projectData.model === option.name
                        ? "2px solid #1976d2"
                        : "2px solid transparent",
                    padding: "0.7rem",
                  }}
                  elevation={3}
                >
                  {/* <CardContent> */}
                  <Typography variant="body2" textAlign="center">
                    {option.name}
                  </Typography>
                  {/* </CardContent> */}
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );
}
