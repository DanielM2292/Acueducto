import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const MatriculasPage = () => {
    const [idMatricula, setIdMatricula] = useState("");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [valorMatricula, setValorMatricula] = useState("");
    const [estadoMatricula, setEstadoMatricula] = useState("ESM0001");
    const [matriculas, setMatriculas] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedMatricula, setSelectedMatricula] = useState(null); // Definir el estado aquí

    const estadosMatricula = {
        "ESM0001": "Parcial",
        "ESM0002": "Total",
    };

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
        if (!numeroDocumento || !valorMatricula) {
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
                    id_estado_matricula: estadoMatricula 
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
        if (!selectedMatricula || !numeroDocumento || !valorMatricula) {
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
                    id_estado_matricula: estadoMatricula 
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
            const response = await fetch(`http://localhost:9090/matriculas/buscar_matricula_por_documento?numero_documento=${numeroDocumento}`);
            const data = await response.json();
            if (response.ok) {
                setMatriculas(data);
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
                notify("Todas las matrículas listadas", "success");
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
        setEstadoMatricula(matricula.id_estado_matricula);
        setEditMode(true);
    };

    const resetForm = () => {
        setNumeroDocumento("");
        setValorMatricula("");
        setEstadoMatricula("ESM0001");
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
                        name="estado_matricula"
                        value={estadoMatricula}
                        onChange={(e) => setEstadoMatricula(e.target.value)}
                        className="inputCustom"
                        required
                    >
                        <option value="ESM0001">Parcial</option>
                        <option value="ESM0002">Total</option>
                    </select>
                    <label>Estado Matrícula</label>
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
    
            <div className="MatriculasListCustom">
                <h2 className="ListMatriculasTitleCustom">Lista de Matrículas</h2>
                <div className="matriculasTableCustom">
                    <div className="matriculasTableHeaderCustom">
                        <div>ID Matrícula</div>
                        <div>Número Matrícula</div>
                        <div>Número de Documento</div>
                        <div>Valor Matrícula</div>
                        <div>Estado Matrícula</div>
                        <div>Fecha Creación</div>
                        <div>Acciones</div>
                    </div>
                    <div className="matriculasTableBodyCustom">
                        {matriculas.map((item, index) => (
                            <div key={index} className="matriculasTableRowCustom">
                                <div>{item.id_matricula}</div>
                                <div>{item.numero_matricula}</div>
                                <div>{item.numero_documento}</div>
                                <div>{formatCurrency(item.valor_matricula)}</div>
                                <div>{estadosMatricula[item.id_estado_matricula]}</div>
                                <div>{new Date(item.fecha_creacion).toLocaleDateString()}</div>
                                <div>
                                    <button className="crudBtnCustom" onClick={() => handleEdit(item)}>
                                        <FaEdit />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
    };
    
    export default MatriculasPage;
    