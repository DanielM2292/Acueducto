import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit } from "react-icons/fa";

const MatriculasPage = () => {
    const [idMatricula, setIdMatricula] = useState("");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [valorMatricula, setValorMatricula] = useState("");
    const [tipoTarifa, setTipoTarifa] = useState("");
    const [direccion, setDireccion] = useState("");
    const [matriculas, setMatriculas] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedMatricula, setSelectedMatricula] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP"
        }).format(value);
    };

    const notify = (message, type) => {
        if (type === "success") {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    const handleAddMatricula = async () => {
        if (!numeroDocumento || !valorMatricula || !direccion) {
            notify("Por favor complete todos los campos requeridos", "error");
            return;
        }
        try {
            const response = await fetch("http://localhost:9090/matriculas/crear_matricula", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    numero_documento: numeroDocumento, 
                    valor_matricula: valorMatricula,
                    tipo_tarifa: tipoTarifa,
                    direccion: direccion
                }),
            });
            const data = await response.json();
            if (response.ok) {
                notify("Matrícula agregada exitosamente", "success");
                fetchMatriculas();
                resetForm();
            } else {
                notify(data.message || "Error al agregar la matrícula", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleUpdateMatricula = async () => {
        if (!selectedMatricula || !numeroDocumento || !valorMatricula || !direccion) {
            notify("Por favor complete todos los campos requeridos", "error");
            return;
        }
        try {
            const response = await fetch("http://localhost:9090/matriculas/actualizar_matricula", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    id_matricula: selectedMatricula.id_matricula,
                    numero_documento: numeroDocumento,
                    valor_matricula: valorMatricula,
                    tipo_tarifa: tipoTarifa,
                    direccion: direccion
                }),
            });
            const data = await response.json();
            if (response.ok) {
                notify("Matrícula actualizada exitosamente", "success");
                fetchMatriculas();
                resetForm();
                setEditMode(false);
            } else {
                notify(data.message || "Error al actualizar la matrícula", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleSearchMatriculaPorDocumento = async () => {
        if (!numeroDocumento) {
            notify("Por favor ingrese un número de documento", "error");
            return;
        }
        try {
            const response = await fetch(`http://localhost:9090/matriculas/buscar_matriculas_por_documento?numero_documento=${numeroDocumento}`);
            const data = await response.json();
            if (response.ok) {
                setMatriculas(data);
                setIsModalOpen(true);
                notify("Matrícula(s) encontrada(s)", "success");
            } else {
                notify(data.message || "Error al buscar la matrícula", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleMostrarTodasMatriculas = async () => {
        try {
            const response = await fetch("http://localhost:9090/matriculas/listar_todas_matriculas");
            const data = await response.json();
            if (response.ok) {
                setMatriculas(data);
                setIsModalOpen(true);
            } else {
                notify("Error al obtener todas las matrículas", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const fetchMatriculas = async () => {
        try {
            const response = await fetch("http://localhost:9090/matriculas/listar_todas_matriculas");
            const data = await response.json();
            if (response.ok) {
                setMatriculas(data);
            } else {
                notify("Error al obtener las matrículas", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleEdit = (matricula) => {
        setSelectedMatricula(matricula);
        setNumeroDocumento(matricula.numero_documento);
        setValorMatricula(matricula.valor_matricula);
        setTipoTarifa(matricula.tipo_tarifa);
        setDireccion(matricula.direccion);
        setEditMode(true);
        setIsModalOpen(false);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const resetForm = () => {
        setNumeroDocumento("");
        setValorMatricula("");
        setTipoTarifa("estandar");
        setDireccion("");
        setSelectedMatricula(null);
        setEditMode(false);
    };

    useEffect(() => {
        fetchMatriculas();
    }, []);

    return (
        <div className="MatriculasPageCustom">
            <ToastContainer />
            <h1 className="pagesTitleCustom">Gestión de Matrículas</h1>
            <div className="formMatriculasCustom">
                <div className="groupCustom">
                    <input
                        type="text"
                        name="numero_documento"
                        value={numeroDocumento}
                        onChange={(e) => setNumeroDocumento(e.target.value)}
                        className="inputCustom"
                        required
                    />
                    <label>Número de Documento</label>
                </div>
                <div className="groupCustom">
                    <input
                        type="number"
                        name="valor_matricula"
                        value={valorMatricula}
                        onChange={(e) => setValorMatricula(e.target.value)}
                        className="inputCustom"
                        required
                        style={{ MozAppearance: "textfield" }}
                    />
                    <label>Valor Matrícula</label>
                </div>
            
                <div className="groupCustom">
                    <select
                        name="tipo_tarifa"
                        value={tipoTarifa}
                        onChange={(e) => setTipoTarifa(e.target.value)}
                        className="inputCustom"
                        required
                    >
                        <option>Selecciona un tipo de tarifa</option>
                        <option value="Estandar">Estándar</option>
                        <option value="Medidor">Medidor</option>
                    </select>
                    <label>Tipo de Tarifa</label>
                </div>

                <div className="groupCustom">
                    <select
                        name="direccion"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="inputCustom"
                        required
                    >
                        <option value="">Selecciona un Barrio</option>
                        <option value="Barrio los Estudiantes">Barrio los Estudiantes</option>
                        <option value="Barrio El Centro">Barrio El Centro</option>
                        <option value="Barrio la Cruz">Barrio la Cruz</option>
                        <option value="Barrio Belén">Barrio Belén</option>
                        <option value="Vereda la Florida">Vereda la Florida</option>
                        <option value="Barrio Señor de las Misericordias">Barrio Señor de las Misericordias</option>
                        <option value="Barrio Real Valencia">Barrio Real Valencia</option>
                        <option value="Barrio Sagrado corazón de Jesús">Barrio Sagrado corazón de Jesús</option>
                        <option value="Barrio San Francisco">Barrio San Francisco</option>
                        <option value="Barrio San Fernando">Barrio San Fernando</option>
                        <option value="Vereda la Palma">Vereda la Palma</option>
                        <option value="Barrio San José">Barrio San José</option>
                        <option value="Barrio Miraflores">Barrio Miraflores</option>
                        <option value="Barrio la Asosiación">Barrio la Asosiación</option>
                    </select>
                </div>

                <div className="buttonsCustom">
                    {!editMode ? (
                        <button className="crudBtnCustom" onClick={handleAddMatricula}>
                            Crear Matrícula
                        </button>
                    ) : (
                        <button className="crudBtnCustom" onClick={handleUpdateMatricula}>
                            Actualizar Matrícula
                        </button>
                    )}
                    <button className="crudBtnCustom" onClick={handleSearchMatriculaPorDocumento}>
                        Buscar Matrícula
                    </button>
                    <button className="crudBtnCustom" onClick={resetForm}>
                        Limpiar Formulario
                    </button>
                    <button className="crudBtnCustom" onClick={handleMostrarTodasMatriculas}>
                        Mostrar Todo
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className={`pagos-modal-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`pagos-modal pagos-modal-large ${isClosing ? 'closing' : ''}`}>
                        <h3 className="pagos-modal-title">Lista de Matrículas</h3>
                        <div className="pagos-table-container pagos-table-container-large">
                            <table className="pagos-table">
                                <thead>
                                    <tr>
                                        <th>ID Matrícula</th>
                                        <th>Número Matrícula</th>
                                        <th>Número de Documento</th>
                                        <th>Nombre Cliente</th>
                                        <th>Valor Matrícula</th>
                                        <th>Estado Matrícula</th>
                                        <th>Tipo Tarifa</th>
                                        <th>Dirección</th>
                                        <th>Fecha Creación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matriculas.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.id_matricula}</td>
                                            <td>{item.numero_matricula}</td>
                                            <td>{item.numero_documento}</td>
                                            <td>{item.nombre}</td>
                                            <td>{formatCurrency(item.valor_matricula)}</td>
                                            <td>{item.descripcion_cliente}</td>
                                            <td>{item.tipo_tarifa}</td>
                                            <td>{item.direccion}</td>
                                            <td>{new Date(item.fecha_creacion).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    className="pagos-button pagos-button-save"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <FaEdit />
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
                .pagos-modal-large {
                    max-width: 90% !important;
                    width: 90% !important;
                    margin: 20px;
                }

                .pagos-table-container-large {
                    max-height: 70vh;
                    overflow-y: auto;
                }

                .pagos-table {
                    min-width: 100%;
                    border-collapse: collapse;
                }

                .pagos-table th,
                .pagos-table td {
                    padding: 12px 15px;
                    text-align: left;
                    white-space: nowrap;
                }

                .pagos-table thead {
                    position: sticky;
                    top: 0;
                    background-color: #53D4FF;
                    z-index: 1;
                }

                .pagos-table tbody tr:hover {
                    background-color: rgba(83, 212, 255, 0.1);
                }

                .pagos-modal-overlay {
                    padding: 0;
                }

                @media (max-width: 1200px) {
                    .pagos-table-container-large {
                        overflow-x: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default MatriculasPage;