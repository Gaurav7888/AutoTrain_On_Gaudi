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
import ShowDetails from "./show-details";
import { handleStartTraining } from "@/actions/startTraining";

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
  const [responseData, setResponseData] = useState("");
  const [isSaved, setIsSaved] = useState(false);

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
        return (
          <ShowDetails
            task={projectData.task}
            config={projectData.config}
            projectName={projectData.projectName}
            datasetName={projectData.datasetName}
            isSaved={isSaved}
          />
        );
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
            <Button
              onClick={
                // activeStep === steps.length - 1
                // ? handleStartTraining(projectData, setResponseData)
                // :
                handleNext
              }
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
