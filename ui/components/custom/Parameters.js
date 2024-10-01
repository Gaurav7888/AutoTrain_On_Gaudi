import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Button,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { SERVER_URL } from "@/lib/constants";

export default function Parameters({ projectData, onDataChange }) {
  const [params, setParams] = useState({});
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const fetchParams = async () => {
      if (projectData.task && projectData.parameterType) {
        try {
          const response = await axios.get(
            `${SERVER_URL}/params/${projectData.task}/${projectData.parameterType}`
          );
          const sanitizedParams = sanitizeParams(response.data);
          setParams(sanitizedParams);
          setLoading(false);

          // Set default values in the config
          const defaultConfig = {};
          Object.keys(sanitizedParams).forEach((key) => {
            defaultConfig[key] = sanitizedParams[key].default;
          });
          onDataChange({ config: { ...projectData.config, ...defaultConfig } });
        } catch (error) {
          console.error("Error fetching parameters:", error);
        }
      }
    };

    fetchParams();
  }, [projectData.task, projectData.parameterType]);

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
        newOpts = options.map((op) =>
          op === true ? "true" : op === false ? "false" : op.toString()
        );
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

  const handleParameterTypeChange = (type) => {
    setLoading(true);
    onDataChange({ parameterType: type });
  };

  const handleSetConfigKey = (key, value, paramType) => {
    let processedValue = value;
    if (paramType) {
      if (paramType === "boolean") {
        processedValue = value === "true";
      } else if (paramType === "number") {
        processedValue = parseInt(value);
      } else if (paramType === "float") {
        processedValue = parseFloat(value);
      }
    }
    onDataChange({ config: { ...projectData.config, [key]: processedValue } });
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <Typography variant="h6" my={2}>
          Parameter Type
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            height: "2.5rem",
          }}
        >
          <Button
            variant={
              projectData.parameterType === "basic" ? "contained" : "outlined"
            }
            loading={loading}
            onClick={() => handleParameterTypeChange("basic")}
          >
            Basic
          </Button>
          <Button
            variant={
              projectData.parameterType === "full" ? "contained" : "outlined"
            }
            loading={loading}
            onClick={() => handleParameterTypeChange("full")}
          >
            Advanced
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            mt: 2,
          }}
        >
          <CircularProgress />
          Loading Parameters
        </Typography>
      ) : projectData.parameterType === "" ? (
        <></>
      ) : (
        <>
          <Typography variant="h6" my={1}>
            Training Parameters
          </Typography>
          <Box
            sx={{
              height: "50vh",
              padding: "1rem",
              overflowY: "auto",
              // backgroundColor: "yellow",
            }}
          >
            <Grid container spacing={3}>
              {Object.keys(params).map((k) => {
                let type = params[k].type;
                let label = params[k].label;
                let options = params[k].options;
                return (
                  <Grid item xs={12} sm={3} key={k}>
                    {type === "dropdown" ? (
                      <TextField
                        select
                        label={`Choose ${label}`}
                        value={projectData.config[k]?.toString() || ""}
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
                        value={projectData.config[k]?.toString() || ""}
                        onChange={(e) => handleSetConfigKey(k, e.target.value)}
                        fullWidth
                      />
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
}
