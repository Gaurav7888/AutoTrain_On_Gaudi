import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "xterm/css/xterm.css";
import { SERVER_URL } from "@/lib/constants";
import { handleStartTraining } from "@/actions/startTraining";
import ProjectDetails from "./ProjectDetails";

const Logs = ({ hostingServerType, projectData }) => {
  const terminalRef = useRef(null);
  const term = useRef(null);

  useEffect(() => {
    term.current = new Terminal({
      rows: 30,
      cols: 130,
      cursorBlink: true,
      rendererType: "canvas",
      theme: {
        background: "#000000",
        foreground: "#ffffff",
      },
      letterSpacing: 0,
      scrollback: 1000,
      fontFamily: "monospace",
      fontSize: 14,
    });
  


    if (terminalRef.current) {
      term.current.open(terminalRef.current);
    }

    const url = `${SERVER_URL}/ui/stream_logs`;
    const sse = new EventSource(url);

    sse.onmessage = (e) => {
      console.log("Received message: ", e.data);
      term.current.write(`\r${e.data}\n`);
    };

    sse.onerror = (e) => {
      console.error("EventSource error: ", e);
      sse.close();
    };
    return () => {
      sse.close();
    };
  }, [hostingServerType]);

  useEffect(()=>{
    handleStartTraining(projectData);
  }, [] );

  return (
    <div>
      <h3>Logs</h3>
      <div
        ref={terminalRef}
        style={{
          width: "fit-content",
          // height: "63vh",
          // overflowY: "auto",
          overflowX: "hidden",
          whiteSpace: "pre-wrap",
        }}
      ></div>
    </div>
  );
};

export default Logs;
