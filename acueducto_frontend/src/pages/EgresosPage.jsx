import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";

const EgresosPage = () => {
    const name = localStorage.getItem("userName");
    const [formData, setFormData] = useState({
        nombre_usuario: name,
        descripcionEgreso: "",
        cantidadEgreso: "",
        valorEgreso: "",
        idProducto: ""
    });
    const [egresos, setEgresos] = useState([]);
    const [filteredEgresos, setFilteredEgresos] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

    const notify = (message, type) => {
        toast[type](message);
    };

    const formatCOP = (value) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(value);

    const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    const handleListarTodos = async () => {
        try {
            const response = await fetch("http://localhost:9090/egresos/listar_todos_egresos");
            const data = await response.json();
            if (response.ok) {
                setEgresos(data);
                setFilteredEgresos(data); 
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
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                notify("Egreso creado exitosamente", "success");
                resetForm();
            } else {
                notify("Ingrese la cantidad correcta del producto que está en inventario", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            notify("Ingrese un término de búsqueda", "warning");
            return;
        }
    
        try {
            // Cambia la URL para buscar por descripción o cualquier otro campo
            const response = await fetch(`http://localhost:9090/egresos/buscar_egreso?buscar_egreso=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
    
            if (response.ok && Array.isArray(data) && data.length > 0) {
                setFilteredEgresos(data); // Actualiza la lista filtrada con los resultados
                notify("Egresos encontrados", "success");
            } else {
                notify("No se encontraron egresos", "error");
                setFilteredEgresos([]); // Limpiar la lista si no se encuentra nada
            }
        } catch (error) {
            notify("Error de conexión", "error");
        }
    };
    
    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:9090/egresos/actualizar_egreso`, {
                method: "PUT",
                credentials: 'include',
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

    const handleEdit = (item) => {
        setFormData({
            nombre_usuario: name,
            descripcionEgreso: item.descripcion_egreso,
            cantidadEgreso: item.cantidad,
            valorEgreso: item.total_egreso,
            idProducto: item.id_producto
        });
        setEditMode(true); // Activar el modo de edición
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const filterEgresos = () => {
        const filtered = egresos.filter(egreso => {
            const fecha = new Date(egreso.fecha_egreso);
            return (
                fecha.getFullYear() === selectedYear &&
                fecha.getMonth() === selectedMonth
            );
        });
        setFilteredEgresos(filtered);
    };

    useEffect(() => {
        filterEgresos();
    }, [egresos, selectedYear, selectedMonth]);

    return (
        <div className="egresos-container">
            <ToastContainer />
            <h1 className="egresos-title">Gestión de Egresos</h1>

            <div className="egresos-form">
                <div className="egresos-input-stack">
                    <div className="egresos-input-group">
                        <input
                            type="text"
                            value={formData.descripcionEgreso}
                            onChange={(e) => setFormData({ ...formData, descripcionEgreso: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, cantidadEgreso: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, valorEgreso: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, idProducto: e.target.value })}
                            className="egresos-input"
                            placeholder=" "
                        />
                        <label className="egresos-label">ID Producto</label>
                    </div>
                </div>

                <div className="egresos-buttons">
                    <button
                        onClick={handleSubmit}
                        className="egresos-button egresos-button-primary"
                        disabled={editMode}>
                        Crear Egreso
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="egresos-button"
                        disabled={!editMode}>
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
                    <div className={`pagos-modal ${isClosing ? 'closing' : ''}`} style={{ width: '80%', maxWidth: '800px' }}>
                        <h3 className="pagos-modal-title">Lista de Egresos</h3>

                        <div className="filters-container">
                            <div className="filter-group">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="filter-select"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="filter-select"
                                >
                                    {months.map(month => (
                                        <option key={month} value={month}>
                                            {new Date(2025, month).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar Egreso"
                                    className="filter-input"
                                />
                                <button onClick={handleSearch} className="search-button">Buscar</button>
                            </div>
                        </div>

                        <div className="pagos-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="pagos-table">
                                <thead>
                                    <tr>
                                        <th>ID Egreso</th>
                                        <th>Descripción</th>
                                        <th>Cantidad</th>
                                        <th>Valor</th>
                                        <th>Fecha</th>
                                        <th>ID Producto</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEgresos.map((item) => (
                                        <tr key={item.id_egreso}>
                                            <td>{item.id_egreso}</td>
                                            <td>{item.descripcion_egreso}</td>
                                            <td>{item.cantidad}</td>
                                            <td>{formatCOP(item.total_egreso)}</td>
                                            <td>{new Date(item.fecha_egreso).toLocaleDateString()}</td>
                                            <td>{item.id_producto}</td>
                                            <td>
                                                <button onClick={() => handleEdit(item)} className="edit-button">
                                                    <FaEdit /> Editar
                                                </button>
                                            </td>
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
            <style>{`
                .egresos-container {
                    padding: 20px;
                    width: 70%;
                }

                .egresos-title {
                    font-size: 24px;
                    margin-bottom: 20px;
                }

                .egresos-form {
                    margin-bottom: 20px;
                }

                .egresos-input-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    max-width: 400px;
                    margin: 0 auto 2rem auto;
                }

                .egresos-input-group {
                    width: 100%;
                    margin-bottom: 1rem;
                }

                .egresos-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 0.375rem;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .egresos-input:focus {
                    border-color: #4a90e2;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
                }

                .egresos-label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                }

                .egresos-buttons {
                    margin-top: 20px;
                }

                .egresos-button {
                    padding: 10px 15px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-right: 10px;
                }

                .egresos-button-primary {
                    background-color: #4a90e2;
                    color: white;
                }

                .egresos-button:hover {
                    opacity: 0.8;
                }

                .search-button {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.25rem;
                    background-color: #4a90e2;
                    color: white;
                    cursor: pointer;
                }
    
                .search-button:hover {
                    background-color: #357abd;
                }

                .pagos-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .pagos-modal {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    width: 80%;
                    max-width: 800px; /* Aumentar el tamaño de la ventana modal */
                }

                .pagos-modal-title {
                    font-size: 20px;
                    margin-bottom: 15px;
                }

                .pagos-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .pagos-table th, .pagos-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }

                .pagos-table th {
                    background-color: #f2f2f2;
                }

                .pagos-button {
                    padding: 10px 15px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    background-color: #4a90e2;
                    color: white;
                }

                .pagos-button-close {
                    background-color: #dc3545; /* Rojo para cerrar */
                }

                .pagos-button-close:hover {
                    background-color: #c82333;
                }

                .edit-button {
                    background-color: #ffc107; /* Amarillo para editar */
                    border: none;
                    border-radius: 4px;
                    color: white;
                    cursor: pointer;
                    padding: 5px 10px;
                }

                .edit-button:hover {
                    background-color: #e0a800;
                }

                .filters-container {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-radius: 0.5rem;
                    align-items: center;
                }

                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .filter-group label {
                    font-weight: 500;
                    color: #374151;
                }

                .filter-select {
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                    min-width: 120px;
                }

                .filter-input {
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                    width: 200px; /* Ajusta el ancho según sea necesario */
                }

                .pagos-table-container {
                    max-height: 300px; /* Ajusta la altura máxima según sea necesario */
                    overflow-y: auto; /* Habilita el scroll vertical */
                }
            `}</style>
        </div>
    );
};

export default EgresosPage;