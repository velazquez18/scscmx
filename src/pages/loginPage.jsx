import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logo from "../assets/images/SIAUMex_.PNG";

function LoginPage({ onLogin }) {
  const [status, setStatus] = useState("Esperando escaneo...");
  const [rfidValue, setRfidValue] = useState("");
  const navigate = useNavigate();

  const authenticateWithRFID = async (rfid) => {
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rfid }),
      });

      if (response.ok) {
        setStatus("Login exitoso");
        onLogin(true);

        // Guardar el RFID en localStorage
        localStorage.setItem("rfid", rfid);

        // Redirigir a la página de conteo
        navigate("/conteo");
      } else {
        setStatus("RFID no válido");
      }
    } catch (error) {
      setStatus("Error de autenticación");
      console.error("Error de autenticación:", error);
    }
  };

  const handleRFIDScan = (event) => {
    const key = event.key;

    if (key === "Enter") {
      authenticateWithRFID(rfidValue);
      setRfidValue("");
    } else {
      setRfidValue((prevValue) => prevValue + key);
    }
  };

  useEffect(() => {
    document.addEventListener("keypress", handleRFIDScan);

    return () => {
      document.removeEventListener("keypress", handleRFIDScan);
    };
  }, [handleRFIDScan]);

  return (
    <div className="login-container">
      <div className="logo">
        <img src={logo} alt="SIAUMex Logo" />
      </div>
      <div className="login-box">
        <h2>Escanea tu tarjeta RFID</h2>
        <p className="auth-status">{status}</p>
        <input type="text" value={rfidValue} style={{ visibility: "hidden" }} readOnly />
      </div>
    </div>
  );
}

export default LoginPage;
