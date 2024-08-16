import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Switch,
  TextareaAutosize,
} from "@mui/material";
import { fetchParams } from "../api/fetch-params/route";

const TrainingInterface = ({ task, setTask, paramType, setParamType }) => {
  const [isModelTraining, setIsModelTraining] = useState(false);
  const [showJsonParameters, setShowJsonParameters] = useState(false);
  const [baseModelCustom, setBaseModelCustom] = useState(false);
  const [datasetSource, setDatasetSource] = useState("local");
  const [params, setParams] = useState({});

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const res = await fetchParams(task, paramType);
        setParams(res);
        console.log(`params for ${task}: ${res}`);
      } catch (error) {
        console.error("Error fetching and setting params:", error);
      }
    };

    fetchData();
    fetchAccelerators();
    fetchTrainingStatus();
    fetchBaseModels();
  }, [task, paramType]);

  const fetchAccelerators = () => {
    // Implement fetching accelerators
  };

  const fetchTrainingStatus = () => {
    // Implement fetching training status
  };

  const fetchBaseModels = () => {
    // Implement fetching base models
  };

  const handleStartTraining = () => {
    setIsModelTraining(true);
  };

  const handleStopTraining = () => {
    setIsModelTraining(false);
  };

  return (
    <Grid width="100%" p={4}>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12}>
          <Typography
            variant="body2"
            color="textSecondary"
            fontWeight="bold"
            align="left"
            id="num_accelerators"
          >
            Accelerators: Fetching...
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            fontWeight="bold"
            align="left"
            id="is_model_training"
          >
            Fetching training status...
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-end"
        >
          {!isModelTraining ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartTraining}
            >
              Start Training
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleStopTraining}
            >
              Stop Training
            </Button>
          )}
        </Grid>
      </Grid>
      <Box p={4}>
        <Grid container spacing={4} mb={4}>
          <Grid item xs={6}>
            <Box mb={4}>
              <Typography variant="h6" color="textPrimary" mb={2}>
                Project Name
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                name="project_name"
                id="project_name"
              />
            </Box>
            <Box mb={4}>
              <Typography variant="h6" color="textPrimary" mb={2}>
                Base Model
              </Typography>
              <Box display="flex" alignItems="center">
                {baseModelCustom ? (
                  <TextField
                    fullWidth
                    variant="outlined"
                    id="base_model_input"
                  />
                ) : (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="base_model_label">Base Model</InputLabel>
                    <Select
                      labelId="base_model_label"
                      id="base_model"
                      name="base_model"
                      label="Base Model"
                    >
                      {/* Add options here */}
                    </Select>
                  </FormControl>
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={baseModelCustom}
                      onChange={() => setBaseModelCustom(!baseModelCustom)}
                      color="primary"
                    />
                  }
                  label="Custom"
                />
              </Box>
            </Box>
            <Box mb={4}>
              <Typography variant="h6" color="textPrimary" mb={2}>
                Dataset Source
              </Typography>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="dataset_source_label">
                  Dataset Source
                </InputLabel>
                <Select
                  labelId="dataset_source_label"
                  id="dataset_source"
                  name="dataset_source"
                  value={datasetSource}
                  onChange={(e) => setDatasetSource(e.target.value)}
                  label="Dataset Source"
                >
                  <MenuItem value="local">Local</MenuItem>
                  <MenuItem value="hub">Hugging Face Hub</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {/* Add the rest of the form elements here */}
          </Grid>
          <Grid item xs={6}>
            <Box mb={4}>
              <Typography variant="h6" color="textPrimary" mb={2}>
                Parameters
              </Typography>
              <Box
                mt={2}
                id="dynamic-ui"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "1rem",
                  width: "100%",
                  marginTop: "-1rem",
                }}
              >
                {Object.entries(params).map(([key, config]) => {
                  switch (config.type) {
                    case "dropdown":
                      return (
                        <FormControl
                          fullWidth
                          key={key}
                          margin="normal"
                          sx={{
                            maxWidth: "10rem",
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                          }}
                        >
                          <InputLabel>{config.label}</InputLabel>
                          <Select
                            defaultValue={config.default}
                            id={key}
                            name={key}
                            label={config.label}
                          >
                            {config.options.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option.toString()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      );
                    case "number":
                      return (
                        <TextField
                          key={key}
                          fullWidth
                          label={config.label}
                          type="number"
                          defaultValue={config.default}
                          margin="normal"
                          id={key}
                          name={key}
                          sx={{
                            maxWidth: "10rem",
                            flexGrow: 1,
                          }}
                        />
                      );
                    case "string":
                      return (
                        <TextField
                          key={key}
                          fullWidth
                          label={config.label}
                          type="text"
                          defaultValue={config.default}
                          margin="normal"
                          id={key}
                          name={key}
                          sx={{
                            maxWidth: "10rem",
                            flexGrow: 1,
                          }}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

export default TrainingInterface;
