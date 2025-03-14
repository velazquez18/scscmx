import React, { useState, useEffect } from "react";
import QRInput from "../components/QRInput.jsx";
import WeightDisplay from "../components/WeightDisplay.jsx";
import { io } from "socket.io-client";
import "../styles/count.css";
import WarningMessage from "../components/WarningMessage.jsx";

// Usar la variable de entorno para la URL del backend
const backendUrl = process.env.REACT_APP_BACKEND_URL;

// Conectar Socket.IO al backend desplegado
const socket = io(backendUrl);

function CountPage() {
  const [qr, setQr] = useState("");
  const [IdProd, setIdProd] = useState("");
  const [Pzas, setPiezas] = useState("");
  const [nombreProducto, setProducto] = useState("");
  const [Emp, setEmpaques] = useState("");
  const [nombreCliente, setCliente] = useState("");
  const [PxP, setPxp] = useState("");
  const [Lote, setLote] = useState("");
  const [Var1, setVariable1] = useState("");
  const [Var2, setVariable2] = useState("");
  const [Var3, setVariable3] = useState("");
  const [pesoBruto, setPesoBruto] = useState("00.0000"); // Estado para el peso bruto
  const [pesoTara, setPesoTara] = useState("00.0000");
  const [pesoNeto, setPesoNeto] = useState("00.0000");
  const [piezasEmpaque, setPiezasEmpaque] = useState("00.0000");
  const [Imagen, setImagen] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [calculationMessage, setCalculationMessage] = useState("..."); // Mensaje de cálculo
  const [messageColor, setMessageColor] = useState("gray"); // Color de la barra
  const [OP, setOP] = useState(""); // Estado para OP
  const [IdClie, setIdClie] = useState(""); // Estado para IdClie
  const [IdEst, setIdEst] = useState(""); // Ejemplo: Estación 1
  const [IdUsu, setIdUsu] = useState(""); // Ejemplo: Usuario 1

  // Función para actualizar el peso bruto
  const handlePesoBrutoChange = (nuevoPesoBruto) => {
    setPesoBruto(nuevoPesoBruto);
  };

  const handleQRSubmit = async (qr) => {
    console.log(`Buscando datos con QR: ${qr}`);
    try {
      const response = await fetch(`${backendUrl}/api/getDataByQr?qr=${qr}`);

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        if (!data) {
          setErrorMessage(
            "El código QR es válido, pero no se encontró en la base de datos."
          );
          setQr("");
          return;
        }

        // Asignar los valores del QR a los estados
        setIdProd(data.IdProd || "");
        setPiezas(data.Pzas || "");
        setProducto(data.nombreProducto || "");
        setEmpaques(data.Emp || "");
        setCliente(data.nombreCliente || "");
        setPxp(data.PxP || "");
        setLote(data.Lote || "");
        setVariable1(data.Var1 || "");
        setVariable2(data.Var2 || "");
        setVariable3(data.Var3 || "");
        setImagen(data.Imagen || "");
        setQrScanned(true);

        // Asignar los valores del QR a los estados adicionales
        setOP(data.OP || "");
        setIdClie(data.IdClie || "");
        setIdEst(data.IdEst || "1");
        setIdUsu(data.IdUsu || "");

        console.log("Datos asignados correctamente:", {
          // Depuración
          OP: data.OP,
          IdClie: data.IdClie,
          IdProd: data.IdProd,
          Pzas: data.Pzas,
          Lote: data.Lote,
        });

        // Enviar PxP al backend
        socket.emit("updatePxP", { PxP: data.PxP });
      } else {
        setErrorMessage("Error al buscar los datos. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error de conexión", error);
      setErrorMessage("Error de conexión. Revisa tu conexión a internet.");
    }
  };

  // Función para cerrar la advertencia
  const closeWarning = () => {
    setShowWarning(false);
  };

  // tarar peso
  const handleTare = () => {
    const newPesoTara = pesoBruto;
    setPesoTara(newPesoTara);
    socket.emit("tareWeight", { pesoTara: newPesoTara });
    console.log(`Peso Tara set: ${newPesoTara}`);
  };

  //barra de mensajes
  const updateCalculationMessage = () => {
    const piezasFormulario = parseInt(Pzas, 10);
    const piezasCalculadas = parseInt(piezasEmpaque, 10);

    if (isNaN(piezasFormulario) || isNaN(piezasCalculadas)) {
      setCalculationMessage("Esperando datos...");
      setMessageColor("gray");
      return;
    }

    if (piezasCalculadas === piezasFormulario) {
      setCalculationMessage("Piezas exactas");
      setMessageColor("green");
    } else if (piezasCalculadas < piezasFormulario) {
      const piezasFaltantes = piezasFormulario - piezasCalculadas;
      setCalculationMessage(`Faltan ${piezasFaltantes} piezas`);
      setMessageColor("orange");
    } else {
      const piezasSobrantes = piezasCalculadas - piezasFormulario;
      setCalculationMessage(`Sobran ${piezasSobrantes} piezas`);
      setMessageColor("red");
    }
  };

  //boton limpiar datos
  const handleCleanData = () => {
    setIdProd("");
    setPiezas("");
    setProducto("");
    setEmpaques("");
    setCliente("");
    setPxp("");
    setLote("");
    setVariable1("");
    setVariable2("");
    setVariable3("");
    setPesoTara("00.0000");
  };

  useEffect(() => {
    if (Pzas && piezasEmpaque) {
      updateCalculationMessage();
    }
  }, [Pzas, piezasEmpaque]);

  // boton registrar
  const handleRegister = async () => {
    const piezasFormulario = parseInt(Pzas, 10);
    const piezasCalculadas = parseInt(piezasEmpaque, 10);

    console.log("Piezas del formulario:", piezasFormulario); // Depuración
    console.log("Piezas calculadas:", piezasCalculadas); // Depuración

    if (isNaN(piezasFormulario) || isNaN(piezasCalculadas)) {
      console.error("Los valores de piezas no son válidos.");
      setErrorMessage("Los valores de piezas no son válidos.");
      setShowWarning(true);
      return;
    }

    if (piezasCalculadas !== piezasFormulario) {
      console.error(
        `Piezas no coinciden: Formulario=${piezasFormulario}, Calculadas=${piezasCalculadas}`
      );
      setErrorMessage("Solo puedes registrar cuando las piezas sean exactas.");
      setShowWarning(true);
      return;
    }

    // Verificar que los campos requeridos no estén vacíos
    if (!OP || !IdClie || !IdProd || !Pzas || !Lote || !pesoBruto) {
      console.error("Faltan campos requeridos:", {
        OP,
        IdClie,
        IdProd,
        Pzas,
        Lote,
        pesoBruto,
      });
      setErrorMessage(
        "Faltan campos requeridos. Asegúrate de escanear el QR correctamente."
      );
      setShowWarning(true);
      return;
    }

    const registroData = {
      Folio: null,
      OP: OP,
      IdClie: IdClie,
      IdProd: IdProd,
      Var1: Var1,
      Var2: Var2,
      Var3: Var3,
      Emp: Emp,
      Pzas: Pzas,
      PxP: PxP,
      Peso: pesoBruto,
      Lote: Lote,
      IdEst: IdEst || "1",
      IdUsu: IdUsu,
      Fecha: new Date().toISOString(),
    };

    console.log("Datos a enviar al backend:", registroData); // Depuración

    try {
      const response = await fetch(`${backendUrl}/api/registrarInventario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registroData),
      });

      if (response.ok) {
        console.log("Registro exitoso.");
        setErrorMessage("");
        setUpdateSuccess(true);

        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error("Error del backend:", errorData);
        alert(`Error al registrar los datos: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión. Revisa tu conexión a internet.");
    }
  };

  return (
    <div className="count-main-container count-container">
      {showWarning && (
        <WarningMessage message={errorMessage} onClose={closeWarning} />
      )}
      <div className="count-content-container count-content">
        <QRInput onQRSubmit={handleQRSubmit} />

        {showWarning && (
          <WarningMessage message={errorMessage} onClose={closeWarning} />
        )}
        {updateSuccess && (
          <div className="success-message">
            ¡Datos registrados correctamente!
          </div>
        )}
        {/* Formulario de datos del producto y imagen */}
        <div className="form-section count-input-image-container">
          <div className="input-left count-input-left">
            <div className="input-container count-input-container">
              <div className="input-group count-input-group">
                <label htmlFor="id">Id:</label>
                <span id="id-value">{IdProd}</span>
              </div>
              <div className="input-group count-input-group">
                <label htmlFor="piezas">Piezas:</label>
                <span id="piezas-value">{Pzas}</span>
              </div>
              <div className="input-group count-input-group">
                <label htmlFor="nombre">Producto:</label>
                <span id="producto-value">{nombreProducto}</span>
              </div>
              <div className="input-group count-input-group">
                <label htmlFor="empaques">Empaques:</label>
                <span id="empaques-value">{Emp}</span>
              </div>
              <div className="input-group count-input-group">
                <label htmlFor="cliente">Cliente:</label>
                <span id="cliente-value">{nombreCliente}</span>
              </div>
              <div className="input-group count-input-group">
                <label htmlFor="no-interno">Variable 1:</label>
                <span id="variable1-value">{Var1}</span>
              </div>
              <div className="input-group count-input-group">
                <label htmlFor="pxp">Peso por pieza:</label>
                <span id="pxp-value">{PxP}</span>
              </div>
              <div className="input-group count-input-group">
                <label htmlFor="no-interno">Variable 2:</label>
                <span id="variable2-value">{Var2}</span>
              </div>
              <div className="input-group count-input-group">
                <label htmlFor="lote">Lote:</label>
                <span id="lote-value">{Lote}</span>
              </div>
              <div className="input-group count-input-group">
                <label htmlFor="no-interno">Variable 3:</label>
                <span id="variable3-value">{Var3}</span>
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

        {/* Sección de peso */}
        <WeightDisplay
          pesoTara={pesoTara}
          pesoBruto={pesoBruto}
          setPesoBruto={handlePesoBrutoChange} // Pasar la función para actualizar el peso bruto
          PxP={PxP} // Pasar PxP como prop
          setPiezasEmpaque={setPiezasEmpaque} // Pasar setPiezasEmpaque como prop
        />

        {/* Mensaje de cálculos */}
        <div
          className="message-box count-message-box"
          style={{ backgroundColor: messageColor }}
        >
          <span id="calculation-message">{calculationMessage}</span>
        </div>

        {/* Botones */}
        <div className="button-section count-button-section">
          <button className="btn-cero count-btn-cero" onClick={handleCleanData}>
            Limpiar datos
          </button>
          <button className="btn-tarar count-btn-tarar" onClick={handleTare}>
            Tarar
          </button>
          <button
            className="btn-registrar count-btn-registrar"
            onClick={handleRegister}
          >
            Registrar
          </button>
          <button className="btn-imprimir count-btn-imprimir">Imprimir</button>
        </div>
      </div>
    </div>
  );
}

export default CountPage;
