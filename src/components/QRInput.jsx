import React, { useState } from "react";

function QRInput({ onQRSubmit }) {
  const [qr, setQr] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const qrParts = qr.split("|");

      if (!qr.includes("|")) {
        setErrorMessage("El código QR debe contener '|' como separador.");
        setQr("");
        return;
      }

      if (qrParts.length !== 6) {
        setErrorMessage(
          "El código QR debe contener exactamente 6 partes separadas por '|'."
        );
        setQr("");
        return;
      }

      setErrorMessage("");
      onQRSubmit(qr);
    }
  };

  return (
    <div className="count-form-section count-form-section">
      <h2>Ingresar QR</h2>
      <div className="input-group count-qr-section">
        <label htmlFor="qr">QR:</label>
        <input
          type="text"
          id="qr-value"
          value={qr}
          onChange={(e) => setQr(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {errorMessage && (
        <div className="error-message">
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

export default QRInput;
