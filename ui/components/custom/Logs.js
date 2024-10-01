import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { SERVER_URL } from "@/lib/constants";
import { handleStartTraining } from "@/actions/startTraining";
import ProjectDetails from "./ProjectDetails";
import { Box } from "@mui/material";

const Logs = ({ hostingServerType, projectData }) => {
  const [loading, setLoading] = useState(false);
  const [logContent, setLogContent] = useState("");
   const sseRef = useRef(null);

  useEffect(() => {
    const url = `${SERVER_URL}/stream_logs`;
    sseRef.current = new EventSource(url);

    sseRef.current.onmessage = (e) => {
      console.log("Received message: ", e.data);
      setLogContent((prevLogs) => `${prevLogs}\n${e.data}`);
      // term.current.write(`\r${e.data}\n`);
    };

    sseRef.current.onerror = (e) => {
      console.error("EventSource error: ", e);
      sseRef.current.close();
    };
    return () => {
      sseRef.current.close();
    };
  }, [hostingServerType]);

  useEffect(()=>{
    handleStartTraining(projectData);
  }, [] );

  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <CircularProgress />
          <Typography>Loading Script</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <Box
            sx={{
              minHeight: "10vh",
              maxHeight: "67vh",
              width: "100%",
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "1rem",
              backgroundColor: "#2e2e2e", // Dark grey background
              color: "white", // White text
              fontFamily: "monospace", // Monospace font
              borderRadius: "0.5rem",
              padding: "0rem 2rem",
              whiteSpace: "pre-wrap", // Keep formatting with line breaks
            }}
          >
            {logContent}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Logs;
