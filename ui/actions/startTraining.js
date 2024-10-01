import { SERVER_URL } from "@/lib/constants";
import axios from "axios";

export const handleStartTraining = (projectData) => {
  
  let url = `${SERVER_URL}/run_training`;
  // let payload = {
  //   task: projectData.task,
  //   params: projectData.config,
  //   project_name: projectData.projectName,
  //   hardware: "local-ui", // TODO: update this, if want to support hf spaces infra
  //   base_model: projectData.config.model_name_or_path,
  //   column_mapping: { text_column: "text", target_column: "target" },
  //   hub_dataset: projectData.config.dataset_name, // TODO: update this
  //   train_split: "train", // TODO: update this
  //   valid_split: "test", // TODO: update this
  //   username: "thebeginner86",
  // };
  let payload = {
    task: projectData.task || "llm:sft", // Ensure this is a string
    params: projectData.config || {}, // Ensure this is an object
    project_name: projectData.projectName || "test", // Ensure this is a string
    hardware: "local-ui", // String is expected
    base_model: projectData.config.model_name_or_path || "distilbert/distilgpt2", // Ensure this is a string
    column_mapping: { text_column: "text", target_column: "target" }, // Ensure this structure matches
    hub_dataset: projectData.config.datasetName || "test", // Ensure this is a string
    train_split: "train", // Ensure this is a string
    valid_split: "test", // Ensure this is a string
    username: "thebeginner86", // Ensure this is a string
  };
  console.log("Payload: ", payload)
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
