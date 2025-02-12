import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClientesPage = () => {
    const [noClientsFound, setNoClientsFound] = useState(false);
    const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
    const [selectedClientEnrollments, setSelectedClientEnrollments] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [formData, setFormData] = useState({
        id_cliente: "",
        tipo_documento: "C.C",
        numero_documento: "",
        nombre: "",
        telefono: "",
        direccion: "",
    });

    const [clientes, setClientes] = useState([]);

    const estadosCliente = {
        "ESC0001": "Activo",
        "ESC0002": "Inactivo",
        "ESC0003": "Suspendido"
    };

    const notify = (message, type) => {
        if (type === "success") {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowEnrollmentsModal(false);
            setSelectedClientEnrollments([]);
            setSelectedClient(null);
            setIsClosing(false);
        }, 300);
    };

    const updateEnrollmentStatus = async (enrollmentId, newStatus) => {
        try {
            setUpdatingStatus(true);
            const response = await fetch(`http://localhost:9090/matriculas/actualizar_estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_matricula: enrollmentId,
                    estado: newStatus
                })
            });

            if (response.ok) {
                notify("Estado de matrícula actualizado exitosamente", "success");

                // Actualizar el estado local inmediatamente
                setSelectedClientEnrollments(prevEnrollments =>
                    prevEnrollments.map(enrollment =>
                        enrollment.id_matricula === enrollmentId
                            ? { ...enrollment, estado: newStatus }
                            : enrollment
                    )
                );

                // Actualizar la lista completa desde el servidor
                if (selectedClient) {
                    const updatedResponse = await fetch(`http://localhost:9090/multas/buscar_matriculas_por_documento?numero_documento=${selectedClient.numero_documento}`);
                    if (updatedResponse.ok) {
                        const updatedData = await updatedResponse.json();
                        setSelectedClientEnrollments(updatedData);
                    }
                }
            } else {
                const errorData = await response.json();
                notify(errorData.message || "Error al actualizar el estado de la matrícula", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getClientEnrollments = async (clientId) => {
        try {
            const client = clientes.find(c => c.id_cliente === clientId);
            if (!client) {
                notify("Cliente no encontrado", "error");
                return;
            }

            const response = await fetch(`http://localhost:9090/multas/buscar_matriculas_por_documento?numero_documento=${client.numero_documento}`);
            const data = await response.json();

            if (response.ok) {
                setSelectedClientEnrollments(data);
                setSelectedClient(client);
                setShowEnrollmentsModal(true);
            } else {
                notify("Error al cargar las matrículas", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const searchClientes = async () => {
        if (!formData.nombre.trim()) {
            notify("Por favor, ingrese un nombre para buscar", "error");
            return;
        }
        try {
            const response = await fetch(`http://localhost:9090/clientes/buscar_clientes_por_palabra?palabra_clave=${encodeURIComponent(formData.nombre)}`);
            const data = await response.json();
            if (response.ok) {
                setClientes(data);
                setNoClientsFound(data.length === 0);
                if (data.length === 0) {
                    notify("No se encontraron clientes con ese nombre", "error");
                } else {
                    notify(`Se encontraron ${data.length} cliente(s)`, "success");
                }
            } else {
                notify("Error al buscar clientes", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.nombre && !formData.numero_documento && !formData.telefono && !formData.direccion) {
            await searchClientes();
            return;
        }
        try {
            const response = await fetch("http://localhost:9090/clientes/agregar_cliente", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                notify("Cliente agregado exitosamente", "success");
                resetForm();
                fetchAllClientes();
            } else {
                notify(data.message || "Error, el usuario ya existe", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleNameKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            await searchClientes();
        }
    };

    const resetForm = () => {
        setFormData({
            id_cliente: "",
            tipo_documento: "C.C",
            numero_documento: "",
            nombre: "",
            telefono: "",
            direccion: "",
        });
    };

    const handleEdit = async () => {
        if (!formData.id_cliente) {
            notify("Por favor, seleccione un cliente para editar", "error");
            return;
        }

        const requiredFields = ['tipo_documento', 'numero_documento', 'nombre', 'telefono', 'direccion'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            notify(`Campos requeridos faltantes: ${missingFields.join(', ')}`, "error");
            return;
        }

        try {
            const response = await fetch('http://localhost:9090/clientes/actualizar_cliente', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                notify("Cliente actualizado exitosamente", "success");
                resetForm();
                await fetchAllClientes();
            } else {
                notify(data.message || "Error al actualizar el cliente", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
        }
    };

    const fetchAllClientes = async () => {
        try {
            const response = await fetch("http://localhost:9090/clientes/buscar_todos_clientes");
            const data = await response.json();
            if (response.ok) {
                setClientes(data);
                setNoClientsFound(data.length === 0);
            } else {
                notify("Error al obtener los clientes", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleRowClick = (cliente) => {
        setFormData(cliente);
    };

    useEffect(() => {
        fetchAllClientes();
    }, []);

    return (
        <div className="ClientesPageCustom">
            <ToastContainer />
            <h1 className="pagesTitleCustom">Gestión de Clientes</h1>

            <form className="FormContainerCustom" onSubmit={handleSubmit}>
                <div className="inputsRowCustom">
                    <div className="groupCustom">
                        <select
                            name="tipo_documento"
                            value={formData.tipo_documento}
                            onChange={handleChange}
                            className="inputCustom"
                        >
                            <option value="C.C">C.C</option>
                            <option value="Nit">Nit</option>
                        </select>
                        <label>Tipo de Documento</label>
                    </div>

                    <div className="groupCustom">
                        <input
                            type="text"
                            name="numero_documento"
                            value={formData.numero_documento}
                            onChange={handleChange}
                            className="inputCustom"
                            required
                        />
                        <span className="highlightCustom"></span>
                        <span className="barCustom"></span>
                        <label>Número de Documento</label>
                    </div>

                    <div className="groupCustom">
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            onKeyDown={handleNameKeyDown}
                            className="inputCustom"
                            required
                        />
                        <span className="highlightCustom"></span>
                        <span className="barCustom"></span>
                        <label>Nombre</label>
                    </div>

                    <div className="groupCustom">
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="inputCustom"
                            required
                        />
                        <span className="highlightCustom"></span>
                        <span className="barCustom"></span>
                        <label>Teléfono</label>
                    </div>
                </div>

                <div className="buttonsCustom">
                    <button type="submit" className="crudBtnCustom">
                        Crear Cliente
                    </button>
                    <button type="button" className="crudBtnCustom" onClick={searchClientes}>
                        Buscar por Nombre
                    </button>
                    <button type="button" className="crudBtnCustom" onClick={handleEdit}>
                        Actualizar
                    </button>
                    <button type="button" className="crudBtnCustom" onClick={fetchAllClientes}>
                        Listar Todos
                    </button>
                    <button type="button" className="crudBtnCustom" onClick={resetForm}>
                        Limpiar Formulario
                    </button>
                </div>
            </form>

            <div className="ClientListCustom">
                <h2 className="ListClientTitleCustom">Lista de Clientes</h2>
                <div className="clientTableCustom">
                    <div className="clientTableHeaderCustom">
                        <div>ID Cliente</div>
                        <div>Tipo Documento</div>
                        <div>Número Documento</div>
                        <div>Nombre</div>
                        <div>Teléfono</div>
                        <div>Acciones</div>
                    </div>
                    <div className="clientTableBodyCustom">
                        {clientes.map((cliente) => (
                            <div
                                key={cliente.id_cliente}
                                className="clientTableRowCustom"
                                onClick={() => handleRowClick(cliente)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div>{cliente.id_cliente}</div>
                                <div>{cliente.tipo_documento}</div>
                                <div>{cliente.numero_documento}</div>
                                <div>{cliente.nombre}</div>
                                <div>{cliente.telefono}</div>
                                <div>
                                    <button
                                        className="crudBtnCustom"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedClient(cliente);
                                            getClientEnrollments(cliente.id_cliente);
                                        }}
                                    >
                                        Ver Matrículas
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showEnrollmentsModal && (
                <div className={`pagos-modal-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`pagos-modal ${isClosing ? 'closing' : ''}`}>
                        <h3 className="pagos-modal-title">Matrículas de {selectedClient?.nombre}</h3>
                        <div className="pagos-table-container">
                            <table className="pagos-table">
                                <thead>
                                    <tr>
                                        <th>ID Matrícula</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedClientEnrollments.map((enrollment) => (
                                        <tr key={enrollment.id_matricula}>
                                            <td>{enrollment.id_matricula}</td>
                                            <td>{new Date(enrollment.fecha_creacion).toLocaleDateString()}</td>
                                            <td>
                                                <select
                                                    value={enrollment.estado}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        setSelectedClientEnrollments(prevEnrollments =>
                                                            prevEnrollments.map(prev =>
                                                                prev.id_matricula === enrollment.id_matricula
                                                                    ? { ...prev, estado: newStatus }
                                                                    : prev
                                                            )
                                                        );
                                                    }}
                                                    className="statusSelectCustom"
                                                    disabled={updatingStatus}
                                                >
                                                    {Object.entries(estadosCliente).map(([value, label]) => (
                                                        <option key={value} value={value}>
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    className="pagos-button pagos-button-save"
                                                    onClick={() => updateEnrollmentStatus(
                                                        enrollment.id_matricula,
                                                        enrollment.estado
                                                    )}
                                                    disabled={updatingStatus}
                                                >
                                                    {updatingStatus ? 'Actualizando...' : 'Actualizar'}
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
                            disabled={updatingStatus}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .pagos-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    opacity: 1;
                    transition: opacity 0.3s ease-in-out;
                }

                .pagos-modal-overlay.closing {
                    opacity: 0;
                }

                .pagos-modal {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 1000px;
                    max-height: 90vh;
                    overflow-y: auto;
                    transform: scale(1);
                    transition: transform 0.3s ease-in-out;
                }

                .pagos-modal.closing {
                    transform: scale(0.9);
                }

                .pagos-modal-title {
                    text-align: center;
                    margin-bottom: 1.5rem;
                    color: #333;
                    font-size: 1.5rem;
                }

                .pagos-table-container {
                    overflow-x: auto;
                }

                .pagos-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                }

                .pagos-table th,
                .pagos-table td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }

                .pagos-table th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                }

                .pagos-button {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }

                .pagos-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .pagos-button-save {
                    background-color: #28a745;
                    color: white;
                    margin-right: 0.5rem;
                }

                .pagos-button-save:hover:not(:disabled) {
                    background-color: #218838;
                }

                .pagos-button-close {
                    background-color: #6c757d;
                    color: white;
                    margin-top: 1rem;
                }

                .pagos-button-close:hover:not(:disabled) {
                    background-color: #5a6268;
                }

                .statusSelectCustom {
                    padding: 0.375rem 0.75rem;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    background-color: white;
                    width: 100%;
                    max-width: 200px;
                }

                .statusSelectCustom:disabled {
                    background-color: #e9ecef;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default ClientesPage;