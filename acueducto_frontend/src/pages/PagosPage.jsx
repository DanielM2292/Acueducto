import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PagosPage = () => {
    const name = localStorage.getItem("userName");
    const API_BASE_URL = "http://localhost:9090";

    const [tipo, setTipo] = useState('Factura');
    const [tipoPago, setTipoPago] = useState('');
    const [tarifa, setTarifa] = useState('Estandar');
    const [showHistorial, setShowHistorial] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [idReferencia, setIdReferencia] = useState('');
    const [loading, setLoading] = useState(false);
    const [historialData, setHistorialData] = useState([]);
    const [filteredHistorialData, setFilteredHistorialData] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('2025'); // Año actual por defecto
    const [selectedMonth, setSelectedMonth] = useState('2'); // Mes actual por defecto (Marzo es 2)
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
        total_factura: '',
        valor_pendiente: '',
        valor_matricula: '',
        valor_multa: ''
    });

    // Generar años desde 2020 hasta el año actual (2025)
    const years = Array.from({ length: 6 }, (_, i) => 2025 + i);

    const months = [
        { value: '0', label: 'Enero' },
        { value: '1', label: 'Febrero' },
        { value: '2', label: 'Marzo' },
        { value: '3', label: 'Abril' },
        { value: '4', label: 'Mayo' },
        { value: '5', label: 'Junio' },
        { value: '6', label: 'Julio' },
        { value: '7', label: 'Agosto' },
        { value: '8', label: 'Septiembre' },
        { value: '9', label: 'Octubre' },
        { value: '10', label: 'Noviembre' },
        { value: '11', label: 'Diciembre' }
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    useEffect(() => {
        fetchHistorial();
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, []);

    useEffect(() => {
        filterHistorial();
    }, [searchTerm, selectedYear, selectedMonth, historialData]);

    const filterHistorial = () => {
        let filteredData = [...historialData];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredData = filteredData.filter(item =>
                item.id_ingreso.toString().includes(searchLower) ||
                item.descripcion_ingreso.toLowerCase().includes(searchLower) ||
                (item.tipo_pago && item.tipo_pago.toLowerCase().includes(searchLower))
            );
        }

        if (selectedYear) {
            filteredData = filteredData.filter(item =>
                new Date(item.fecha_ingreso).getFullYear().toString() === selectedYear
            );
        }

        if (selectedMonth) {
            filteredData = filteredData.filter(item =>
                new Date(item.fecha_ingreso).getMonth().toString() === selectedMonth
            );
        }

        setFilteredHistorialData(filteredData);
    };

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
                estado: '',
                total_factura: '',
                valor_pendiente: '',
                valor_matricula: '',
                valor_multa: ''
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

            setTipoPago('');
            setPaymentData(prev => ({
                ...prev,
                total_factura: data.total_factura,
                valor_matricula: data.valor_matricula,
                valor_multa: data.valor_multa,
                valor_pendiente: data.valor_pendiente,
                aCancelar: data.estado === 'PAGADO' ? '' : data.valor_pendiente,
                estado: data.estado,
                total: '',
                pendiente: ''
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
            setFilteredHistorialData(data);
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

        const valorPendienteToCheck = tipo === 'Factura' && tipoPago ?
            paymentData.pendiente : paymentData.valor_pendiente;

        if (parseFloat(paymentData.aCancelar) > parseFloat(valorPendienteToCheck)) {
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
                nombre_usuario: name,
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
                method: "POST",
                credentials: 'include',
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
                estado: '',
                total_factura: '',
                valor_pendiente: '',
                valor_matricula: '',
                valor_multa: ''
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

        if (selectedTipoPago === 'Mensual') {
            totalCalculated = parseFloat(paymentData.total_factura) || 0;
            pendienteCalculated = parseFloat(paymentData.valor_pendiente) || 0;
        } else if (selectedTipoPago === 'Semestral') {
            totalCalculated = (parseFloat(paymentData.total_factura) || 0) * 6;
            pendienteCalculated = (parseFloat(paymentData.valor_pendiente) || 0) * 6;
        } else if (selectedTipoPago === 'Anual') {
            totalCalculated = (parseFloat(paymentData.total_factura) || 0) * 12;
            pendienteCalculated = (parseFloat(paymentData.valor_pendiente) || 0) * 12;
        }

        setPaymentData(prev => ({
            ...prev,
            total: totalCalculated,
            pendiente: pendienteCalculated,
            aCancelar: pendienteCalculated
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
                        disabled={paymentData.estado === 'PAGADO' || !paymentData.total_factura}
                    >
                        <option value="">Seleccione el tipo de pago (por tiempo)</option>
                        <option value="Mensual">Mensual</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                    </select>
                    <input
                        type="text"
                        value={tipoPago && paymentData.total ? formatCurrency(paymentData.total) :
                            paymentData.total_factura ? formatCurrency(paymentData.total_factura) : ''}
                        disabled
                        placeholder="Total"
                        className="pagos-input"
                    />
                    <input
                        type="text"
                        value={tipoPago && paymentData.pendiente ? formatCurrency(paymentData.pendiente) :
                            paymentData.valor_pendiente ? formatCurrency(paymentData.valor_pendiente) : ''}
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
                                total_factura: '',
                                valor_pendiente: '',
                                valor_matricula: '',
                                valor_multa: ''
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
                        disabled={loading || paymentData.estado === 'PAGADO' || (tipo === 'Factura' && !tipoPago)}
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
                        <div className="pagos-filter-container">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pagos-input search-input"
                            />
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="pagos-select"
                            >
                                <option value="">Seleccionar Año</option>
                                {years.map(year => (
                                    <option key={year} value={year.toString()}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="pagos-select"
                            >
                                <option value="">Seleccionar Mes</option>
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                                    {filteredHistorialData.map((item) => (
                                        <tr key={item.id_ingreso}>
                                            <td>{item.id_ingreso}</td>
                                            <td>{item.descripcion_ingreso}</td>
                                            <td>{item.tipo_pago || '-'}</td>
                                            <td>{formatDate(item.fecha_ingreso)}</td>
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

                .pagos-modal {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 1000px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                }

                .pagos-filter-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                }

                .pagos-table-container {
                    max-height: calc(80vh - 200px); /* Ajusta este valor según necesites */
                    overflow-y: auto;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                }

                /* Estilos personalizados para el scrollbar del contenedor */
                .pagos-table-container::-webkit-scrollbar {
                    width: 8px;
                }

                .pagos-table-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }

                .pagos-table-container::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 4px;
                }

                .pagos-table-container::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }

                .pagos-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .pagos-table th {
                    position: sticky;
                    top: 0;
                    background-color: #f8f9fa;
                    z-index: 1;
                    font-weight: 600;
                    padding: 12px;
                    text-align: left;
                    border-bottom: 2px solid #dee2e6;
                }

                .pagos-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #dee2e6;
                }

                .pagos-table tbody tr:hover {
                    background-color: #f5f5f5;
                }

                .pagos-button-close {
                    margin-top: 20px;
                }

                @media (max-width: 768px) {
                    .pagos-filter-container {
                        grid-template-columns: 1fr;
                    }

                    .pagos-modal {
                        width: 95%;
                        margin: 10px;
                        padding: 15px;
                    }

                    .pagos-table-container {
                        max-height: calc(90vh - 250px); /* Ajuste para móviles */
                    }
                }
            `}</style>
        </div>
    );
};

export default PagosPage;