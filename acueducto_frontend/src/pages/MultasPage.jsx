import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MultasPage = () => {
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [motivoMulta, setMotivoMulta] = useState("");
    const [valorMulta, setValorMulta] = useState("");
    const [multas, setMultas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [matriculas, setMatriculas] = useState([]);
    const [showMatriculas, setShowMatriculas] = useState(false);
    const [selectedMatricula, setSelectedMatricula] = useState(null);

    // Función para formatear valores a pesos colombianos
    const formatearPesos = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    };

    const notify = (message, type) => {
        if (type === "success") {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    const buscarMatriculas = async () => {
        if (!numeroDocumento) {
            notify("Por favor ingrese un número de documento", "error");
            return;
        }
        try {
            const response = await fetch(`http://localhost:9090/matriculas/buscar_matriculas_por_documento?numero_documento=${numeroDocumento}`);
            const data = await response.json();
            if (response.ok) {
                if (data.length === 0) {
                    notify("El cliente no tiene matrículas registradas", "error");
                    return;
                }
                setMatriculas(data);
                setShowMatriculas(true);
            } else {
                notify(data.message || "Error al buscar matrículas", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleAddMulta = async () => {
        if (!numeroDocumento || !motivoMulta || !valorMulta || !selectedMatricula) {
            notify("Por favor complete todos los campos y seleccione una matrícula", "error");
            return;
        }
        try {
            const response = await fetch("http://localhost:9090/multas/crear_multa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    numero_documento: numeroDocumento, 
                    motivo_multa: motivoMulta, 
                    valor_multa: valorMulta,
                    id_matricula: selectedMatricula.id_matricula 
                }),
            });
            const data = await response.json();
            if (response.ok) {
                notify("Multa creada y asociada exitosamente", "success");
                fetchMultas(); 
                resetForm();
            } else {
                notify(data.message || "Error al agregar la multa", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleSelectMatricula = (matricula) => {
        setSelectedMatricula(matricula);
        setShowMatriculas(false);
        notify(`Matrícula ${matricula.numero_matricula} seleccionada`, "success");
    };

    const fetchMultas = async () => {
        try {
            const response = await fetch("http://localhost:9090/multas/listar_todas_multas");
            const data = await response.json();
            if (response.ok) {
                setMultas(data);
            } else {
                notify("Error al obtener las multas", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const resetForm = () => {
        setNumeroDocumento("");
        setMotivoMulta("");
        setValorMulta("");
        setSelectedMatricula(null);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setShowMatriculas(false);
            setIsClosing(false);
        }, 300);
    };

    useEffect(() => {
        fetchMultas();
    }, []);

    return (
        <div className="MultasPageCustom">
            <ToastContainer />
            <h1 className="pagesTitleCustom">Gestión de Multas</h1>
            <div className="formMultasCustom">
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
                <div className="buttonsCustom">
                    <button className="crudBtnCustomMat" onClick={buscarMatriculas}>
                        Buscar Matrículas Cliente
                    </button>
                </div>
                {selectedMatricula && (
                    <div className="selectedMatriculaInfo">
                        <p>Matrícula seleccionada: {selectedMatricula.numero_matricula}</p>
                    </div>
                )}
                <div className="groupCustom">
                    <input
                        type="text"
                        name="motivo_multa"
                        value={motivoMulta}
                        onChange={(e) => setMotivoMulta(e.target.value)}
                        className="inputCustom"
                        required
                    />
                    <label>Motivo de la Multa</label>
                </div>
                <div className="groupCustom">
                    <input
                        type="number"
                        name="valor_multa"
                        value={valorMulta}
                        onChange={(e) => setValorMulta(e.target.value)}
                        className="inputCustom"
                        required
                        style={{ MozAppearance: "textfield" }}
                    />
                    <label>Valor de la Multa</label>
                </div>
                <div className="buttonsCustom">
                    <button 
                        className="crudBtnCustom" 
                        onClick={handleAddMulta}
                        disabled={!selectedMatricula}
                    >
                        Crear Multa
                    </button>
                    <button className="crudBtnCustom" onClick={resetForm}>
                        Limpiar Formulario
                    </button>
                    <button className="crudBtnCustom" onClick={() => setIsModalOpen(true)}>
                        Mostrar Multas
                    </button>
                </div>
            </div>

            {showMatriculas && (
                <div className={`pagos-modal-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`pagos-modal ${isClosing ? 'closing' : ''}`}>
                        <h3 className="pagos-modal-title">Matrículas del Cliente</h3>
                        <div className="pagos-table-container">
                            <table className="pagos-table">
                                <thead>
                                    <tr>
                                        <th>Número Matrícula</th>
                                        <th>Dirección</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matriculas.map((matricula) => (
                                        <tr key={matricula.id_matricula}>
                                            <td>{matricula.numero_matricula}</td>
                                            <td>{matricula.direccion}</td>
                                            <td>{matricula.estado}</td>
                                            <td>
                                                <button
                                                    className="pagos-button pagos-button-save"
                                                    onClick={() => {
                                                        handleSelectMatricula(matricula);
                                                        setShowMatriculas(false);
                                                    }}
                                                >
                                                    Seleccionar
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

            {isModalOpen && (
                <div className={`pagos-modal-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`pagos-modal ${isClosing ? 'closing' : ''}`}>
                        <h3 className="pagos-modal-title">Lista de Multas</h3>
                        <div className="pagos-table-container">
                            <table className="pagos-table">
                                <thead>
                                    <tr>
                                        <th>ID Multa</th>
                                        <th>Cliente</th>
                                        <th>Matrícula</th>
                                        <th>Motivo Multa</th>
                                        <th>Valor Multa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {multas.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.id_multa}</td>
                                            <td>{item.nombre}</td>
                                            <td>{item.numero_matricula}</td>
                                            <td>{item.motivo_multa}</td>
                                            <td>{formatearPesos(item.valor_multa)}</td>
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

            <style jsx>{`
                .selectedMatriculaInfo {
                    background-color: #e6f3ff;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                    text-align: center;
                }

                .selectedMatriculaInfo p {
                    margin: 0;
                    color: #0066cc;
                    font-weight: 500;
                }

                .crudBtnCustom:disabled {
                    background-image: linear-gradient(30deg, #cccccc, #eeeeee);
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default MultasPage;