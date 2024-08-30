import { SERVER_URL } from "@/lib/constants";
import axios from "axios";

export const handleStartTraining = (projectData) => {
  let url = `${SERVER_URL}/ui/create_project`;
  let payload = {
    task: projectData.task,
    params: projectData.config,
    project_name: projectData.projectName,
    hardware: "local-ui", // TODO: update this, if want to support hf spaces infra
    base_model: projectData.config.model_name_or_path,
    column_mapping: { text_column: "text", target_column: "target" },
    hub_dataset: projectData.config.dataset_name, // TODO: update this
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
      console.log(resp.data);
    })
    .catch((err) => {
      console.error(err);
    });
};
