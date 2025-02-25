import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TarifaPage = () => {
    const [tipoTarifa, setTipoTarifa] = useState('estandar'); // Estado para seleccionar entre tarifa estándar y medidor
    const [isLoading, setIsLoading] = useState(false); // Estado para el loading

    // Estados para tarifa estándar
    const [tarifaDefinida, setTarifaDefinida] = useState('');
    const [fechaInicioEstandar, setFechaInicioEstandar] = useState('');
    const [fechaFinEstandar, setFechaFinEstandar] = useState('');

    // Estados para tarifa medidor
    const [limiteMedidor, setLimiteMedidor] = useState('');
    const [valorHastaLimite, setValorHastaLimite] = useState('');
    const [valorMetroCubico, setValorMetroCubico] = useState('');
    const [fechaInicioMedidor, setFechaInicioMedidor] = useState('');
    const [fechaFinMedidor, setFechaFinMedidor] = useState('');

    // Estados para controlar los inputs activos
    const [focusedInput, setFocusedInput] = useState(null);

    const notify = (message, type) => {
        toast[type](message);
    };

    const handleFetchTarifas = async () => {
        try {
            if (tipoTarifa === 'estandar') {
                const response = await fetch("http://localhost:9090/tarifa/estandar");
                const data = await response.json();
                if (response.ok) {
                    setTarifaDefinida(data.tarifaDefinida || '');
                    setFechaInicioEstandar(data.fechaInicio || '');
                    setFechaFinEstandar(data.fechaFin || '');
                } else {
                    notify("Error al cargar la tarifa estándar", "error");
                }
            } else {
                const response = await fetch("http://localhost:9090/tarifa/medidor");
                const data = await response.json();
                if (response.ok) {
                    setLimiteMedidor(data.limiteMedidor || '');
                    setValorHastaLimite(data.valorHastaLimite || '');
                    setValorMetroCubico(data.valorMetroCubico || '');
                    setFechaInicioMedidor(data.fechaInicio || '');
                    setFechaFinMedidor(data.fechaFin || '');
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
                const response = await fetch("http://localhost:9090/tarifa/actualizar-estandar", {
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
                const response = await fetch("http://localhost:9090/tarifa/actualizar-medidor", {
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
                } else {
                    notify("Error al actualizar la tarifa de medidor", "error");
                }
            } catch (error) {
                notify("Error de conexión", "error");
            }
        }
    };

    // Volviendo a la lógica original para el backup
    const handleBackupDatabase = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:9090/gestion/backup", {
                method: "POST"
            });

            if (response.ok) {
                notify("Copia de seguridad creada exitosamente", "success");
            } else {
                notify("Error al crear la copia de seguridad", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleFetchTarifas(); // Cargar la tarifa actual al montar el componente o cambiar tipo
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
                    // Formulario para tarifa estándar
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
                            <input
                                id="fechaInicioEstandar"
                                type="date"
                                value={fechaInicioEstandar}
                                onChange={(e) => setFechaInicioEstandar(e.target.value)}
                                className="fecha-input"
                                required
                            />
                        </div>

                        <div className="fecha-group">
                            <input
                                id="fechaFinEstandar"
                                type="date"
                                value={fechaFinEstandar}
                                onChange={(e) => setFechaFinEstandar(e.target.value)}
                                className="fecha-input"
                                required
                            />
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
                            <input
                                id="fechaInicioMedidor"
                                type="date"
                                value={fechaInicioMedidor}
                                onChange={(e) => setFechaInicioMedidor(e.target.value)}
                                className="fecha-input"
                                required
                            />
                        </div>

                        <div className="fecha-group">
                            <input
                                id="fechaFinMedidor"
                                type="date"
                                value={fechaFinMedidor}
                                onChange={(e) => setFechaFinMedidor(e.target.value)}
                                className="fecha-input"
                                required
                            />
                        </div>
                    </>
                )}

                <div className="tarifa-buttons">
                    <button 
                        onClick={handleUpdateTarifa}
                        className="tarifa-button tarifa-button-primary">
                        Cambiar Tarifa
                    </button>
                    <button 
                        onClick={handleBackupDatabase}
                        className="tarifa-button tarifa-button-secondary"
                        disabled={isLoading}>
                        {isLoading ? "Creando copia..." : "Crear Copia de Seguridad"}
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

                .tarifa-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #555;
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

                /* Estilos para inputs flotantes */
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

                /* Estilos para fecha */
                .fecha-group {
                    margin-bottom: 20px;
                }

                .fecha-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #555;
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

                .tarifa-button-secondary {
                    background-color: #5cb85c;
                    color: white;
                }

                .tarifa-button:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }

                .tarifa-button:active {
                    transform: translateY(0);
                }

                .tarifa-button:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                    transform: none;
                }
            `}</style>
        </div>
    );
};

export default TarifaPage;