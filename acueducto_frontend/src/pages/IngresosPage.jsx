import React, { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const IngresosPage = () => {
    const [formData, setFormData] = useState({
        descripcionIngreso: "",
        valorIngreso: ""
    });
    const [ingresos, setIngresos] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const notify = (message, type) => {
        toast[type](message);
    };

    const formatCOP = (value) => 
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(value);

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
            notify("Error de conexión", "error");
        }
    };

    const resetForm = () => {
        setFormData({
            descripcionIngreso: "",
            valorIngreso: ""
        });
        setEditMode(false);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:9090/ingresos/crear_ingreso", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                notify("Ingreso creado exitosamente", "success");
                resetForm();
            } else {
                notify("Error al crear el ingreso", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
        }
    };

    const handleSearch = async () => {
        if (!formData.descripcionIngreso.trim()) {
            notify("Ingrese una descripción para buscar", "warning");
            return;
        }

        try {
            // Enviar la búsqueda como datos JSON en el body
            const response = await fetch("http://localhost:9090/ingresos/buscar_ingreso", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    buscar_ingreso: formData.descripcionIngreso
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                if (Array.isArray(data) && data.length > 0) {
                    setIngresos(data);
                    setIsModalOpen(true);
                    notify("Ingresos encontrados", "success");
                } else {
                    notify("No se encontraron ingresos con esa descripción", "info");
                }
            } else {
                notify(data.message || "Error al buscar ingresos", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch("http://localhost:9090/ingresos/actualizar_ingreso", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                notify("Ingreso actualizado exitosamente", "success");
                resetForm();
            } else {
                notify("Error al actualizar el ingreso", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
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
                            value={formData.descripcionIngreso}
                            onChange={(e) => setFormData({...formData, descripcionIngreso: e.target.value})}
                            className="ingresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="ingresos-label">Descripción del Ingreso</label>
                    </div>
                    
                    <div className="ingresos-input-group">
                        <input 
                            type="number"
                            value={formData.valorIngreso}
                            onChange={(e) => setFormData({...formData, valorIngreso: e.target.value})}
                            className="ingresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="ingresos-label">Valor del Ingreso</label>
                    </div>
                </div>

                <div className="ingresos-buttons">
                    <button 
                        onClick={handleSubmit}
                        className="ingresos-button ingresos-button-primary">
                        Crear Ingreso
                    </button>
                    <button 
                        onClick={handleSearch}
                        className="ingresos-button">
                        Buscar Ingreso
                    </button>
                    <button 
                        onClick={handleUpdate}
                        className="ingresos-button">
                        Actualizar Ingreso
                    </button>
                    <button 
                        onClick={resetForm}
                        className="ingresos-button">
                        Limpiar Formulario
                    </button>
                    <button 
                        onClick={handleListarTodos}
                        className="ingresos-button">
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
                                    {ingresos.map((item) => (
                                        <tr key={item.id_ingreso}>
                                            <td>{item.id_ingreso}</td>
                                            <td>{item.descripcion_ingreso}</td>
                                            <td>{formatCOP(item.valor_ingreso)}</td>
                                            <td>{new Date(item.fecha_ingreso).toLocaleDateString()}</td>
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