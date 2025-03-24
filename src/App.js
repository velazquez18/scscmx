import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client"; // Importar io desde socket.io-client
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

  // URL del backend (Render)
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // URL de LocalTunnel para el servidor WebSocket
  const localTunnelUrl = "https://tidy-pigs-mix.loca.lt";

  // Conectar al servidor WebSocket (usando LocalTunnel)
  useEffect(() => {
    const socket = io(localTunnelUrl); // Conectar al servidor WebSocket usando la URL de LocalTunnel

    // Escuchar el evento 'peso' para recibir el peso en tiempo real
    socket.on('peso', (data) => {
      console.log('Peso recibido:', data.peso);
      setWeightData({ pesoBruto: data.peso || "0.000" }); // Actualizar el estado con el nuevo peso
    });

    // Manejar errores de conexión
    socket.on('connect_error', (error) => {
      console.error('Error en la conexión WebSocket:', error);
    });

    // Cerrar la conexión al desmontar el componente
    return () => {
      socket.disconnect();
    };
  }, []); // Dependencia vacía para que solo se ejecute una vez

  // Ejemplo de cómo usar el backend para otras solicitudes HTTP
  const fetchDataFromBackend = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/data`);
      if (!response.ok) {
        throw new Error('Error al obtener los datos del backend');
      }
      const data = await response.json();
      console.log('Datos del backend:', data);
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

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
              <CountPage weight={weightData} /> // Pasar el peso recibido por WebSocket
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
              <SamplingPage weight={weightData} /> // Pasar el peso recibido por WebSocket
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