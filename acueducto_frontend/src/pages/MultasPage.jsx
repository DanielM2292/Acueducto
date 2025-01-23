import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MultasPage = () => {
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [motivoMulta, setMotivoMulta] = useState("");
    const [valorMulta, setValorMulta] = useState("");
    const [multas, setMultas] = useState([]);

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
            const response = await fetch("http://localhost:9090/crear_multa", {
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

    const fetchMultas = async () => {
        try {
            const response = await fetch("http://localhost:9090/listar_todas_multas");
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
                </div>
            </div>

            <div className="MultasListCustom">
                <h2 className="ListMultasTitleCustom">Lista de Multas</h2>
                <div className="multasTableCustom">
                    <div className="multasTableHeaderCustom">
                        <div>ID Multa</div>
                        <div>Motivo Multa</div>
                        <div>Valor Multa</div>
                        <div>Número de Documento</div>
                    </div>
                    <div className="multasTableBodyCustom">
                        {multas.map((item, index) => (
                            <div key={index} className="multasTableRowCustom">
                                <div>{item.id_multa}</div>
                                <div>{item.motivo_multa}</div>
                                <div>{item.valor_multa}</div>
                                <div>{item.numero_documento}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultasPage;
