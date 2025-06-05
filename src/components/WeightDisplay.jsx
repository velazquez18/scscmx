import React, { useState, useEffect } from "react";
import socket from "../services/socket";

function WeightDisplay({
  pesoTara,
  pesoBruto,
  setPesoBruto,
  PxP,
  setPiezasEmpaque,
  idPesa,
  weight,
  setWeightData
}) {
  const [pesoNeto, setPesoNeto] = useState("00.0000");

  const validateWeight = (w) => {
    return !isNaN(w) && w >= 0 && w <= 1000; // Validar que sea un número y esté en el rango esperado
  };

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit('joinPesa', idPesa)
    });

    socket.on("weightData", (data) => {
      if (validateWeight(data.Brut)) {
        const newPesoBruto = parseFloat(data.Brut).toFixed(3); // Convertir a número y formatear
        const newPesoNeto = parseFloat(data.pesoNeto).toFixed(3); // Convertir a número y formatear

        setPesoBruto(newPesoBruto); // Actualizar pesoBruto en CountPage
        setPesoNeto(newPesoNeto); // Actualizar pesoNeto localmente
        setWeightData(newPesoNeto);

        // Calcular piezas de empaque si PxP está definido
        if (PxP > 0) {
          const piezas = Math.floor(parseFloat(newPesoNeto) / parseFloat(PxP));
          setPiezasEmpaque(piezas); // Actualizar piezasEmpaque en CountPage
        }
      } else {
        console.warn("Dato de peso inválido recibido:", data.Brut);
      }
    });

    socket.on("disconnect", () => {
    });

    return () => {
      socket.disconnect();
    };
  }, [setPesoBruto, PxP, setPiezasEmpaque, idPesa, setWeightData]); // Dependencias del useEffect

  return (
    <div className="form-section count-peso-section">
      <div className="peso-container count-peso-container">
        <div className="input-group count-input-group">
          <label htmlFor="peso-bruto">Peso Bruto:</label>
          <span className="peso-bruto" id="peso-bruto-value">
            {pesoBruto}
          </span>
        </div>
        <div className="input-group count-input-group">
          <label htmlFor="peso-tara">Peso Tara:</label>
          <span className="peso-tara" id="peso-tara-value">
            {pesoTara}
          </span>
        </div>
        <div className="input-group count-input-group">
          <label htmlFor="peso-neto">Peso Neto:</label>
          <span className="peso-neto" id="peso-neto-value">
            {pesoNeto}
          </span>
        </div>
        <div className="input-group count-input-group">
          <label htmlFor="piezas-empaque">Piezas del empaque:</label>
          <span className="piezas-empaque" id="piezas-empaque-value">
            {Math.floor(parseFloat(pesoNeto) / parseFloat(PxP)) || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default WeightDisplay;
