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
import ShowDetails from "./custom/show-details";
import Logs from "./custom/Logs";
import Dashboard from "./custom/Dashboards";
import { handleStartTraining } from "@/actions/startTraining";

const steps = [
  "Project Details",
  "Model Selection",
  "Parameters",
  "Script",
  "Logs and Metrics",
  "Outcome",
];

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
  const [responseData, setResponseData] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showLogs, setShowLogs] = useState(false); // State to manage Logs visibility

  const handleProjectDataChange = (newData) => {
    setProjectData((prevData) => ({ ...prevData, ...newData }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box
            sx={{
              dispaly: "flex",
              flexDirection: "row",
              // alignItems: "center",
              // justifyContent: "center",
              width: "70%",
            }}
          >
            <ProjectDetails
              projectData={projectData}
              onDataChange={handleProjectDataChange}
            />
          </Box>
        );
      case 1:
        return (
          <Box
            sx={{
              dispaly: "flex",
              flexDirection: "row",
              // alignItems: "center",
              // justifyContent: "center",
              width: "70%",
            }}
          >
            <ModelSelection
              projectData={projectData}
              onDataChange={handleProjectDataChange}
            />
          </Box>
        );
      case 2:
        return (
          <Parameters
            projectData={projectData}
            onDataChange={handleProjectDataChange}
          />
        );
      case 3:
        return (
          <ShowDetails
            task={projectData.task}
            config={projectData.config}
            projectName={projectData.projectName}
            datasetName={projectData.datasetName}
            isSaved={isSaved}
          />
        );
      case 4:
        return (
          <>
            <Box
      sx={{
        dispaly: "flex",
        flexDirection: "row",
        // width: "100vw",
      }}
            >
              <Logs
                hostingServerType={projectData.hostingServerType}
                projectData={projectData}
              />
              <Dashboard url="http://g2-r2-2.iind.intel.com:30091/d/adw5vgtarwn40b/tgi-dashboard?orgId=1" />
            </Box>
          </>
        );
      case 5:
        return (
          <>
            <Box
              sx={{
                dispaly: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                // width: "100vw",
              }}
            >
              <Dashboard url="http://g2-r2-2.iind.intel.com:31015" />
            </Box>
          </>
        );
      default:
        return "Unknown step";
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length) {
      handleStartTraining(projectData, setResponseData);
      setShowLogs(true); // Show Logs when Finish is clicked
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
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
    setShowLogs(false); // Reset Logs visibility
  };

  return (
    <Box
      sx={{
        height: "80vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "100%", flexGrow: 1 }}>
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
            <Box
              sx={{
                mt: 2,
                mb: 1,
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getStepContent(activeStep)}
            </Box>
          </>
        )}
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          width: "60%",
          // left: 0,
          // right: 0,
          padding: 2,
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "white", // Ensure background color for the button area
        }}
      >
        <Button
          variant="contained"
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={
            steps.length == 3 ? handleStartTraining(projectData) : handleNext
          }
        >
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Box>
  );
}
