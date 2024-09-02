import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import axios from "axios";
import { SERVER_URL } from "@/lib/constants";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function HomePage() {
  const [task, setTask] = useState("");
  const [params, setParams] = useState({});
  const [modelChoice, setModelChoice] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [config, setConfig] = useState({});
  const [showTrainingConfig, setShowTrainingConfig] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [datasetName, setDatasetName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [parameterType, setParameterType] = useState("");
  const [responseData, setResponseData] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  
  const [createProj, setCreateProj] = useState("");

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

  const handleTaskChange = (event) => {
    const newTask = event.target.value;
    setTask(newTask);
    setIsSaved(false);
    if (parameterType === "") return;
    setShowTrainingConfig(true);
    fetchAndSetParams(newTask, parameterType);
    console.log("Task changed");
  };

  useEffect(() => {
    if (task !== "" && parameterType !== "") {
      fetchAndSetParams(task, parameterType);
    }
  }, [task, parameterType]);

  const handleStartTraining = () => {
    console.log("Start training...")
    let url = SERVER_URL + `/ui/run_training`;
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
        setResponseData(resp.data);
        console.log(resp.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchMarkdownContent = async () => {
    try {
      let url = SERVER_URL + `/ui/get_markdown`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const text = await response.text();
      setMarkdownContent(text);
    } catch (error) {
      console.error("Error fetching markdown file:", error);
    }
  };

  const showDetails = () => {
    console.log("Details are being shown")
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
        setResponseData(resp.data);
        fetchMarkdownContent();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <>
      <Box
        component="form"
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
        noValidate
        autoComplete="off"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <TextField
            id="outlined-controlled"
            label="Project Name"
            value={projectName}
            onChange={(event) => {
              setProjectName(event.target.value);
            }}
            size="small"
          />
          <TextField
            id="outlined-controlled"
            label="Dataset Name"
            value={datasetName}
            onChange={(event) => {
              setDatasetName(event.target.value);
              console.log("Dataset name changed to: ", datasetName);
            }}
            size="small"
          />
          <TextField
            id="outlined-select-currency"
            select
            label="Choose Task"
            value={task}
            onChange={(e) => {
              handleTaskChange(e);
            }}
            size="small"
          >
            {tasksOpts.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="outlined-select-currency"
            select
            label="Choose Parameter Type"
            value={parameterType}
            onChange={(e) => {
              handleParameterTypeChange(e);
            }}
            size="small"
          >
            <MenuItem key="basic" value="basic">
              Basic
            </MenuItem>
            <MenuItem key="Full" value="full">
              Advanced
            </MenuItem>
          </TextField>
          <TextField
            id="outlined-select-model"
            select
            label="Choose Model"
            value={selectedModel}
            onChange={(e) => {
              handleModelChoiceChange(e);
            }}
            size="small"
          >
            {modelChoice.map((option) => (
              <MenuItem key={option.id} value={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={handleSave} size="small">
            Save
          </Button>
        </Box>
      </Box>
      {showTrainingConfig && (
        <>
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <Box>
              <Typography variant="h5">Training Configuration</Typography>
            </Box>
            <Grid container>
              {Object.keys(params).map((k) => {
                let type = params[k].type;
                let label = params[k].label;
                let options = params[k].options;
                return (
                  <Grid
                    item
                    sx={{
                      margin: '0.1rem',
                    }}
                    key={k}
                  >
                    {type === 'dropdown' ? (
                      <TextField
                        id="outlined-select-currency"
                        select
                        label={`Choose ${label}`}
                        value={config[k]}
                        size="small"
                        name={k}
                        onChange={(e) => {
                          handleSetConfigKey(k, e.target.value);
                        }}
                      >
                        {options.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField
                        id="outlined-controlled"
                        label={label}
                        value={config[k]}
                        name={k}
                        onChange={(event) => {
                          handleSetConfigKey(k, event.target.value);
                        }}
                        size="small"
                      />
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          <Box>
            {showDetails && (
              <Button
                variant="contained"
                color="primary"
                onClick={showDetails}
                disabled={isSaved}
              >
                Show Details
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartTraining}
              disabled={isSaved}
              sx={{ marginLeft: showDetails ? '1rem' : '0' }} // Adjust margin if both buttons are present
            >
              Start Training
            </Button>
            {markdownContent && (
              <Box
                mt={2}
                sx={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  padding: '1rem',
                }}
              >
                <Typography variant="h6">Content:</Typography>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdownContent}
                </ReactMarkdown>
              </Box>
            )}
          </Box>
        </>
      )}
    </>
  );
}
