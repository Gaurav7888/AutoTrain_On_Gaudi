import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SERVER_URL } from "@/lib/constants";

const ShowDetails = ({ task, config, projectName, datasetName, isSaved }) => {
  const [responseData, setResponseData] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");

  const fetchMarkdownContent = async () => {
    try {
      let url = SERVER_URL + `/ui/get_markdown`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const text = await response.text();
      setMarkdownContent(text);
    } catch (error) {
      console.error("Error fetching markdown file:", error);
    }
  };

  const handleShowDetails = () => {
    console.log("Details are being shown");
    let url = SERVER_URL + `/ui/create_project`;
    let payload = {
      task: task || "llm:sft", // Ensure this is a string
      params: config || {}, // Ensure this is an object
      project_name: projectName || "test", // Ensure this is a string
      hardware: "local-ui", // String is expected
      base_model: config.model_name_or_path || "test", // Ensure this is a string
      column_mapping: { text_column: "text", target_column: "target" }, // Ensure this structure matches
      hub_dataset: datasetName || "test", // Ensure this is a string
      train_split: "train", // Ensure this is a string
      valid_split: "test", // Ensure this is a string
      username: "thebeginner86", // Ensure this is a string
    };

    axios
      .post(url, JSON.stringify(payload), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((resp) => {
        setResponseData(resp.data);
        fetchMarkdownContent();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleShowDetails}
        disabled={isSaved}
      >
        Show Script
      </Button>
      {markdownContent && (
        <Box
          mt={2}
          sx={{
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid #ddd",
            padding: "1rem",
          }}
        >
          <Typography variant="h6">Content:</Typography>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </Box>
      )}
    </Box>
  );
};

export default ShowDetails;
