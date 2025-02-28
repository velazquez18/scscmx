import React, { useState, useEffect, useRef } from "react";
import "../styles/navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const NavBar = ({ onLogout, toggleDarkMode, darkMode }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú hamburguesa
  const [userData, setUserData] = useState({ fullName: "", tipo: "" });
  const dropdownRef = useRef(null);
  const menuRef = useRef(null); // Referencia para el menú hamburguesa
  const navigate = useNavigate();

  // Función para manejar el clic en el icono del usuario
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  // Función para obtener las iniciales del usuario
  const getInitials = (name) => {
    if (!name) return ""; // Si no hay nombre, no mostramos nada

    const nameArray = name.split(" ");
    const initials =
      nameArray.length > 1
        ? nameArray[0][0] + nameArray[1][0]
        : nameArray[0][0] + nameArray[0][1]; // Si solo tiene un nombre
    return initials.toUpperCase();
  };

  // useEffect para cargar los datos del usuario basados en el RFID guardado en localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      const rfid = localStorage.getItem("rfid");
      if (rfid) {
        try {
          const response = await axios.post(
            "http://localhost:3001/api/getUserData",
            { rfid }
          );

          if (response.data) {
            setUserData(response.data);
          } else {
            console.log("No se encontró usuario para el RFID: ", rfid);
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
        }
      } else {
        console.log("RFID no encontrado en LocalStorage");
      }
    };

    fetchUserData();
  }, []);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("rfid");
    onLogout();
    navigate("/");
  };

  // useEffect para cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar el menú desplegable del usuario si se hace clic fuera
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }

      // Cerrar el menú hamburguesa si se hace clic fuera
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Función para alternar el menú hamburguesa
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función para cerrar el menú hamburguesa al seleccionar una opción
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header>
      {/* Logo y menú hamburguesa */}
      <div className="left-section">
        <div
          className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="logo">
          <img src={require("../assets/images/SIAUMex_.PNG")} alt="LOGO" />
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className={isMenuOpen ? "open" : ""} ref={menuRef}>
        <ul>
          <li>
            <NavLink
              to="/conteo"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu} // Cierra el menú al hacer clic
            >
              Conteo de Piezas
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/orden-produccion"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu} // Cierra el menú al hacer clic
            >
              Orden de Produccion
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/muestreo"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu} // Cierra el menú al hacer clic
            >
              Muestreo
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Ícono de usuario */}
      <div className="user-icon" onClick={toggleDropdown} ref={dropdownRef}>
        <div className="user-avatar">
          {getInitials(userData.fullName || "")}
        </div>
        {isDropdownVisible && (
          <div className="dropdown-menu">
            <ul>
              <li>{userData.tipo}</li>
              <li>{userData.fullName}</li>
              <li>
                <button onClick={handleLogout}>Cerrar Sesión</button>
              </li>
              <li>
                <button onClick={toggleDarkMode}>
                  <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;