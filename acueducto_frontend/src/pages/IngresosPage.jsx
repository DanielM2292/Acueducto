import React, { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const IngresosPage = () => {
    const [descripcionIngreso, setDescripcionIngreso] = useState("");
    const [valorIngreso, setValorIngreso] = useState("");
    const [ingresos, setIngresos] = useState([]);
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
            const response = await fetch("http://localhost:9090/ingresos/listar_todos_ingresos");
            const data = await response.json();
            if (response.ok) {
                setIngresos(data);
                setIsModalOpen(true);
                notify("Ingresos cargados exitosamente", "success");
            } else {
                notify("Error al cargar los ingresos", "error");
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
        <div className="ingresos-container">
            <ToastContainer />
            <h1 className="ingresos-title">Gestión de Ingresos</h1>
            
            <div className="ingresos-form">
                <div className="ingresos-input-grid">
                    <div className="ingresos-input-group">
                        <input
                            type="text"
                            value={descripcionIngreso}
                            onChange={(e) => setDescripcionIngreso(e.target.value)}
                            className="ingresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="ingresos-label">Descripción del Ingreso</label>
                    </div>
                    
                    <div className="ingresos-input-group">
                        <input 
                            type="number"
                            value={valorIngreso}
                            onChange={(e) => setValorIngreso(e.target.value)}
                            className="ingresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="ingresos-label">Valor del Ingreso</label>
                    </div>
                </div>

                <div className="ingresos-buttons">
                    <button className="ingresos-button ingresos-button-primary">
                        Crear Ingreso
                    </button>
                    <button className="ingresos-button">
                        Buscar Ingreso
                    </button>
                    <button className="ingresos-button">
                        Actualizar Ingreso
                    </button>
                    <button className="ingresos-button">
                        Limpiar Formulario
                    </button>
                    <button 
                        className="ingresos-button"
                        onClick={handleListarTodos}
                    >
                        Listar Todos
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className={`pagos-modal-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`pagos-modal ${isClosing ? 'closing' : ''}`}>
                        <h3 className="pagos-modal-title">Lista de Ingresos</h3>
                        <div className="pagos-table-container">
                            <table className="pagos-table">
                                <thead>
                                    <tr>
                                        <th>ID Ingreso</th>
                                        <th>Descripción</th>
                                        <th>Valor</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ingresos.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.id_ingreso}</td>
                                            <td>{item.descripcion_ingreso}</td>
                                            <td>{item.valor_ingreso}</td>
                                            <td>{new Date(item.fecha).toLocaleDateString()}</td>
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

export default IngresosPage;