import React, { useEffect, useState } from "react";
import "../styles/sampling.css";
import WarningMessage from "../components/WarningMessage.jsx";
import socket from "../services/socket.js";

// Usar la variable de entorno para la URL del backend
const backendUrl = process.env.REACT_APP_BACKEND_URL;

function SamplingPage({idPesa}) {
  const [id, setId] = useState("");
  const [IdProd, setIdProd] = useState("");
  const [nombreProducto, setProducto] = useState("");
  const [PxP, setPxp] = useState("");
  const [Var1, setVariable1] = useState("");
  const [Var2, setVariable2] = useState("");
  const [Var3, setVariable3] = useState("");
  const [Imagen, setImagen] = useState("");
  const [pesoNeto, setPesoNeto] = useState("00.0000");
  const [piezas, setPiezas] = useState(""); // Estado para el input de piezas
  const [pesoxPieza, setPesoxPieza] = useState("00.0000");
  const [errorMessage, setErrorMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const validateWeight = (w) => {
    return !isNaN(w) && w >= 0 && w <= 1000; // Validar que sea un número y esté en el rango esperado
  };

  // Conectar el servidor al socket
  useEffect(() => {

    socket.on("connect", () => {
      socket.emit('joinPesa', idPesa)
    });

    socket.on("weightData", (data) => {
      if (validateWeight(data.Brut)) {
        const newPesoNeto = parseFloat(data.pesoNeto).toFixed(3); // Convertir a número y formatear

        setPesoNeto(newPesoNeto); // Actualizar pesoNeto localmente
      } else {
        console.warn("Dato de peso inválido recibido:", data.Brut);
      }
    });

    socket.on("disconnect", () => {
    });

    return () => {
      socket.disconnect();
    };
  }, [idPesa, PxP]);

  // Manejar cambios en el input de piezas
  const handlePiezasChange = (e) => {
    const value = e.target.value;

    // Validar que solo se ingresen números
    if (/^\d*$/.test(value)) {
      setPiezas(value);

      // Calcular peso por pieza si hay un valor válido
      if (value && pesoNeto !== "00.0000") {
        const pesoNetoNum = parseFloat(pesoNeto);
        const piezasNum = parseFloat(value);
        const nuevoPesoxPieza = (pesoNetoNum / piezasNum).toFixed(3);
        setPesoxPieza(nuevoPesoxPieza);
      } else {
        setPesoxPieza("00.0000");
      }
    }
  };

  // Función para manejar el clic en el botón ACTUALIZAR
  const handleActualizar = async () => {
    if (!IdProd) {
      setErrorMessage("Primero ingrese un ID.");
      setShowWarning(true);
      return;
    }

    if (!pesoxPieza || pesoxPieza === "00.0000") {
      setErrorMessage("El peso por pieza no es válido.");
      setShowWarning(true);
      return;
    }

    // Convertir ambos valores a números antes de compararlos
    const pxpNum = parseFloat(PxP);
    const pesoxPiezaNum = parseFloat(pesoxPieza);

    // Logs para depuración
    console.log("PxP (formulario superior):", pxpNum);
    console.log("pesoxPieza (cálculo inferior):", pesoxPiezaNum);

    // Comparación directa (sin margen de error)
    if (pxpNum !== pesoxPiezaNum) {
      setErrorMessage("Los valores no son iguales.");
      setShowWarning(true);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/updateData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          IdProd,
          pesoxPieza: pesoxPiezaNum, // Enviar el valor convertido a número
        }),
      });

      const responseData = await response.json(); // Leer la respuesta JSON
      console.log("Respuesta del backend:", responseData); // Log para depuración

      if (response.ok) {
        console.log("Datos actualizados correctamente");
        setErrorMessage("");
        setUpdateSuccess(true); // Mostrar el mensaje de confirmación

        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);

        // Opcional: Actualizar el estado PxP en el frontend con el nuevo valor
        setPxp(pesoxPiezaNum.toString()); // Convertir de nuevo a cadena si es necesario
      } else {
        console.error("Error al actualizar los datos");
        setErrorMessage(
          responseData.error ||
            "Error al actualizar los datos en la base de datos."
        );
        setShowWarning(true);
      }
    } catch (error) {
      console.error("Error de conexión", error);
      setErrorMessage("Error de conexión. Intente nuevamente.");
      setShowWarning(true);
    }
  };

  // Función para cerrar la advertencia
  const closeWarning = () => {
    setShowWarning(false);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!id) {
        setErrorMessage("El campo Id no puede estar vacío.");
        setShowWarning(true); // Mostrar la advertencia
        return;
      }
      // Eliminamos la validación de caracteres especiales
      setErrorMessage("");
      try {
        const response = await fetch(`${backendUrl}/getDataById?id=${id}`);

        if (response.ok) {
          const data = await response.json();
          console.log(data);

          setIdProd(data.IdProd);
          setProducto(data.nombreProducto);
          setPxp(data.PxP);
          setVariable1(data.Var1);
          setVariable2(data.Var2);
          setVariable3(data.Var3);
          setImagen(data.Imagen);

          // Limpiar el campo de Id después de procesarlo
          setId("");
        } else {
          console.error("Error al buscar los datos", response.status);
        }
      } catch (error) {
        console.error("Error de conexión", error);
      }
    }
  };

  return (
    <div className="sampling-main-container">
      {/* Mostrar la advertencia si es necesario */}
      {showWarning && (
        <WarningMessage message={errorMessage} onClose={closeWarning} />
      )}

      <div className="sampling-content-container">
        {/* Sección de Id */}
        <div className="sampling-form-section">
          <h2>Ingresar Id</h2>
          <div className="sampling-group sampling-qr-section">
            <label htmlFor="id">Id:</label>
            <input
              type="text"
              id="id-value"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {/* Mostrar el mensaje de error si es necesario */}
            {showWarning && (
              <WarningMessage message={errorMessage} onClose={closeWarning} />
            )}

            {/* Mostrar el mensaje de confirmación si es necesario */}
            {updateSuccess && (
              <div className="success-message">
                ¡Datos actualizados correctamente!
              </div>
            )}
          </div>
        </div>

        {/* Formulario de datos del producto y la imagen */}
        <div className="sampling-form-section input-image-container">
          <div className="sampling-input-left">
            <div className="sampling-input-container">
              <div className="sampling-input-group">
                <label htmlFor="id">Id:</label>
                <span id="id">{IdProd}</span>
              </div>
              <div className="sampling-input-group">
                <label htmlFor="variable1">Variable 1:</label>
                <span id="variable1">{Var1}</span>
              </div>
              <div className="sampling-input-group">
                <label htmlFor="nombre">Nombre:</label>
                <span id="nombre">{nombreProducto}</span>
              </div>
              <div className="sampling-input-group">
                <label htmlFor="variable2">Variable 2:</label>
                <span id="variable2">{Var2}</span>
              </div>
              <div className="sampling-input-group">
                <label htmlFor="pxp">Peso por pieza:</label>
                <span id="pxp">{PxP}</span>
              </div>
              <div className="sampling-input-group">
                <label htmlFor="variable3">Variable 3:</label>
                <span id="variable3">{Var3}</span>
              </div>
            </div>
          </div>

          {/* Imagen del producto */}
          <div className="image-section count-image-section">
            {Imagen ? (
              <img
                src={Imagen} // Usamos la URL de la imagen recibida del backend
                alt="Imagen del cliente"
                className="client-image"
                onError={(e) => {
                  e.target.src = require("../assets/images/producto.png"); // Imagen predeterminada si falla la carga
                }}
              />
            ) : (
              <img
                src={require("../assets/images/producto.png")} // Imagen predeterminada
                alt="Imagen predeterminada"
                className="default-image"
              />
            )}
          </div>
        </div>

        {/* Sección de peso horizontal */}
        <div className="sampling-form-section peso-section">
          <div className="sampling-peso-container">
            <div className="sampling-input-group">
              <div className="sampling-label-span-container">
                <label htmlFor="piezas">Piezas:</label>
                <input
                  type="text"
                  id="piezas"
                  name="piezas"
                  value={piezas}
                  onChange={handlePiezasChange}
                  disabled={!IdProd} // Deshabilitar si no hay un ID
                />
              </div>
            </div>
            <div className="sampling-input-group">
              <div className="sampling-label-span-container">
                <label htmlFor="peso-bruto">Peso Neto:</label>
                <span id="peso-bruto">{pesoNeto}</span>
              </div>
            </div>
            <div className="sampling-input-group">
              <div className="sampling-label-span-container">
                <label htmlFor="peso-por-pieza">Peso por pieza:</label>
                <span id="peso-por-pieza">{pesoxPieza}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="sampling-button-section">
          <button
            className="sampling-btn-actualizar"
            onClick={handleActualizar}
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SamplingPage;
