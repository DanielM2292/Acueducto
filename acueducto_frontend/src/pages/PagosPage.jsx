import React, { useState, useEffect } from 'react';

const PagosPage = () => {
    const API_BASE_URL = "http://localhost:9090";

    const [tipo, setTipo] = useState('Factura');
    const [tarifa, setTarifa] = useState('Estandar');
    const [showHistorial, setShowHistorial] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [idReferencia, setIdReferencia] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [historialData, setHistorialData] = useState([]);
    const [paymentData, setPaymentData] = useState({
        total: '',
        pendiente: '',
        aCancelar: '',
        idFactura: '',
        lecturaAnterior: '',
        lecturaActual: '',
        fechaLecturaAnterior: '',
        fechaLecturaActual: '',
    });

    useEffect(() => {
        fetchHistorial();
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const handleIdChange = (value, type) => {
        if (type === 'Factura') {
            setPaymentData(prev => ({
                ...prev,
                idFactura: value
            }));
        } else {
            setIdReferencia(value);
        }

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (!value.trim()) {
            setPaymentData(prev => ({
                ...prev,
                total: '',
                pendiente: '',
                aCancelar: ''
            }));
            return;
        }

        const newTimeout = setTimeout(() => {
            fetchPaymentDetails(value, type);
        }, 500);

        setSearchTimeout(newTimeout);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchPaymentDetails = async (id, type) => {
        setLoading(true);
        setError(null);
        try {
            const endpoints = {
                'Factura': `${API_BASE_URL}/facturas/obtener_factura/${id}`,
                'Multa': `${API_BASE_URL}/multas/obtener_multa?id_multa=${id}`,
                'Matricula': `${API_BASE_URL}/matriculas/obtener_matricula?id_matricula=${id}`
            };

            const response = await fetch(endpoints[type]);
            if (!response.ok) throw new Error('Error al obtener detalles del pago');

            const data = await response.json();
            setPaymentData(prev => ({
                ...prev,
                valor_matricula: data.valor_matricula,
                valor_multa: data.valor_multa,
                valor_pendiente: data.valor_pendiente,
                aCancelar: data.aCancelar
            }));
        } catch (err) {
            setError('Error al cargar los detalles del pago');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistorial = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/pagos/listar_historial`);
            if (!response.ok) throw new Error('Error al cargar el historial');

            const data = await response.json();
            setHistorialData(data);
        } catch (err) {
            setError('Error al cargar el historial de pagos');
            console.error(err);
        }
    };

    const procesarPago = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (parseFloat(paymentData.aCancelar) > parseFloat(paymentData.pendiente)) {
            setErrorMessage('El valor a cancelar no puede ser mayor que el valor pendiente.');
            setLoading(false);
            return;
        }

        try {
            const endpoints = {
                'Factura': `${API_BASE_URL}/pagos/registrar_pago`,
                'Multa': `${API_BASE_URL}/pagos/registrar_pago_multa`,
                'Matricula': `${API_BASE_URL}/pagos/registrar_pago`
            };

            const payloadData = {
                tipo,
                id: tipo === 'Factura' ? paymentData.idFactura : idReferencia,
                valor: paymentData.aCancelar,
                ...(tipo === 'Factura' && tarifa === 'Medidor' && {
                    lecturaAnterior: paymentData.lecturaAnterior,
                    lecturaActual: paymentData.lecturaActual,
                    fechaLecturaAnterior: paymentData.fechaLecturaAnterior,
                    fechaLecturaActual: paymentData.fechaLecturaActual,
                })
            };

            const response = await fetch(endpoints[tipo], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payloadData)
            });

            if (!response.ok) throw new Error('Error al procesar el pago');

            setPaymentData({
                total: '',
                pendiente: '',
                aCancelar: '',
                idFactura: '',
                lecturaAnterior: '',
                lecturaActual: '',
                fechaLecturaAnterior: '',
                fechaLecturaActual: '',
            });
            setIdReferencia('');

            setSuccessMessage('Pago procesado exitosamente');
            fetchHistorial();
        } catch (err) {
            setErrorMessage('Error al procesar el pago');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowHistorial(false);
            setIsClosing(false);
        }, 300);
    };

    const renderFields = () => {
        if (tipo === 'Factura') {
            return (
                <div className="pagos-form-grid">
                    <div className="input-with-icon">
                        <input
                            type="text"
                            name="idFactura"
                            value={paymentData.idFactura}
                            onChange={(e) => handleIdChange(e.target.value, 'Factura')}
                            placeholder="Id Factura"
                            className="pagos-input"
                        />
                        {loading && (
                            <span className="loading-indicator">
                                <div className="spinner"></div>
                            </span>
                        )}
                    </div>
                    <input
                        type="text"
                        value={paymentData.total}
                        disabled
                        placeholder="Total"
                        className="pagos-input"
                    />
                    <input
                        type="text"
                        value={paymentData.pendiente}
                        disabled
                        placeholder="Valor Pendiente"
                        className="pagos-input"
                    />
                    <input
                        type="text"
                        name="aCancelar"
                        value={paymentData.aCancelar}
                        onChange={handleInputChange}
                        placeholder="Valor a Cancelar"
                        className="pagos-input"
                    />
                </div>
            );
        } else {
            return (
                <div className="pagos-form-grid">
                    <div className="input-with-icon">
                        <input
                            type="text"
                            value={idReferencia}
                            onChange={(e) => handleIdChange(e.target.value, tipo)}
                            placeholder={`ID ${tipo}`}
                            className="pagos-input"
                        />
                        {loading && (
                            <span className="loading-indicator">
                                <div className="spinner"></div>
                            </span>
                        )}
                    </div>
                    <input
                        type="text"
                        value={paymentData.valor_matricula || paymentData.valor_multa}
                        disabled
                        placeholder="Total"
                        className="pagos-input"
                    />
                    <input
                        type="text"
                        value={paymentData.valor_pendiente}
                        disabled
                        placeholder="Valor Pendiente"
                        className="pagos-input"
                    />
                    <input
                        type="text"
                        name="aCancelar"
                        value={paymentData.aCancelar}
                        onChange={handleInputChange}
                        placeholder="Valor a Cancelar"
                        className="pagos-input"
                    />
                </div>
            );
        }
    };

    return (
        <div className="pagos-container">
            {successMessage && (
                <div className="message success">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="message error">
                    {errorMessage}
                </div>
            )}
            <div className="pagos-card">
                <h2 className="pagos-title">Pagos</h2>
                <div className="pagos-form-grid">
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="pagos-select"
                    >
                        <option value="Factura">Factura</option>
                        <option value="Multa">Multa</option>
                        <option value="Matricula">Matrícula</option>
                    </select>
                </div>
                {renderFields()}
                <div className="pagos-button-group">
                    <button
                        className="pagos-button pagos-button-save"
                        onClick={procesarPago}
                    >
                        Guardar Pago
                    </button>
                    <button
                        className="pagos-button pagos-button-history"
                        onClick={() => setShowHistorial(true)}
                    >
                        Ver Historial
                    </button>
                </div>
            </div>

            {showHistorial && (
                <div className={`pagos-modal-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`pagos-modal ${isClosing ? 'closing' : ''}`}>
                        <h3 className="pagos-modal-title">Historial de Pagos</h3>
                        <div className="pagos-table-container">
                            <table className="pagos-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tipo</th>
                                        <th>Fecha</th>
                                        <th>Valor</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historialData.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id_ingreso}</td>
                                            <td>{item.descripcion_ingreso}</td>
                                            <td>{item.valor_ingreso}</td>
                                            <td>{item.fecha_ingreso}</td>
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
                .meter-readings-container {
                    display: grid;
                    gap: 1rem;
                    width: 100%;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .input-label {
                    color: #1a1a1a;
                    font-size: 0.875rem;
                    font-weight: 500;
                    position: static;
                    margin-bottom: 0.25rem;
                }

                .pagos-input {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.375rem;
                    margin-top: 0;
                }

                .pagos-input:focus {
                    outline: none;
                    border-color: #4299e1;
                    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
                }
                .message {
                    padding: 10px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    text-align: center;
                    font-size: 14px;
                }

                .message.success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

            `}</style>
        </div>
    );
};

export default PagosPage;