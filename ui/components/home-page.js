import React, {useEffect, useState} from 'react'
import { Box, TextField, MenuItem, Typography, Grid } from '@mui/material';
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
    console.log(key, value);
    const newConfig = Object.keys(config).map((k) => {
      if (k == key) {
        return { [k]: value }
      }
      return { [k]: config[k] }
    })
    setConfig(newConfig);
  }

  const handleTaskChange = (event) => {
    setShowTrainingConfig(true)
    console.log("config: ", config);
    let val = event.target.value;
    setTask(val);
    let url = SERVER_URL + `/ui/params/` + val + `/basic` 
    axios.get(url).then((resp) => {
      let _params = resp.data;
      setParams(_params);
      Object.keys(_params).forEach((key) => {
        console.log(key, _params[key].default);
        handleSetConfigKey(key, _params[key].default);
      });
    })
  }

  // useEffect(() => {

  // }, [config])

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
              let defaultVal = params[k].default;
              let options = type == "dropdown" ? params[k].options : [];
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
                      // defaultValue={defaultVal}
                      size="small"
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
                      // defaultValue={defaultVal}
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
      )}
    </>
  );
}
