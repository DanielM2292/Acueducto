import React, { useState, useEffect } from "react";

const VerHistorialPage = () => {
  const [auditoria, setAuditoria] = useState([]);

  useEffect(() => {
    fetchAuditoria();
  }, []);

  const fetchAuditoria = async () => {
    try {
      const response = await fetch("http://localhost:9090/auditoria");
      const data = await response.json();
      if (response.ok) {
        setAuditoria(data);
      } else {
        console.error("Error al obtener auditoria:", data.message);
      }
    } catch (error) {
      console.error("Error de conexión con el servidor:", error);
    }
  };

  return (
    <div className="historialListCustom">
      <h2 className="ListHistorialTitleCustom">Historial de Auditoría</h2>
      <div className="historialTableCustom">
        <div className="historialTableHeaderCustom">
          <div>ID Auditoría</div>
          <div>Tabla</div>
          <div>ID Registro Afectado</div>
          <div>Acción</div>
          <div>ID Administrador</div>
          <div>Fecha</div>
          <div>Detalles</div>
        </div>
        <div className="historialTableBodyCustom">
          {auditoria.map((item) => (
            <div key={item.id_auditoria} className="historialTableRowCustom">
              <div>{item.id_auditoria}</div>
              <div>{item.tabla}</div>
              <div>{item.id_registro_afectado}</div>
              <div>{item.accion}</div>
              <div>{item.id_administrador}</div>
              <div>{new Date(item.fecha).toLocaleString()}</div>
              <div>{item.detalles}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .historialListCustom {
          padding: 20px;
        }

        .ListHistorialTitleCustom {
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
        }

        .historialTableCustom {
          overflow-x: auto;
        }

        .historialTableHeaderCustom {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background-color: #3498db;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: bold;
        }

        .historialTableBodyCustom {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
        }

        .historialTableRowCustom {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }

        .historialTableRowCustom:nth-child(even) {
          background-color: #f9f9f9;
        }

        .historialTableRowCustom div {
          padding: 5px 10px;
          text-align: left;
        }

        .historialTableRowCustom:hover {
          background-color: #e0e0e0;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default VerHistorialPage;
