import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "xterm/css/xterm.css";
import { SERVER_URL } from "@/lib/constants";

const Logs = ({ hostingServerType }) => {
  const terminalRef = useRef(null);
  const term = useRef(null);

  useEffect(() => {
    // Initialize the terminal
    term.current = new Terminal({
      rows: 30,
      cols: 150,
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

    // Set up EventSource to stream logs
    const url = `${SERVER_URL}/ui/logs/stream`;
    const sse = new EventSource(url);

    sse.onmessage = (e) => {
      console.log("Received message: ", e.data); // Debug log
      term.current.write(e.data + "\n");
    };

    sse.onerror = (e) => {
      console.error("EventSource error: ", e);
      sse.close();
    };
    return () => {
      sse.close();
    };
  }, [hostingServerType]);

  return (
    <div>
      <h3>Logs</h3>
      <div
        ref={terminalRef}
        style={{
          width: "100%",
          height: "500px",
          overflow: "auto",
        }}
      ></div>
    </div>
  );
};

export default Logs;
