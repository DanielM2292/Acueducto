import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TarifaPage = () => {
    const [tipoTarifa, setTipoTarifa] = useState('estandar');
    const [isLoading, setIsLoading] = useState(false);
    const [tarifaDefinida, setTarifaDefinida] = useState('');
    const [fechaInicioEstandar, setFechaInicioEstandar] = useState('');
    const [fechaFinEstandar, setFechaFinEstandar] = useState('');
    const [limiteMedidor, setLimiteMedidor] = useState('');
    const [valorHastaLimite, setValorHastaLimite] = useState('');
    const [valorMetroCubico, setValorMetroCubico] = useState('');
    const [fechaInicioMedidor, setFechaInicioMedidor] = useState('');
    const [fechaFinMedidor, setFechaFinMedidor] = useState('');
    const [focusedInput, setFocusedInput] = useState('');

    const notify = (message, type) => {
        toast[type](message);
    };

    const resetForm = () => {
        if (tipoTarifa === 'estandar') {
            setTarifaDefinida('');
            setFechaInicioEstandar('');
            setFechaFinEstandar('');
        } else {
            setLimiteMedidor('');
            setValorHastaLimite('');
            setValorMetroCubico('');
            setFechaInicioMedidor('');
            setFechaFinMedidor('');
        }
    };

    const handleFetchTarifas = async () => {
        try {
            if (tipoTarifa === 'estandar') {
                const response = await fetch("http://localhost:9090/gestion/estandar");
                const data = await response.json();
                if (response.ok) {
                    setTarifaDefinida(data.tarifa_definida || '');
                    setFechaInicioEstandar(data.fecha_inicio_tarifa || '');
                    setFechaFinEstandar(data.fecha_final_tarifa || '');
                } else {
                    notify("Error al cargar la tarifa estándar", "error");
                }
            } else {
                const response = await fetch("http://localhost:9090/gestion/medidor");
                const data = await response.json();
                if (response.ok) {
                    setLimiteMedidor(data.limite_medidor || '');
                    setValorHastaLimite(data.valor_limite || '');
                    setValorMetroCubico(data.valor_metro3 || '');
                    setFechaInicioMedidor(data.fecha_inicio_tarifa || '');
                    setFechaFinMedidor(data.fecha_final_tarifa || '');
                } else {
                    notify("Error al cargar la tarifa de medidor", "error");
                }
            }
        } catch (error) {
            notify("Error de conexión", "error");
        }
    };

    const handleChangeTipoTarifa = (e) => {
        setTipoTarifa(e.target.value);
    };

    const handleUpdateTarifa = async () => {
        if (tipoTarifa === 'estandar') {
            if (!tarifaDefinida || parseFloat(tarifaDefinida) <= 0) {
                notify("La tarifa debe ser un valor positivo", "warning");
                return;
            }
            if (!fechaInicioEstandar || !fechaFinEstandar) {
                notify("Debe especificar fechas de inicio y fin", "warning");
                return;
            }

            try {
                const response = await fetch("http://localhost:9090/gestion/actualizar_estandar", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tarifaDefinida: parseFloat(tarifaDefinida),
                        fechaInicio: fechaInicioEstandar,
                        fechaFin: fechaFinEstandar
                    })
                });

                if (response.ok) {
                    notify("Tarifa estándar actualizada exitosamente", "success");
                    resetForm();
                } else {
                    notify("Error al actualizar la tarifa estándar", "error");
                }
            } catch (error) {
                notify("Error de conexión", "error");
            }
        } else {
            if (!limiteMedidor || parseFloat(limiteMedidor) <= 0) {
                notify("El límite del medidor debe ser un valor positivo", "warning");
                return;
            }
            if (!valorHastaLimite || parseFloat(valorHastaLimite) <= 0) {
                notify("El valor hasta límite debe ser positivo", "warning");
                return;
            }
            if (!valorMetroCubico || parseFloat(valorMetroCubico) <= 0) {
                notify("El valor por metro cúbico debe ser positivo", "warning");
                return;
            }
            if (!fechaInicioMedidor || !fechaFinMedidor) {
                notify("Debe especificar fechas de inicio y fin", "warning");
                return;
            }

            try {
                const response = await fetch("http://localhost:9090/gestion/actualizar_medidor", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        limiteMedidor: parseFloat(limiteMedidor),
                        valorHastaLimite: parseFloat(valorHastaLimite),
                        valorMetroCubico: parseFloat(valorMetroCubico),
                        fechaInicio: fechaInicioMedidor,
                        fechaFin: fechaFinMedidor
                    })
                });

                if (response.ok) {
                    notify("Tarifa de medidor actualizada exitosamente", "success");
                    resetForm();
                } else {
                    notify("Error al actualizar la tarifa de medidor", "error");
                }
            } catch (error) {
                notify("Error de conexión", "error");
            }
        }
    };

    useEffect(() => {
        handleFetchTarifas();
    }, [tipoTarifa]);

    return (
        <div className="tarifa-container">
            <ToastContainer />
            <h1 className="tarifa-title">Gestión de Tarifas</h1>

            <div className="tarifa-selector">
                <select 
                    id="tipoTarifa" 
                    value={tipoTarifa} 
                    onChange={handleChangeTipoTarifa}
                    className="tarifa-select"
                >
                    <option value="estandar">Tarifa Estándar</option>
                    <option value="medidor">Tarifa Medidor</option>
                </select>
            </div>

            <div className="tarifa-form">
                {tipoTarifa === 'estandar' ? (
                    <>
                        <div className={`floating-input-group ${tarifaDefinida || focusedInput === 'tarifaDefinida' ? 'active' : ''}`}>
                            <input
                                id="tarifaDefinida"
                                type="number"
                                value={tarifaDefinida}
                                onChange={(e) => setTarifaDefinida(e.target.value)}
                                className="floating-input"
                                placeholder=" "
                                onFocus={() => setFocusedInput('tarifaDefinida')}
                                onBlur={() => setFocusedInput(null)}
                                required
                            />
                            <label htmlFor="tarifaDefinida" className="floating-label">Tarifa Definida</label>
                        </div>

                        <div className="fecha-group">
                            <div className="fecha-field">
                                <input
                                    id="fechaInicioEstandar"
                                    type="date"
                                    value={fechaInicioEstandar}
                                    onChange={(e) => setFechaInicioEstandar(e.target.value)}
                                    className="fecha-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="fecha-group">
                            <div className="fecha-field">
                                <input
                                    id="fechaFinEstandar"
                                    type="date"
                                    value={fechaFinEstandar}
                                    onChange={(e) => setFechaFinEstandar(e.target.value)}
                                    className="fecha-input"
                                    required
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={`floating-input-group ${limiteMedidor || focusedInput === 'limiteMedidor' ? 'active' : ''}`}>
                            <input
                                id="limiteMedidor"
                                type="number"
                                value={limiteMedidor}
                                onChange={(e) => setLimiteMedidor(e.target.value)}
                                className="floating-input"
                                placeholder=" "
                                onFocus={() => setFocusedInput('limiteMedidor')}
                                onBlur={() => setFocusedInput(null)}
                                required
                            />
                            <label htmlFor="limiteMedidor" className="floating-label">Límite Medidor (m³)</label>
                        </div>

                        <div className={`floating-input-group ${valorHastaLimite || focusedInput === 'valorHastaLimite' ? 'active' : ''}`}>
                            <input
                                id="valorHastaLimite"
                                type="number"
                                value={valorHastaLimite}
                                onChange={(e) => setValorHastaLimite(e.target.value)}
                                className="floating-input"
                                placeholder=" "
                                onFocus={() => setFocusedInput('valorHastaLimite')}
                                onBlur={() => setFocusedInput(null)}
                                required
                            />
                            <label htmlFor="valorHastaLimite" className="floating-label">Valor Hasta Límite</label>
                        </div>

                        <div className={`floating-input-group ${valorMetroCubico || focusedInput === 'valorMetroCubico' ? 'active' : ''}`}>
                            <input
                                id="valorMetroCubico"
                                type="number"
                                value={valorMetroCubico}
                                onChange={(e) => setValorMetroCubico(e.target.value)}
                                className="floating-input"
                                placeholder=" "
                                onFocus={() => setFocusedInput('valorMetroCubico')}
                                onBlur={() => setFocusedInput(null)}
                                required
                            />
                            <label htmlFor="valorMetroCubico" className="floating-label">Valor Metro Cúbico</label>
                        </div>
                        
                        <div className="fecha-group">
                            <div className="fecha-field">
                                <input
                                    id="fechaInicioMedidor"
                                    type="date"
                                    value={fechaInicioMedidor}
                                    onChange={(e) => setFechaInicioMedidor(e.target.value)}
                                    className="fecha-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="fecha-group">
                            <div className="fecha-field">
                                <input
                                    id="fechaFinMedidor"
                                    type="date"
                                    value={fechaFinMedidor}
                                    onChange={(e) => setFechaFinMedidor(e.target.value)}
                                    className="fecha-input"
                                    required
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="tarifa-buttons">
                    <button 
                        onClick={handleUpdateTarifa}
                        className="tarifa-button tarifa-button-primary">
                        Cambiar Tarifa
                    </button>
                </div>
            </div>

            <style>{`
                .tarifa-container {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .tarifa-title {
                    font-size: 24px;
                    margin-bottom: 20px;
                    color: #333;
                    text-align: center;
                }

                .tarifa-selector {
                    margin-bottom: 20px;
                }

                .tarifa-select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                    background-color: white;
                }

                .tarifa-form {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .floating-input-group {
                    position: relative;
                    margin-bottom: 20px;
                }

                .floating-input {
                    width: 100%;
                    height: 50px;
                    padding: 20px 16px 0 16px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                    background-color: white;
                    transition: border-color 0.3s, box-shadow 0.3s;
                }

                .floating-label {
                    position: absolute;
                    left: 16px;
                    top: 15px;
                    font-size: 16px;
                    color: #999;
                    pointer-events: none;
                    transition: all 0.2s ease;
                }

                .floating-input:focus {
                    border-color: #4a90e2;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
                }

                .floating-input:focus + .floating-label,
                .floating-input:not(:placeholder-shown) + .floating-label,
                .floating-input-group.active .floating-label {
                    top: 5px;
                    font-size: 12px;
                    color: #4a90e2;
                }

                .fecha-group {
                    margin-bottom: 20px;
                }

                .fecha-field {
                    display: flex;
                    flex-direction: column;
                }

                .fecha-input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                    background-color: white;
                    transition: border-color 0.3s, box-shadow 0.3s;
                }

                .fecha-input:focus {
                    border-color: #4a90e2;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
                }

                .tarifa-buttons {
                    display: flex;
                    gap: 15px;
                    margin-top: 25px;
                }

                .tarifa-button {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                    flex: 1;
                    transition: background-color 0.3s, transform 0.2s;
                    text-align: center;
                }

                .tarifa-button-primary {
                    background-color: #4a90e2;
                    color: white;
                }

                .tarifa-button:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }

                .tarifa-button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default TarifaPage;