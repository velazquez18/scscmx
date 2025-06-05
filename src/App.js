import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
  const [idPesa, setIdPesa] = useState("");
  const [pesoTara, setPesoTara] = useState("00.0000");

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
              <CountPage
                idPesa={idPesa}
                setIdPesa={setIdPesa}
                weight={weightData}
                setWeightData={setWeightData}
                setPesoTara={setPesoTara}
                pesoTara={pesoTara}
              />
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
              <SamplingPage idPesa={idPesa} weight={weightData} />
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
