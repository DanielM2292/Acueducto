import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PagosPage = () => {
    const API_BASE_URL = "http://localhost:9090";

    const [tipo, setTipo] = useState('Factura');
    const [tipoPago, setTipoPago] = useState('');
    const [tarifa, setTarifa] = useState('Estandar');
    const [showHistorial, setShowHistorial] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [idReferencia, setIdReferencia] = useState('');
    const [loading, setLoading] = useState(false);
    const [historialData, setHistorialData] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [paymentData, setPaymentData] = useState({
        total: '',
        pendiente: '',
        aCancelar: '',
        idFactura: '',
        lecturaAnterior: '',
        lecturaActual: '',
        fechaLecturaAnterior: '',
        fechaLecturaActual: '',
        estado: '',
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

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
                aCancelar: '',
                estado: ''
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
        try {
            const endpoints = {
                'Factura': `${API_BASE_URL}/facturas/obtener_factura?id_factura=${id}`,
                'Multa': `${API_BASE_URL}/multas/obtener_multa?id_multa=${id}`,
                'Matricula': `${API_BASE_URL}/matriculas/obtener_matricula?id_matricula=${id}`
            };

            const response = await fetch(endpoints[type]);
            if (!response.ok) throw new Error('Error al obtener detalles del pago');

            const data = await response.json();

            if (data.estado === 'PAGADO') {
                toast.warning('Este item ya se encuentra cancelado');
            }

            setPaymentData(prev => ({
                ...prev,
                total_factura: data.total_factura,
                valor_matricula: data.valor_matricula,
                valor_multa: data.valor_multa,
                valor_pendiente: data.valor_pendiente,
                aCancelar: data.estado === 'PAGADO' ? '' : data.aCancelar,
                estado: data.estado
            }));
        } catch (err) {
            toast.error('Error al cargar los detalles del pago');
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
            toast.error('Error al cargar el historial de pagos');
            console.error(err);
        }
    };

    const procesarPago = async () => {
        setLoading(true);

        if (paymentData.estado === 'PAGADO') {
            toast.error('Este item ya se encuentra cancelado');
            setLoading(false);
            return;
        }

        if (tipo === 'Factura' && !tipoPago) {
            toast.error('Por favor seleccione un tipo de pago');
            setLoading(false);
            return;
        }

        if (parseFloat(paymentData.aCancelar) > parseFloat(paymentData.pendiente)) {
            toast.error('El valor a cancelar no puede ser mayor que el valor pendiente.');
            setLoading(false);
            return;
        }

        try {
            const endpoints = {
                'Factura': `${API_BASE_URL}/pagos/registrar_pago_factura`,
                'Multa': `${API_BASE_URL}/pagos/registrar_pago_multa`,
                'Matricula': `${API_BASE_URL}/pagos/registrar_pago_matricula`
            };

            const payloadData = {
                tipo,
                ...(tipo === 'Factura' && { tipoPago }),
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

            // Limpiar el formulario
            setPaymentData({
                total: '',
                pendiente: '',
                aCancelar: '',
                idFactura: '',
                lecturaAnterior: '',
                lecturaActual: '',
                fechaLecturaAnterior: '',
                fechaLecturaActual: '',
                estado: '',
            });
            setIdReferencia('');
            setTipoPago('');

            toast.success('Pago procesado exitosamente');
            fetchHistorial();
        } catch (err) {
            toast.error('Error al procesar el pago');
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

    const handleTipoPagoChange = (e) => {
        const selectedTipoPago = e.target.value;
        setTipoPago(selectedTipoPago);

        let totalCalculated = 0;
        let pendienteCalculated = 0;

        // Calculamos el total y valor pendiente dependiendo del tipo de pago seleccionado
        if (selectedTipoPago === 'Mensual') {
            totalCalculated = paymentData.total_factura; // Mantén el valor normal
            pendienteCalculated = paymentData.valor_pendiente; // Mantén el valor normal
        } else if (selectedTipoPago === 'Semestral') {
            totalCalculated = (parseFloat(paymentData.total_factura) || 0) * 6;
            pendienteCalculated = (parseFloat(paymentData.valor_pendiente) || 0) * 6;
        } else if (selectedTipoPago === 'Anual') {
            totalCalculated = (parseFloat(paymentData.total_factura) || 0) * 12;
            pendienteCalculated = (parseFloat(paymentData.valor_pendiente) || 0) * 12;
        }

        // Actualizamos el estado con los nuevos valores calculados
        setPaymentData(prev => ({
            ...prev,
            total: totalCalculated,
            pendiente: pendienteCalculated
        }));
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
                    <select
                        value={tipoPago}
                        onChange={handleTipoPagoChange}
                        className="pagos-select"
                        disabled={paymentData.estado === 'PAGADO'}
                    >
                        <option value="">Seleccione el tipo de pago (por tiempo)</option>
                        <option value="Mensual">Mensual</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                    </select>
                    <input
                        type="text"
                        value={paymentData.total ? formatCurrency(paymentData.total) : ''} // Usamos 'total' en lugar de 'total_factura'
                        disabled
                        placeholder="Total"
                        className="pagos-input"
                    />
                    <input
                        type="text"
                        value={paymentData.pendiente ? formatCurrency(paymentData.pendiente) : ''} // Usamos 'pendiente' en lugar de 'valor_pendiente'
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
                        className={`pagos-input ${paymentData.estado === 'PAGADO' ? 'disabled' : ''}`}
                        disabled={paymentData.estado === 'PAGADO'}
                    />
                    {paymentData.estado === 'PAGADO' && (
                        <div className="pagos-status-message">
                            Este item ya se encuentra cancelado
                        </div>
                    )}
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
                        value={paymentData.valor_matricula || paymentData.valor_multa ?
                            formatCurrency(paymentData.valor_matricula || paymentData.valor_multa) : ''}
                        disabled
                        placeholder="Total"
                        className="pagos-input"
                    />
                    <input
                        type="text"
                        value={paymentData.valor_pendiente ? formatCurrency(paymentData.valor_pendiente) : ''}
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
                        className={`pagos-input ${paymentData.estado === 'PAGADO' ? 'disabled' : ''}`}
                        disabled={paymentData.estado === 'PAGADO'}
                    />
                    {paymentData.estado === 'PAGADO' && (
                        <div className="pagos-status-message">
                            Este item ya se encuentra cancelado
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="pagos-container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="pagos-card">
                <h2 className="pagos-title">Pagos</h2>
                <div className="pagos-form-grid">
                    <select
                        value={tipo}
                        onChange={(e) => {
                            setTipo(e.target.value);
                            setPaymentData({
                                total: '',
                                pendiente: '',
                                aCancelar: '',
                                idFactura: '',
                                lecturaAnterior: '',
                                lecturaActual: '',
                                fechaLecturaAnterior: '',
                                fechaLecturaActual: '',
                                estado: '',
                            });
                            setIdReferencia('');
                            setTipoPago('');
                        }}
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
                        disabled={loading || paymentData.estado === 'PAGADO'}
                    >
                        {loading ? 'Procesando...' : 'Guardar Pago'}
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
                                        <th>Tipo Pago</th>
                                        <th>Fecha</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historialData.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id_ingreso}</td>
                                            <td>{item.descripcion_ingreso}</td>
                                            <td>{item.tipo_pago || '-'}</td>
                                            <td>{item.fecha_ingreso}</td>
                                            <td>{formatCurrency(item.valor_ingreso)}</td>
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
                .pagos-status-message {
                    color: #e74c3c;
                    font-weight: bold;
                    margin-top: 8px;
                    text-align: center;
                    grid-column: 1 / -1;
                }
                
                .pagos-input.disabled {
                    background-color: #f5f5f5;
                    cursor: not-allowed;
                    opacity: 0.7;
                }
            `}</style>
        </div>
    );
};

export default PagosPage;