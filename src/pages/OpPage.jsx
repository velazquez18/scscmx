import React, { useState, useEffect } from "react";
import "../styles/op.css";

// Usar la variable de entorno para la URL del backend
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const OpPage = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/getOrdenProduccion`
        );
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        const data = await response.json();
        console.log("Datos obtenidos:", data); // Verifica la estructura de los datos
        setTableData(Array.isArray(data) ? data : []); // Asegúrate de que sea un array
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatFecha = (fecha) => {
    if (!fecha) return ""; // Si no hay fecha, devolver un valor vacío
    return fecha.slice(0, -5); // Eliminar los últimos 5 caracteres (.000Z)
  };

  return (
    <div className="op-main-container">
      <h1>Orden de Produccion</h1>
      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>#OP</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Empaques</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(tableData) && tableData.length > 0 ? (
              tableData.map((row) => (
                <tr key={row.OP}>
                  <td>{row.OP}</td>
                  <td>{row.Cliente}</td>
                  <td>{row.Producto}</td>
                  <td>{row.Emp}</td>
                  <td>{formatFecha(row.Fecha)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay datos disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OpPage;