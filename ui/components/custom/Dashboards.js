import React from "react";

const Dashboard = ({ url }) => {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100vw",
    height: "100%",
    minHeight: "300px",
    flexGrow: 1,
    flexShrink: 1,
    overflow: "hidden",
  };

  const iframeStyle = {
    flexGrow: 1,
    width: "100%",
    height: "100%",
    border: 0,
    minHeight: "25rem",
  };

  return (
    <div style={containerStyle}>
      <iframe src={url} style={iframeStyle} title="Dashboard" />
    </div>
  );
};

export default Dashboard;
