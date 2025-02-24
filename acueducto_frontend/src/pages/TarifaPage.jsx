import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";

const TarifaPage = () => {
    const [tarifaAnterior, setTarifaAnterior] = useState(0); // Estado para la tarifa anterior
    const [tarifaNueva, setTarifaNueva] = useState(0); // Estado para la nueva tarifa
    const [isLoading, setIsLoading] = useState(false); // Estado para el loading

    const notify = (message, type) => {
        toast[type](message);
    };

    const handleFetchTarifa = async () => {
        try {
            const response = await fetch("http://localhost:9090/tarifa/actual");
            const data = await response.json();
            if (response.ok) {
                setTarifaAnterior(data.tarifa); // Establecer la tarifa anterior desde la API
            } else {
                notify("Error al cargar la tarifa actual", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
        }
    };

    const handleUpdateTarifa = async () => {
        if (tarifaNueva <= 0) {
            notify("La tarifa debe ser un valor positivo", "warning");
            return;
        }

        if (tarifaNueva === tarifaAnterior) {
            notify("La nueva tarifa es igual a la tarifa anterior", "info");
            return;
        }

        try {
            const response = await fetch("http://localhost:9090/tarifa/actualizar", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tarifa: tarifaNueva })
            });

            if (response.ok) {
                notify("Tarifa actualizada exitosamente", "success");
                setTarifaAnterior(tarifaNueva); // Actualizar la tarifa anterior
            } else {
                notify("Error al actualizar la tarifa", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
        }
    };

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
        handleFetchTarifa(); // Cargar la tarifa actual al montar el componente
    }, []);

    return (
        <div className="tarifa-container">
            <ToastContainer />
            <h1 className="tarifa-title">Gestión de Tarifas</h1>

            <div className="tarifa-form">
                <div className="tarifa-input-group">
                    <input
                        type="number"
                        value={tarifaNueva}
                        onChange={(e) => setTarifaNueva(e.target.value)}
                        className="tarifa-input"
                        placeholder="Ingrese el nuevo precio de la tarifa"
                        required
                    />
                </div>

                <div className="tarifa-buttons">
                    <button 
                        onClick={handleUpdateTarifa}
                        className="tarifa-button tarifa-button-primary">
                        Actualizar Tarifa
                    </button>
                    <button 
                        onClick={handleBackupDatabase}
                        className="tarifa-button"
                        disabled={isLoading}>
                        {isLoading ? "Creando copia..." : "Crear Copia de Seguridad"}
                    </button>
                </div>
            </div>

            <style>{`
                .tarifa-container {
                    padding: 20px;
                }

                .tarifa-title {
                    font-size: 24px;
                    margin-bottom: 20px;
                }

                .tarifa-form {
                    margin-bottom: 20px;
                }

                .tarifa-input-group {
                    margin-bottom: 20px;
                }

                .tarifa-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 0.375rem;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .tarifa-input:focus {
                    border-color: #4a90e2;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
                }

                .tarifa-buttons {
                    display: flex;
                    gap: 10px;
                }

                .tarifa-button {
                    padding: 10px 15px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-right: 10px;
                }

                .tarifa-button-primary {
                    background-color: #4a90e2;
                    color: white;
                }

                .tarifa-button:hover {
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};

export default TarifaPage;