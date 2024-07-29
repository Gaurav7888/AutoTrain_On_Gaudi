// app/train/page.js
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./train.module.css";
import { OptionsSelection } from "../components/custom/OptionsSelection";

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

  return (
    <>
      <OptionsSelection
        handleStartTraining={handleStartTraining}
        handleInputChange={handleInputChange}
        formData={formData}
        styles={styles}
      />
      ;
    </>
  );
}
