import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logo from "../assets/images/SIAUMex_.PNG";

// Usar la variable de entorno para la URL del backend
const backendUrl = process.env.REACT_APP_BACKEND_URL;

function LoginPage({ onLogin }) {
  const [status, setStatus] = useState("Esperando escaneo...");
  const [rfidValue, setRfidValue] = useState("");
  const navigate = useNavigate();

  const authenticateWithRFID = async (rfid) => {
    try {
      const response = await fetch(`${backendUrl}/api/login`, {
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


  useEffect(() => {

    const handleRFIDScan = (event) => {
    const key = event.key;

    if (key === "Enter") {
      authenticateWithRFID(rfidValue);
      setRfidValue("");
    } else {
      setRfidValue((prevValue) => prevValue + key);
    }
  };
  
    document.addEventListener("keypress", handleRFIDScan);

    return () => {
      document.removeEventListener("keypress", handleRFIDScan);
    };
  }, [rfidValue]);

  return (
    <div className="login-container">
      <div className="logo">
        <img src={logo} alt="SIAUMex Logo" style={{ width: "250px", height: "auto" }} />
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