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
  const [localWeight, setLocalWeight] = useState("0.000"); // Nuevo estado para el peso local

  // Usar la variable de entorno para la URL
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Conectar a la aplicación local para obtener el peso
  useEffect(() => {
    const fetchLocalWeight = async () => {
      try {
        const response = await fetch('http://localhost:3002'); // Cambia a 3002
        if (!response.ok) {
          throw new Error('Error al obtener el peso local');
        }
        const data = await response.json();
        setLocalWeight(data.peso || "0.000"); // Actualiza el estado con el peso local
      } catch (err) {
        console.error('Error al obtener el peso local:', err.message);
      }
    };

    // Llamar a la API local cada segundo
    const interval = setInterval(fetchLocalWeight, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);

  // Conectar Socket.IO al backend desplegado
  useEffect(() => {
    const socket = io(backendUrl);

    socket.on("serialData", (data) => {
      console.log("Datos recibidos en App.js:", data);
      setWeightData({ pesoBruto: data.pesoBruto || "0.000" });
    });

    return () => {
      socket.disconnect();
    };
  }, [backendUrl]);

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
              <CountPage weight={{ ...weightData, localWeight }} /> // Pasar el peso local
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
              <SamplingPage weight={{ ...weightData, localWeight }} /> // Pasar el peso local
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