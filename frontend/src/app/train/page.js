// app/train/page.js
"use client";
import { Box } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./train.module.css";
import { OptionsSelection } from "../components/custom/OptionsSelection";
import Sidebar from "../components/custom/Sidebar";
import TrainingInterface from "../components/custom/TrainingInterface";

export default function Train() {
  const searchParams = useSearchParams();
  const task = searchParams.get("task") || "";

  const [formData, setFormData] = useState({
    projectName: "",
    baseModel: "",
    datasetSource: "",
    task: task,
    // Add more fields as needed
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStartTraining = () => {
    // Implement the logic to start training with formData
    console.log("Starting training with:", formData);
  };

  const sidebarProps = {
    validUsers: ["user1", "user2"],
    enableLocal: 1,
    enableNgc: 0,
    enableNvcf: 0,
    version: "1.0.0",
  };

  return (
    <>
      {/* <OptionsSelection
        handleStartTraining={handleStartTraining}
        handleInputChange={handleInputChange}
        formData={formData}
        styles={styles}
      /> */}
      <Box display="flex">
        <Sidebar {...sidebarProps} />
        <TrainingInterface />
      </Box>
    </>
  );
}
