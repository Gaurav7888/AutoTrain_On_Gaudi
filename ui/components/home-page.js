import React, { useState, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";

const steps = ["Project Details", "Model Selection", "Parameters", "Script"];
import axios from "axios";
import { SERVER_URL } from "@/lib/constants";

export default function HomePage() {
  const [task, setTask] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [params, setParams] = useState({});
  const [modelChoice, setModelChoice] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [config, setConfig] = useState({});
  const [showTrainingConfig, setShowTrainingConfig] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [datasetName, setDatasetName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [parameterType, setParameterType] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  // TODO: Update to fetch from API
  const tasksOpts = [
    { value: "llm:sft", label: "LLM: Supervised Finetuning" },
    { value: "llm:generic", label: "LLM: Generic" },
    { value: "text-classification", label: "Text: Text Classification" },
    { value: "text-regression", label: "Text: Text Regression" },
    { value: "audio-classification", label: "Audio: Audio Classification" },
    { value: "causual-language-modeling", label: "Causal Language Modeling" },
  ];

  const handleSetConfigKey = (key, value, params) => {
    if (params && params[key]) {
      if (params[key].type === "boolean") {
        value = value === "true";
      }
      if (params[key].type === "number") {
        value = parseInt(value);
      }
      if (params[key].type === "float") {
        value = parseFloat(value);
      }
    }

    setConfig((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
    console.log("Setting key: ", key, " with value: ", value);
    console.log("Config: ", config);
  };

  const handleSave = () => {
    handleSetConfigKey("dataset_name", datasetName, null);
    setIsSaved(true);
  };

  const sanitizeParams = (params) => {
    let newParams = {};

    Object.keys(params).forEach((key) => {
      let val = params[key];
      let type = val.type;
      let def = val.default;
      let defaultVal =
        typeof def == "boolean" ? (def == true ? "true" : "false") : def;
      let options = type == "dropdown" ? val.options : [];
      let newOpts = [];
      if (type == "dropdown") {
        newOpts = options.map((op) => {
          return op == true ? "true" : op == false ? "false" : op;
        });
      }

      newParams[key] = {
        type: type,
        label: val.label,
        default: defaultVal,
        options: newOpts,
      };
    });
    return newParams;
  };

  const handleModelChoiceChange = (event) => {
    setIsSaved(false);
    let val = event.target.value;
    setSelectedModel(val);

    const selectedChoice = modelChoice.find((choice) => choice.name === val);

    let key = "model_name_or_path";
    handleSetConfigKey(key, selectedChoice.name, selectedChoice);

    console.log("Model choice changed");
  };

  useEffect(() => {
    const handleRetrieveModelChoices = (task) => {
      if (task == "") {
        console.log("Task is not chosen");
        return;
      }
      let url = SERVER_URL + `/ui/model_choices/` + task;
      axios.get(url).then((resp) => {
        let choice = resp.data;
        console.log("resp: ", resp);
        console.log("choice: ", choice);
        setModelChoice(choice);
      });
      console.log("Model choices retrieved", modelChoice);
    };
    if (task !== "" && parameterType !== "") {
      handleRetrieveModelChoices(task);
    }
  }, [task, parameterType]);

  const fetchAndSetParams = (task, parameterType) => {
    let url = `${SERVER_URL}/ui/params/${task}/${parameterType}`;
    axios.get(url).then((resp) => {
      console.log("params fetched from ", SERVER_URL);
      let _params = sanitizeParams(resp.data);
      setParams(_params);
      console.log("Params: ", _params);
      Object.keys(_params).forEach((key) => {
        handleSetConfigKey(key, _params[key].default, _params);
      });
    });
  };

  const handleParameterTypeChange = (event) => {
    const newParameterType = event.target.value;
    setParameterType(newParameterType);
    setIsSaved(false);
    // if (task === "") return;
    setShowTrainingConfig(true);
    console.log("before ");
    fetchAndSetParams(task, newParameterType);
    console.log("Parameter type changed", newParameterType);
  };

  const handleTaskChange = (newTask) => {
    if (selectedTask === newTask) {
      // Deselect the task if it's clicked again
      setSelectedTask(null);
      setTask("");
      setIsSaved(false);
      setShowTrainingConfig(false);
      console.log("Task deselected");
    } else {
      // Select the new task
      setSelectedTask(newTask);
      setTask(newTask);
      setIsSaved(false);
      if (parameterType !== "") {
        setShowTrainingConfig(true);
        fetchAndSetParams(newTask, parameterType);
      }
      console.log("Task changed");
    }
  };

  useEffect(() => {
    if (task !== "" && parameterType !== "") {
      fetchAndSetParams(task, parameterType);
    }
  }, [task, parameterType]);

  const handleStartTraining = () => {
    let url = SERVER_URL + `/ui/create_project`;
    let payload = {
      task: task,
      params: config,
      project_name: projectName,
      hardware: "local-ui", // TODO: update this, if want to support hf spaces infra
      base_model: config.model_name_or_path,
      column_mapping: { text_column: "text", target_column: "target" },
      hub_dataset: config.dataset_name, // TODO: update this
      train_split: "train", // TODO: update this
      valid_split: "test", // TODO: update this
      username: "thebeginner86",
    };
    axios
      .post(url, JSON.stringify(payload), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((resp) => {
        console.log(resp.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Dataset Name"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              {tasksOpts.map((option) => (
                <Card
                  onClick={() => handleTaskChange(option.value)}
                  key={option.value}
                  sx={{
                    margin: 1,
                    backgroundColor:
                      selectedTask === option.value ? "#e0f8ff" : "white",
                    transition: "background-color 0.3s",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
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
      case 1:
        return (
          <Box>
            <TextField
              select
              label="Choose Parameter Type"
              value={parameterType}
              onChange={handleParameterTypeChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="full">Advanced</MenuItem>
            </TextField>
            <TextField
              select
              label="Choose Model"
              value={selectedModel}
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
      case 2:
        return (
          <Box>
            <Typography variant="h6">Training Configuration</Typography>
            <Grid container spacing={2}>
              {Object.keys(params).map((k) => {
                let type = params[k].type;
                let label = params[k].label;
                let options = params[k].options;
                return (
                  <Grid item xs={12} sm={6} key={k}>
                    {type === "dropdown" ? (
                      <TextField
                        select
                        label={`Choose ${label}`}
                        value={config[k] || ""}
                        onChange={(e) => handleSetConfigKey(k, e.target.value)}
                        fullWidth
                      >
                        {options.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField
                        label={label}
                        value={config[k] || ""}
                        onChange={(e) => handleSetConfigKey(k, e.target.value)}
                        fullWidth
                      />
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6">Script Component</Typography>
            {/* Add your script component here */}
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          <Box sx={{ mt: 2, mb: 1 }}>{getStepContent(activeStep)}</Box>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}
