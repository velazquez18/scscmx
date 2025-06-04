import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import LoginPage from "./pages/loginPage";
import CountPage from "./pages/countPage";
import NavBar from "./components/navBar";
import SamplingPage from "./pages/samplingpage";
import OpPage from "./pages/OpPage";
import "./styles/login.css";
import "./styles/transition.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [weightData, setWeightData] = useState({ pesoBruto: "0.000" });
  const [connectionStatus, setConnectionStatus] = useState("Conectando...");

  const socketUrl = process.env.REACT_APP_SOCKET_URL;
  const path = process.env.PATH;

  // Conexión WebSocket (Báscula Local)
  useEffect(() => {
    const socket = io(socketUrl, {
      path: path,
      transports: ["polling", "websocket"],
      reconnection: true,
      secure: true,
      rejectUnauthorized: false,
    });

    socket.on("connect", () => {
      console.log("⚡ Conectado al servidor de peso");
      setConnectionStatus("Conectado");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Desconectado");
    });

    socket.on("connect_error", (err) => {
      console.error("Error en conexión:", err.message);
      setConnectionStatus(`Error: ${err.message}`);
    });

    return () => socket.disconnect();
  }, []);

  // Autenticación y tema
  useEffect(() => {
    const rfid = localStorage.getItem("rfid");
    if (rfid) setIsAuthenticated(true);
  }, []);

  const handleLogin = (status) => setIsAuthenticated(status);
  const handleLogout = () => {
    localStorage.removeItem("rfid");
    setIsAuthenticated(false);
  };
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <Router>
      {isAuthenticated && (
        <NavBar
          onLogout={handleLogout}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          connectionStatus={connectionStatus}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/conteo" />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/conteo"
          element={
            isAuthenticated ? (
              <CountPage weight={weightData} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/orden-produccion"
          element={isAuthenticated ? <OpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/muestreo"
          element={
            isAuthenticated ? (
              <SamplingPage weight={weightData} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
