// components/WarningMessage.jsx
import React from "react";
import "../styles/sampling.css";

function WarningMessage({ message, onClose }) {
  return (
    <div className="warning-overlay">
      <div className="warning-box">
        <p>{message}</p>
        <button onClick={onClose}>Okey</button>
      </div>
    </div>
  );
}

export default WarningMessage;