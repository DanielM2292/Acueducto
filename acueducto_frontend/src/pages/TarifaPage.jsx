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
        }
    };

    // Función para formatear la fecha al formato YYYY-MM-DD que requiere el input type="date"
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        // Si ya está en formato ISO (YYYY-MM-DD), devuélvelo directamente
        if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) return dateString.split('T')[0];
        
        // Si está en otro formato (por ejemplo, DD/MM/YYYY), conviértelo
        const parts = dateString.split(/[/\-\.]/);
        if (parts.length === 3) {
            // Asumimos que puede estar en formato DD/MM/YYYY
            if (parts[0].length === 2 && parts[1].length === 2) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            // O en formato YYYY/MM/DD
            if (parts[0].length === 4) {
                return `${parts[0]}-${parts[1]}-${parts[2]}`;
            }
        }
        
        // Si no podemos determinar el formato, intentamos parsear con Date
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        } catch (error) {
            console.error("Error al formatear fecha:", error);
        }
        
        return '';
    };

    const handleFetchTarifas = async () => {
        try {
            if (tipoTarifa === 'estandar') {
                const response = await fetch("http://localhost:9090/gestion/estandar");
                const data = await response.json();
                if (response.ok) {
                    setTarifaDefinida(data.tarifa_definida || '');
                    
                    // Formateamos las fechas recibidas de la BD para que funcionen en los inputs de tipo date
                    if (data.fecha_inicio_tarifa) {
                        setFechaInicioEstandar(formatDateForInput(data.fecha_inicio_tarifa));
                    }
                    
                    if (data.fecha_final_tarifa) {
                        setFechaFinEstandar(formatDateForInput(data.fecha_final_tarifa));
                    }
                    
                    console.log("Datos cargados:", {
                        tarifa: data.tarifa_definida,
                        fechaInicio: formatDateForInput(data.fecha_inicio_tarifa),
                        fechaFin: formatDateForInput(data.fecha_final_tarifa)
                    });
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
                } else {
                    notify("Error al cargar la tarifa de medidor", "error");
                }
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
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
                    handleFetchTarifas(); // Recargar datos después de actualizar
                } else {
                    notify("Error al actualizar la tarifa estándar", "error");
                }
            } catch (error) {
                notify("Error de conexión", "error");
            }
        } else {
            if (!valorMetroCubico || parseFloat(valorMetroCubico) <= 0) {
                notify("El valor por metro cúbico debe ser positivo", "warning");
                return;
            }

            try {
                const response = await fetch("http://localhost:9090/gestion/actualizar_medidor", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        valorMetroCubico: parseFloat(valorMetroCubico),
                    })
                });

                if (response.ok) {
                    notify("Tarifa de medidor actualizada exitosamente", "success");
                    handleFetchTarifas(); // Recargar datos después de actualizar
                } else {
                    notify("Error al actualizar la tarifa de medidor", "error");
                }
            } catch (error) {
                notify("Error de conexión", "error");
            }
        }
    };

    const handleCreateBackup = async () => {
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

    // Cargar los datos al iniciar el componente y cuando cambia el tipo de tarifa
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

                        <div className="floating-input-group fecha-group">
                            <div className="fecha-label-container">
                                <label htmlFor="fechaInicioEstandar" className="floating-label fecha-floating-label">Fecha de Inicio</label>
                            </div>
                            <input
                                id="fechaInicioEstandar"
                                type="date"
                                value={fechaInicioEstandar}
                                onChange={(e) => setFechaInicioEstandar(e.target.value)}
                                className="floating-input fecha-input"
                                required
                            />
                        </div>

                        <div className="floating-input-group fecha-group">
                            <div className="fecha-label-container">
                                <label htmlFor="fechaFinEstandar" className="floating-label fecha-floating-label">Fecha de Fin</label>
                            </div>
                            <input
                                id="fechaFinEstandar"
                                type="date"
                                value={fechaFinEstandar}
                                onChange={(e) => setFechaFinEstandar(e.target.value)}
                                className="floating-input fecha-input"
                                required
                            />
                        </div>
                    </>
                ) : (
                    <>
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
                    </>
                )}

                <div className="tarifa-buttons">
                    <button 
                        onClick={handleUpdateTarifa}
                        className="tarifa-button tarifa-button-primary">
                        Cambiar Tarifa
                    </button>
                </div>
                
                <div className="backup-section">
                    <button 
                        onClick={handleCreateBackup}
                        disabled={isLoading}
                        className="tarifa-button backup-button">
                        {isLoading ? 'Creando...' : 'Crear Copia de Seguridad'}
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
                
                .fecha-label-container {
                    margin-bottom: 5px;
                }
                
                .fecha-floating-label {
                    position: static;
                    font-size: 14px;
                    color: #555;
                    font-weight: 500;
                }

                .fecha-input {
                    padding: 10px 16px;
                    height: 42px;
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
                
                .backup-section {
                    margin-top: 20px;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                
                .backup-button {
                    background-color: #28a745;
                    color: white;
                    width: 100%;
                }
                
                .backup-button:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
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