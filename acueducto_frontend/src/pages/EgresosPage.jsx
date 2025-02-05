import React, { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaSearch } from "react-icons/fa";

const EgresosPage = () => {
    const [descripcionEgreso, setDescripcionEgreso] = useState("");
    const [cantidadEgreso, setCantidadEgreso] = useState("");
    const [valorEgreso, setValorEgreso] = useState("");
    const [idProducto, setIdProducto] = useState("");
    const [egresos, setEgresos] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const notify = (message, type) => {
        if (type === "success") {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    const handleListarTodos = async () => {
        try {
            const response = await fetch("http://localhost:9090/egresos/listar_todos_egresos");
            const data = await response.json();
            if (response.ok) {
                setEgresos(data);
                setIsModalOpen(true);
                notify("Egresos cargados exitosamente", "success");
            } else {
                notify("Error al cargar los egresos", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    return (
        <div className="egresos-container">
            <ToastContainer />
            <h1 className="egresos-title">Gestión de Egresos</h1>
            
            <div className="egresos-form">
                <div className="egresos-input-grid">
                    <div className="egresos-input-group">
                        <input
                            type="text"
                            value={descripcionEgreso}
                            onChange={(e) => setDescripcionEgreso(e.target.value)}
                            className="egresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="egresos-label">Descripción del Egreso</label>
                    </div>
                    
                    <div className="egresos-input-group">
                        <input 
                            type="number"
                            value={cantidadEgreso}
                            onChange={(e) => setCantidadEgreso(e.target.value)}
                            className="egresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="egresos-label">Cantidad del Egreso</label>
                    </div>
                    
                    <div className="egresos-input-group">
                        <input 
                            type="number"
                            value={valorEgreso}
                            onChange={(e) => setValorEgreso(e.target.value)}
                            className="egresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="egresos-label">Valor del Egreso</label>
                    </div>
                    
                    <div className="egresos-input-group">
                        <input 
                            type="text"
                            value={idProducto}
                            onChange={(e) => setIdProducto(e.target.value)}
                            className="egresos-input"
                            placeholder=" "
                        />
                        <label className="egresos-label">ID Producto</label>
                    </div>
                </div>

                <div className="egresos-buttons">
                    <button className="egresos-button egresos-button-primary">
                        Crear Egreso
                    </button>
                    <button className="egresos-button">
                        Buscar Egreso
                    </button>
                    <button className="egresos-button">
                        Actualizar Egreso
                    </button>
                    <button className="egresos-button">
                        Limpiar Formulario
                    </button>
                    <button 
                        className="egresos-button"
                        onClick={handleListarTodos}
                    >
                        Listar Todos
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className={`pagos-modal-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`pagos-modal ${isClosing ? 'closing' : ''}`}>
                        <h3 className="pagos-modal-title">Lista de Egresos</h3>
                        <div className="pagos-table-container">
                            <table className="pagos-table">
                                <thead>
                                    <tr>
                                        <th>ID Egreso</th>
                                        <th>Descripción</th>
                                        <th>Cantidad</th>
                                        <th>Valor</th>
                                        <th>Fecha</th>
                                        <th>ID Producto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {egresos.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.id_egreso}</td>
                                            <td>{item.descripcion_egreso}</td>
                                            <td>{item.cantidad_egreso}</td>
                                            <td>{item.valor_egreso}</td>
                                            <td>{new Date(item.fecha).toLocaleDateString()}</td>
                                            <td>{item.id_producto}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            className="pagos-button pagos-button-close"
                            onClick={handleCloseModal}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EgresosPage;