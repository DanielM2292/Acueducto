import React, { useState, useEffect } from "react";

const VerHistorialPage = () => {
  const [auditoria, setAuditoria] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAuditoria();
  }, []);

  const fetchAuditoria = async () => {
    try {
      const response = await fetch("http://localhost:9090/auditoria/mostar_registros");
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

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="historialListCustom">
      <h2 className="ListHistorialTitleCustom">Historial de Auditoría</h2>
      <button onClick={toggleModal} className="verHistorialButton">
        Ver Historial
      </button>

      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2 className="modalTitle">Historial de Auditoría</h2>
            <div className="historialTableContainer">
              <table className="historialTableCustom">
                <thead>
                  <tr>
                    <th>ID Auditoría</th>
                    <th>Tabla</th>
                    <th>ID Registro Afectado</th>
                    <th>Acción</th>
                    <th>ID Administrador</th>
                    <th>Fecha</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.map((item) => (
                    <tr key={item.id_auditoria}>
                      <td>{item.id_auditoria}</td>
                      <td>{item.tabla}</td>
                      <td>{item.id_registro_afectado}</td>
                      <td>{item.accion}</td>
                      <td>{item.id_administrador}</td>
                      <td>{new Date(item.fecha).toLocaleString()}</td>
                      <td>{item.detalles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={toggleModal} className="closeModalButton">Cerrar</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .historialListCustom {
          padding: 20px;
        }

        .ListHistorialTitleCustom {
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
        }

        .verHistorialButton {
          display: block;
          margin: 0 auto;
          padding: 10px 20px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }

        .verHistorialButton:hover {
          background-color: #2980b9;
        }

        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modalContent {
          background: white;
          padding: 25px;
          border-radius: 12px;
          width: 95%;
          max-width: 1200px;
          height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .modalTitle {
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          color: #2c3e50;
        }

        .historialTableContainer {
          flex: 1;
          overflow-y: auto;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          margin-bottom: 20px;
          position: relative;
        }

        /* Estilo del scrollbar minimalista */
        .historialTableContainer::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .historialTableContainer::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .historialTableContainer::-webkit-scrollbar-thumb {
          background: #bbb;
          border-radius: 4px;
        }

        .historialTableContainer::-webkit-scrollbar-thumb:hover {
          background: #999;
        }

        .historialTableCustom {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .historialTableCustom thead {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #3498db;
          color: white;
        }

        .historialTableCustom th, 
        .historialTableCustom td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .historialTableCustom th {
          font-weight: 600;
        }

        /* Distribución de anchos de columnas */
        .historialTableCustom th:nth-child(1),
        .historialTableCustom td:nth-child(1) {
          width: 10%;
        }

        .historialTableCustom th:nth-child(2),
        .historialTableCustom td:nth-child(2) {
          width: 10%;
        }

        .historialTableCustom th:nth-child(3),
        .historialTableCustom td:nth-child(3) {
          width: 12%;
        }

        .historialTableCustom th:nth-child(4),
        .historialTableCustom td:nth-child(4) {
          width: 10%;
        }

        .historialTableCustom th:nth-child(5),
        .historialTableCustom td:nth-child(5) {
          width: 12%;
        }

        .historialTableCustom th:nth-child(6),
        .historialTableCustom td:nth-child(6) {
          width: 16%;
        }

        .historialTableCustom th:nth-child(7),
        .historialTableCustom td:nth-child(7) {
          width: 30%;
          white-space: normal;
          word-wrap: break-word;
        }

        .historialTableCustom tbody tr {
          transition: background-color 0.2s;
        }

        .historialTableCustom tbody tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        .historialTableCustom tbody tr:hover {
          background-color: #e8f4fc;
          cursor: pointer;
        }

        .closeModalButton {
          align-self: center;
          padding: 10px 25px;
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }

        .closeModalButton:hover {
          background-color: #c0392b;
        }
      `}</style>
    </div>
  );
};

export default VerHistorialPage;