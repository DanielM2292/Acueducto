import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

const VerHistorialPage = () => {
  const [auditoria, setAuditoria] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAuditoria, setFilteredAuditoria] = useState([]);

  useEffect(() => {
    fetchAuditoria();
  }, []);

  useEffect(() => {
    filterAuditoria();
  }, [auditoria, selectedMonth, searchTerm]);

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

  const filterAuditoria = () => {
    let filtered = [...auditoria];

    // Filtrar por mes si hay uno seleccionado
    if (selectedMonth) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.fecha);
        return itemDate.getMonth() === parseInt(selectedMonth) - 1;
      });
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredAuditoria(filtered);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setSelectedMonth("");
      setSearchTerm("");
    }
  };

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" }
  ];

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
            
            <div className="filterContainer">
              <div className="searchContainer">
                <Search className="searchIcon" size={20} />
                <input
                  type="text"
                  placeholder="Buscar en el historial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="searchInput"
                />
              </div>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="monthSelect"
              >
                <option value="">Todos los meses</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

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
                  {filteredAuditoria.map((item) => (
                    <tr key={item.id_auditoria}>
                      <td>{item.id_auditoria}</td>
                      <td>{item.tabla}</td>
                      <td>{item.id_registro_afectado}</td>
                      <td>{item.accion}</td>
                      <td>{item.nombre_usuario}</td>
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

        .filterContainer {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          align-items: center;
        }

        .searchContainer {
          flex: 1;
          position: relative;
          max-width: 500px;
        }

        .searchIcon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .searchInput {
          width: 100%;
          padding: 10px 10px 10px 40px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .searchInput:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        .monthSelect {
          padding: 10px 35px 10px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          background-color: white;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 16px;
          min-width: 180px;
        }

        .monthSelect:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
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

        @media (max-width: 768px) {
          .filterContainer {
            flex-direction: column;
            gap: 10px;
          }

          .searchContainer {
            max-width: 100%;
          }

          .monthSelect {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default VerHistorialPage;