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

  // Usar la variable de entorno para la URL del backend
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    // Conectar Socket.IO al backend desplegado
    const socket = io(backendUrl);

    socket.on("serialData", (data) => {
      console.log("Datos recibidos en App.js:", data);
      setWeightData({ pesoBruto: data.pesoBruto || "0.000" });
    });

    return () => {
      socket.disconnect();
    };
  }, [backendUrl]); // Dependencia de backendUrl

  useEffect(() => {
    const rfid = localStorage.getItem("rfid");
    if (rfid) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

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
          element={
            isAuthenticated ? (
              <OpPage/>
            ) : (
              <Navigate to="/" />
            )
          }
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