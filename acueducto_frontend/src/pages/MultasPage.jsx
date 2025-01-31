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

    const handleAddMulta = async () => {
        if (!numeroDocumento || !motivoMulta || !valorMulta) {
            notify("Por favor complete todos los campos", "error");
            return;
        }
        try {
            const response = await fetch("http://localhost:9090/multas/crear_multa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ numero_documento: numeroDocumento, motivo_multa: motivoMulta, valor_multa: valorMulta }),
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

    const handlePay = (multaId) => {
        notify("Funcionalidad de pago en desarrollo", "info");
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
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
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
                    <button className="crudBtnCustom" onClick={handleAddMulta}>
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
                                        <th>Motivo Multa</th>
                                        <th>Valor Multa</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {multas.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.id_multa}</td>
                                            <td>{item.nombre}</td>
                                            <td>{item.motivo_multa}</td>
                                            <td>{formatearPesos(item.valor_multa)}</td>
                                            <td>
                                                <button 
                                                    className="pagos-button pagos-button-save"
                                                    onClick={() => handlePay(item.id_multa)}
                                                >
                                                    Pagar
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
        </div>
    );
};

export default MultasPage;