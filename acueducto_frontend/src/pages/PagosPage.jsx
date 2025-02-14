import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PagosPage = () => {
    const API_BASE_URL = "http://localhost:9090";

    const [tipo, setTipo] = useState('Factura');
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
        try {
            const endpoints = {
                'Factura': `${API_BASE_URL}/facturas/obtener_factura?id_factura=${id}`,
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
            });
            setIdReferencia('');

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
                        value={paymentData.total ? formatCurrency(paymentData.total) : ''}
                        disabled
                        placeholder="Total"
                        className="pagos-input"
                    />
                    <input
                        type="text"
                        value={paymentData.pendiente ? formatCurrency(paymentData.pendiente) : ''}
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
                        className="pagos-input"
                    />
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
                            // Limpiar el formulario al cambiar el tipo
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
                        disabled={loading}
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
                                        <th>Fecha</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historialData.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id_ingreso}</td>
                                            <td>{item.descripcion_ingreso}</td>
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
        </div>
    );
};

export default PagosPage;