import React, { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaSearch } from "react-icons/fa";

const EgresosPage = () => {
    const [formData, setFormData] = useState({
        descripcionEgreso: "",
        cantidadEgreso: "",
        valorEgreso: "",
        idProducto: ""
    });
    const [egresos, setEgresos] = useState([]);
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
            notify("Error de conexión", "error");
        }
    };

    const resetForm = () => {
        setFormData({
            descripcionEgreso: "",
            cantidadEgreso: "",
            valorEgreso: "",
            idProducto: ""
        });
        setEditMode(false);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:9090/egresos/crear_egreso", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                notify("Egreso creado exitosamente", "success");
                resetForm();
            } else {
                notify("Ingrese la cantidad correcta del producto que esta en inventario", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
        }
    };

    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:9090/egresos/buscar_egreso/${formData.idProducto}`);
            const data = await response.json();
            
            if (response.ok && data) {
                setFormData({
                    descripcionEgreso: data.descripcion_egreso,
                    cantidadEgreso: data.cantidad_egreso,
                    valorEgreso: data.valor_egreso,
                    idProducto: data.id_producto
                });
                notify("Egreso encontrado", "success");
            } else {
                notify("Egreso no encontrado", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:9090/egresos/actualizar_egreso/${formData.idProducto}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                notify("Egreso actualizado exitosamente", "success");
                resetForm();
            } else {
                notify("Error al actualizar el egreso", "error");
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
        <div className="egresos-container">
            <ToastContainer />
            <h1 className="egresos-title">Gestión de Egresos</h1>
            
            <div className="egresos-form">
                <div className="egresos-input-grid">
                    <div className="egresos-input-group">
                        <input
                            type="text"
                            value={formData.descripcionEgreso}
                            onChange={(e) => setFormData({...formData, descripcionEgreso: e.target.value})}
                            className="egresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="egresos-label">Descripción del Egreso</label>
                    </div>
                    
                    <div className="egresos-input-group">
                        <input 
                            type="number"
                            value={formData.cantidadEgreso}
                            onChange={(e) => setFormData({...formData, cantidadEgreso: e.target.value})}
                            className="egresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="egresos-label">Cantidad del Egreso</label>
                    </div>
                    
                    <div className="egresos-input-group">
                        <input 
                            type="number"
                            value={formData.valorEgreso}
                            onChange={(e) => setFormData({...formData, valorEgreso: e.target.value})}
                            className="egresos-input"
                            placeholder=" "
                            required
                        />
                        <label className="egresos-label">Valor del Egreso</label>
                    </div>
                    
                    <div className="egresos-input-group">
                        <input 
                            type="text"
                            value={formData.idProducto}
                            onChange={(e) => setFormData({...formData, idProducto: e.target.value})}
                            className="egresos-input"
                            placeholder=" "
                        />
                        <label className="egresos-label">ID Producto</label>
                    </div>
                </div>

                <div className="egresos-buttons">
                    <button 
                        onClick={handleSubmit}
                        className="egresos-button egresos-button-primary">
                        Crear Egreso
                    </button>
                    <button 
                        onClick={handleSearch}
                        className="egresos-button">
                        Buscar Egreso
                    </button>
                    <button 
                        onClick={handleUpdate}
                        className="egresos-button">
                        Actualizar Egreso
                    </button>
                    <button 
                        onClick={resetForm}
                        className="egresos-button">
                        Limpiar Formulario
                    </button>
                    <button 
                        onClick={handleListarTodos}
                        className="egresos-button">
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
                                    {egresos.map((item) => (
                                        <tr key={item.id_egreso}>
                                            <td>{item.id_egreso}</td>
                                            <td>{item.descripcion_egreso}</td>
                                            <td>{item.cantidad}</td>
                                            <td>{formatCOP(item.total_egreso)}</td>
                                            <td>{new Date(item.fecha_egreso).toLocaleDateString()}</td>
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