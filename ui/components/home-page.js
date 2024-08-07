import React, {useEffect, useState} from 'react'
import { Box, TextField, MenuItem, Typography, Grid, Button } from '@mui/material';
import axios from 'axios';
import { SERVER_URL } from '@/lib/constants';

export default function HomePage() {

  const [task, setTask] = useState("");
  const [params, setParams] = useState({})
  const [config, setConfig] = useState({})
  const [showTrainingConfig, setShowTrainingConfig] = useState(false);

  // TODO: Update to fetch from API
  const tasksOpts = [
    { value: "text-classification", label: "Text Classification" },
    { value: "text-regression", label: "Text Regression" },
    { value: "audio-classification", label: "Audio Classification" },
    { value: "causual-language-modeling", label: "Causal Language Modeling" },
  ]

  const handleSetConfigKey = (key, value) => {
    setConfig((prev) => {
      return {
        ...prev,
        [key]: value
      }
    });
  }

  const sanitizeParams = (params) => {
    let newParams = {};

    Object.keys(params).forEach((key) => {
      let val = params[key];
      let type = val.type;
      let def = val.default;
      let defaultVal = typeof def == "boolean" ? def == true ? "true" : "false" : def;
      let options = type == "dropdown" ? val.options : [];
      let newOpts = []
      if (type == "dropdown") {
        newOpts = options.map((op) => {
          return op == true ? "true" : op == false ? "false" : op
        })
      }

      newParams[key] = {
        type: type,
        label: val.label,
        default: defaultVal,
        options: newOpts
      }
    })
    return newParams;
  }

  const handleTaskChange = (event) => {
    setShowTrainingConfig(true)
    let val = event.target.value;
    setTask(val);
    let url = SERVER_URL + `/ui/params/` + val + `/basic` 
    axios.get(url).then((resp) => {
      let _params = sanitizeParams(resp.data);
      setParams(_params);
      Object.keys(_params).forEach((key) => {
        handleSetConfigKey(key, _params[key].default);
      });
    })
  }

  const handleStartTraining = () => { 
    let url = SERVER_URL + `/ui/create_project`
    let payload = {
      task: task,
      params: config,
      project_name: "test", // TODO: update this
      hardware: "local-ui", // TODO: update this
      base_model: config.model_name_or_path,
      column_mapping: { text_column: "text", target_column: "target" },
      hub_dataset: config.dataset_name, // TODO: update this
      train_split: "train", // TODO: update this
      valid_split: "test", // TODO: update this
      username: "thebeginner86"
    };
    axios.post(url, JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((resp) => { 
      console.log(resp.data);
    }).catch((err) => { console.error(err) });
  }

  useEffect(() => { }, [config]);

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
        <div>
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
        </div>
      </Box>
      {showTrainingConfig && (
        <>
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "25ch" },
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
                    margin: "0.1rem",
                  }}
                  key={k}
                >
                  {type == "dropdown" ? (
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
            <Button variant="contained" color="primary" onClick={() => handleStartTraining()} >
              Start
           </Button> 
        </Box>
        </>
      )}
    </>
  );
}
