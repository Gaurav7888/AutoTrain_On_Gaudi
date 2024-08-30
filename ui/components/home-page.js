// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Stepper,
//   Step,
//   StepLabel,
//   StepButton,
//   Button,
//   Typography,
//   TextField,
//   MenuItem,
//   Grid,
//   Card,
//   CardActionArea,
//   CardContent,
// } from "@mui/material";

// const steps = ["Project Details", "Model Selection", "Parameters", "Script"];
// import axios from "axios";
// import { SERVER_URL } from "@/lib/constants";

// export default function HomePage() {
//   const [task, setTask] = useState("");
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [params, setParams] = useState({});
//   const [modelChoice, setModelChoice] = useState([]);
//   const [selectedModel, setSelectedModel] = useState("");
//   const [config, setConfig] = useState({});
//   const [showTrainingConfig, setShowTrainingConfig] = useState(false);
//   const [projectName, setProjectName] = useState("");
//   const [datasetName, setDatasetName] = useState("");
//   const [isSaved, setIsSaved] = useState(false);
//   const [parameterType, setParameterType] = useState("");
//   const [activeStep, setActiveStep] = useState(0);

//   // TODO: Update to fetch from API
//   const tasksOpts = [
//     { value: "llm:sft", label: "LLM: Supervised Finetuning" },
//     { value: "llm:generic", label: "LLM: Generic" },
//     { value: "text-classification", label: "Text: Text Classification" },
//     { value: "text-regression", label: "Text: Text Regression" },
//     { value: "audio-classification", label: "Audio: Audio Classification" },
//     { value: "causual-language-modeling", label: "Causal Language Modeling" },
//     // TODO: Add only implemented tasks here
//   ];

//   const handleSetConfigKey = (key, value, params) => {
//     if (params && params[key]) {
//       if (params[key].type === "boolean") {
//         value = value === "true";
//       }
//       if (params[key].type === "number") {
//         value = parseInt(value);
//       }
//       if (params[key].type === "float") {
//         value = parseFloat(value);
//       }
//     }

//     setConfig((prev) => {
//       return {
//         ...prev,
//         [key]: value,
//       };
//     });
//     console.log("Setting key: ", key, " with value: ", value);
//     console.log("Config: ", config);
//   };

//   const handleSave = () => {
//     handleSetConfigKey("dataset_name", datasetName, null);
//     setIsSaved(true);
//   };

//   const sanitizeParams = (params) => {
//     let newParams = {};

//     Object.keys(params).forEach((key) => {
//       let val = params[key];
//       let type = val.type;
//       let def = val.default;
//       let defaultVal =
//         typeof def == "boolean" ? (def == true ? "true" : "false") : def;
//       let options = type == "dropdown" ? val.options : [];
//       let newOpts = [];
//       if (type == "dropdown") {
//         newOpts = options.map((op) => {
//           return op == true ? "true" : op == false ? "false" : op;
//         });
//       }

//       newParams[key] = {
//         type: type,
//         label: val.label,
//         default: defaultVal,
//         options: newOpts,
//       };
//     });
//     return newParams;
//   };

//   const handleModelChoiceChange = (event) => {
//     setIsSaved(false);
//     let val = event.target.value;
//     setSelectedModel(val);

//     const selectedChoice = modelChoice.find((choice) => choice.name === val);

//     let key = "model_name_or_path";
//     handleSetConfigKey(key, selectedChoice.name, selectedChoice);

//     console.log("Model choice changed");
//   };

//   useEffect(() => {
//     const handleRetrieveModelChoices = (task) => {
//       if (task == "") {
//         console.log("Task is not chosen");
//         return;
//       }
//       let url = SERVER_URL + `/ui/model_choices/` + task;
//       axios.get(url).then((resp) => {
//         let choice = resp.data;
//         console.log("resp: ", resp);
//         console.log("choice: ", choice);
//         setModelChoice(choice);
//       });
//       console.log("Model choices retrieved", modelChoice);
//     };
//     if (task !== "") {
//       handleRetrieveModelChoices(task);
//     }
//   }, [task]);

// const fetchAndSetParams = (task, parameterType) => {
//   let url = `${SERVER_URL}/ui/params/${task}/${parameterType}`;
//   axios.get(url).then((resp) => {
//     console.log("params fetched from ", SERVER_URL);
//     let _params = sanitizeParams(resp.data);
//     setParams(_params);
//     console.log("Params: ", _params);
//     Object.keys(_params).forEach((key) => {
//       handleSetConfigKey(key, _params[key].default, _params);
//     });
//   });
// };

//   const handleParameterTypeChange = (event) => {
//     const newParameterType = event.target.value;
//     setParameterType(newParameterType);
//     setIsSaved(false);
//     setShowTrainingConfig(true);
//     console.log("before ");
//     fetchAndSetParams(task, newParameterType);
//     console.log("Parameter type changed", newParameterType);
//   };

//   const handleTaskChange = (newTask) => {
//     if (selectedTask === newTask) {
//       // Deselect the task if it's clicked again
//       setSelectedTask(null);
//       setTask("");
//       setIsSaved(false);
//       setShowTrainingConfig(false);
//       console.log("Task deselected");
//     } else {
//       // Select the new task
//       setSelectedTask(newTask);
//       setTask(newTask);
//       setIsSaved(false);
//       if (parameterType !== "") {
//         setShowTrainingConfig(true);
//         fetchAndSetParams(newTask, parameterType);
//       }
//       console.log("Task changed");
//     }
//   };

//   useEffect(() => {
//     if (task !== "" && parameterType !== "") {
//       fetchAndSetParams(task, parameterType);
//     }
//   }, [task, parameterType]);

//   const handleStartTraining = () => {
//     let url = SERVER_URL + `/ui/create_project`;
//     let payload = {
//       task: task,
//       params: config,
//       project_name: projectName,
//       hardware: "local-ui", // TODO: update this, if want to support hf spaces infra
//       base_model: config.model_name_or_path,
//       column_mapping: { text_column: "text", target_column: "target" },
//       hub_dataset: config.dataset_name, // TODO: update this
//       train_split: "train", // TODO: update this
//       valid_split: "test", // TODO: update this
//       username: "thebeginner86",
//     };
//     axios
//       .post(url, JSON.stringify(payload), {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       .then((resp) => {
//         console.log(resp.data);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   };

//   const handleNext = () => {
//     setActiveStep((prevActiveStep) => prevActiveStep + 1);
//   };

//   const handleBack = () => {
//     setActiveStep((prevActiveStep) => prevActiveStep - 1);
//   };

//   const handleReset = () => {
//     setActiveStep(0);
//   };

//   const handleStep = (step) => () => {
//     setActiveStep(step);
//   };

//   const getStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "space-between",
//               gap: "1rem",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 gap: "1rem",
//               }}
//             >
//               <TextField
//                 id="1"
//                 label="Project Name"
//                 value={projectName}
//                 onChange={(e) => setProjectName(e.target.value)}
//                 margin="normal"
//                 fullWidth
//               />
//               <TextField
//                 id="2"
//                 label="Dataset Name"
//                 value={datasetName}
//                 onChange={(e) => setDatasetName(e.target.value)}
//                 margin="normal"
//                 fullWidth
//               />
//             </Box>
//             <Box
//               sx={{
//                 display: "flex",
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "space-evenly",
//                 gap: "1rem",
//                 flexWrap: "wrap",
//               }}
//             >
//               {tasksOpts.map((option) => (
//                 <Card
//                   elevation={3}
//                   onClick={() => handleTaskChange(option.value)}
//                   key={option.value}
//                   sx={{
//                     // margin: 1,
//                     backgroundColor:
//                       selectedTask === option.value ? "#e0f8ff" : "white",
//                     transition: "background-color 0.3s",
//                     width: "30%",
//                     "&:hover": {
//                       backgroundColor: "#e0e0e0",
//                     },
//                   }}
//                 >
//                   <CardActionArea>
//                     <CardContent>
//                       <Typography>{option.label}</Typography>
//                     </CardContent>
//                   </CardActionArea>
//                 </Card>
//               ))}
//             </Box>
//           </Box>
//         );
//       case 1:
//         return (
//           <Box>
//             <TextField
//               id="4"
//               select
//               label="Choose Model"
//               value={selectedModel}
//               onChange={handleModelChoiceChange}
//               fullWidth
//               margin="normal"
//             >
//               {modelChoice.map((option) => (
//                 <MenuItem key={option.id} value={option.name}>
//                   {option.name}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </Box>
//         );
//       case 2:
//         return (
//           <Box>
//             <TextField
//               id="3"
//               select
//               label="Choose Parameter Type"
//               value={parameterType}
//               onChange={handleParameterTypeChange}
//               fullWidth
//               margin="normal"
//             >
//               <MenuItem value="basic">Basic</MenuItem>
//               <MenuItem value="full">Advanced</MenuItem>
//             </TextField>
//             <Typography variant="h6">Training Configuration</Typography>
//             <Grid container spacing={2}>
//               {Object.keys(params).map((k) => {
//                 let type = params[k].type;
//                 let label = params[k].label;
//                 let options = params[k].options;
//                 return (
//                   <Grid item xs={12} sm={6} key={k}>
//                     {type === "dropdown" ? (
//                       <TextField
//                         select
//                         label={`Choose ${label}`}
//                         value={config[k] || ""}
//                         onChange={(e) => handleSetConfigKey(k, e.target.value)}
//                         fullWidth
//                       >
//                         {options.map((option) => (
//                           <MenuItem key={option} value={option}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </TextField>
//                     ) : (
//                       <TextField
//                         id="5"
//                         label={label}
//                         value={config[k] || ""}
//                         onChange={(e) => handleSetConfigKey(k, e.target.value)}
//                         fullWidth
//                       />
//                     )}
//                   </Grid>
//                 );
//               })}
//             </Grid>
//           </Box>
//         );
//       case 3:
//         return (
//           <Box>
//             <Typography variant="h6">Script Component</Typography>
//             {/* Add your script component here */}
//           </Box>
//         );
//       default:
//         return "Unknown step";
//     }
//   };

//   return (
//     <Box sx={{ width: "60%" }}>
//       <Stepper activeStep={activeStep}>
//         {steps.map((label, index) => {
//           const stepProps = {};
//           const labelProps = {};
//           return (
//             <Step key={label} {...stepProps}>
//               <StepButton onClick={handleStep(index)}>
//                 <StepLabel {...labelProps}>{label}</StepLabel>
//               </StepButton>
//             </Step>
//           );
//         })}
//       </Stepper>
//       {activeStep === steps.length ? (
//         <>
//           <Typography sx={{ mt: 2, mb: 1 }}>
//             All steps completed - you're finished
//           </Typography>
//           <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
//             <Box sx={{ flex: "1 1 auto" }} />
//             <Button onClick={handleReset}>Reset</Button>
//           </Box>
//         </>
//       ) : (
//         <>
//           <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
//           <Box sx={{ mt: 2, mb: 1 }}>{getStepContent(activeStep)}</Box>
//           <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
//             <Button
//               color="inherit"
//               disabled={activeStep === 0}
//               onClick={handleBack}
//               sx={{ mr: 1 }}
//             >
//               Back
//             </Button>
//             <Box sx={{ flex: "1 1 auto" }} />
//             <Button onClick={handleNext}>
//               {activeStep === steps.length - 1 ? "Finish" : "Next"}
//             </Button>
//           </Box>
//         </>
//       )}
//     </Box>
//   );
// }
// ./custom/HomePage.js
import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Button,
  Typography,
} from "@mui/material";
import ProjectDetails from "./custom/ProjectDetails";
import ModelSelection from "./custom/ModelSelection";
import Parameters from "./custom/Parameters";
import Script from "./custom/Script";

const steps = ["Project Details", "Model Selection", "Parameters", "Script"];

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState({
    projectName: "",
    datasetName: "",
    task: "",
    model: "",
    parameterType: "",
    config: {},
  });

  const handleProjectDataChange = (newData) => {
    setProjectData((prevData) => ({ ...prevData, ...newData }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ProjectDetails
            projectData={projectData}
            onDataChange={handleProjectDataChange}
          />
        );
      case 1:
        return (
          <ModelSelection
            projectData={projectData}
            onDataChange={handleProjectDataChange}
          />
        );
      case 2:
        return (
          <Parameters
            projectData={projectData}
            onDataChange={handleProjectDataChange}
          />
        );
      case 3:
        return <Script projectData={projectData} />;
      default:
        return "Unknown step";
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setProjectData({
      projectName: "",
      datasetName: "",
      task: "",
      model: "",
      parameterType: "",
      config: {},
    });
  };

  return (
    <Box sx={{ width: "60%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepButton onClick={() => setActiveStep(index)}>
              <StepLabel>{label}</StepLabel>
            </StepButton>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you're finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </>
      ) : (
        <>
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
        </>
      )}
    </Box>
  );
}
