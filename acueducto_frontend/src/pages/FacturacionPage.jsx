import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import LogoAcueducto from '../imagenes/LogoAcueducto.png';

const FacturacionPage = () => {
    const [facturaData, setFacturaData] = useState({
        identificacion: '',
        usuario: '',
        barrio: '',
        MatriculaCliente: '',
        fechaInicioCobro: '',
        fechaVencimiento: '',
        lecturaAnterior: '',
        lecturaActual: '',
        precioUnitario: '',
        multas: '',
        saldoPendiente: '',
        observacion: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [invoicesGenerated, setInvoicesGenerated] = useState(false); // Track if invoices are generated

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFacturaData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 2
        }).format(value);
    };

    const crearFactura = async () => {
        try {
            const response = await fetch('http://localhost:9090/createFactura', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(facturaData)
            });

            if (response.ok) {
                console.log('Factura creada:', facturaData);
            } else {
                console.error('Error al crear factura');
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
        }
    };

    const exportarPDF = async () => {
        const element = document.getElementById('factura');
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('factura.pdf');
    };

    const generarFacturasAutomaticas = async () => {
        setShowModal(true);
        try {
            const response = await fetch('http://localhost:9090/generarFacturasAutomaticas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Facturas automáticas generadas');
                setInvoicesGenerated(true); // Set invoices generated to true
            } else {
                console.error('Error al generar facturas automáticas');
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
        }, 300);
    };

    return (
        <div className="facturacion-container">
            <div className="facturacion-content">
                <div className="header-buttons">
                    <h1>Sistema de Facturación</h1>
                    <div className="button-group">
                        <button onClick={crearFactura} className="btn btn-primary">
                            Crear Factura
                        </button>
                        <button onClick={exportarPDF} className="btn btn-success">
                            Exportar a PDF
                        </button>
                        <button onClick={generarFacturasAutomaticas} className="btn btn-secondary">
                            Facturas Automáticas
                        </button>
                    </div>
                </div>

                <div id="factura" className="factura">
                    <div className="factura-header">
                        <div className="logo-section">
                            <img
                                src={LogoAcueducto}
                                alt="Logo Acueducto"
                                className="logo"
                            />
                            <div className="company-info">
                                <h2>JUNTA ADMINISTRA DE ACUEDUCTO Y ALCANTARILLADO</h2>
                                <p>NIT: 900.306.104-7</p>
                                <h3>AGUA PURA, VIDA SEGURA</h3>
                            </div>
                        </div>
                        <div className="factura-numero">
                            <p>FACTURA NO: {facturaData.idFactura || '-'}</p>
                        </div>
                    </div>

                    <div className="cliente-info">
                        <div className="info-group">
                            <div className="input-group">
                                <label>IDENTIFICACIÓN:</label>
                                <input
                                    type="text"
                                    name="identificacion"
                                    value={facturaData.identificacion}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>USUARIO:</label>
                                <input
                                    type="text"
                                    name="usuario"
                                    value={facturaData.usuario}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>FECHA INICIO DE COBRO:</label>
                                <input
                                    type="date"
                                    name="fechaInicioCobro"
                                    value={facturaData.fechaInicioCobro}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>LECTURA ANTERIOR:</label>
                                <input
                                    type="number"
                                    name="lecturaAnterior"
                                    value={facturaData.lecturaAnterior}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="info-group">
                            <div className="input-group">
                                <label>BARRIO:</label>
                                <input
                                    type="text"
                                    name="barrio"
                                    value={facturaData.barrio}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>MATRICULA N°:</label>
                                <input
                                    type="text"
                                    name="MatriculaCliente"
                                    value={facturaData.MatriculaCliente}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>FECHA DE VENCIMIENTO:</label>
                                <input
                                    type="date"
                                    name="fechaVencimiento"
                                    value={facturaData.fechaVencimiento}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>LECTURA ACTUAL:</label>
                                <input
                                    type="number"
                                    name="lecturaActual"
                                    value={facturaData.lecturaActual}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="factura-tabla">
                        <table>
                            <thead>
                                <tr>
                                    <th>DESCRIPCIÓN</th>
                                    <th>PRECIO UNITARIO</th>
                                    <th>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>PRECIO TARIFA MEDIDOR</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="precioUnitario"
                                            value={facturaData.precioUnitario}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                    <td>{formatCurrency(facturaData.precioUnitario || 0)}</td>
                                </tr>
                                <tr>
                                    <td>MULTAS</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="multas"
                                            value={facturaData.multas}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                    <td>{formatCurrency(facturaData.multas || 0)}</td>
                                </tr>
                                <tr>
                                    <td>SALDO PENDIENTE</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="saldoPendiente"
                                            value={facturaData.saldoPendiente}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                    <td>{formatCurrency(facturaData.saldoPendiente || 0)}</td>
                                </tr>
                                <tr>
                                    <td>OBSERVACIÓN</td>
                                    <td colSpan="2">
                                        <input
                                            type="text"
                                            name="observacion"
                                            value={facturaData.observacion}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="2">TOTAL A PAGAR</td>
                                    <td>
                                        {formatCurrency((parseFloat(facturaData.precioUnitario || 0) +
                                            parseFloat(facturaData.multas || 0) +
                                            parseFloat(facturaData.saldoPendiente || 0)).toFixed(2))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="comprobante">
                        <h4>COMPROBANTE DE PAGO</h4>
                        <div className="comprobante-grid">
                            <div className="comprobante-item">
                                <p className="label">USUARIO</p>
                                <p className="value">{facturaData.usuario || '-'}</p>
                            </div>
                            <div className="comprobante-item">
                                <p className="label">IDENTIFICACIÓN</p>
                                <p className="value">{facturaData.identificacion || '-'}</p>
                            </div>
                            <div className="comprobante-item">
                                <p className="label">BARRIO</p>
                                <p className="value">{facturaData.barrio || '-'}</p>
                            </div>
                            <div className="comprobante-item">
                                <p className="label">MATRICULA N°</p>
                                <p className="value">{facturaData.MatriculaCliente || '-'}</p>
                            </div>
                            <div className="comprobante-item">
                                <p className="label">TOTAL PAGADO</p>
                                <p className="value">{formatCurrency((parseFloat(facturaData.precioUnitario || 0) +
                                    parseFloat(facturaData.multas || 0) +
                                    parseFloat(facturaData.saldoPendiente || 0)).toFixed(2))}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
                    <div className={`modal ${isClosing ? 'closing' : ''}`}>
                        <h3 className="modal-title">Facturas Automáticas</h3>
                        <div className="modal-content">
                            <div id="factura-automatica" className="factura">
                                <div className="factura-header">
                                    <div className="logo-section">
                                        <img
                                            src={LogoAcueducto}
                                            alt="Logo Acueducto"
                                            className="logo"
                                        />
                                        <div className="company-info">
                                            <h2>JUNTA ADMINISTRA DE ACUEDUCTO Y ALCANTARILLADO</h2>
                                            <p>NIT: 900.306.104-7</p>
                                            <h3>AGUA PURA, VIDA SEGURA</h3>
                                        </div>
                                    </div>
                                    <div className="factura-numero">
                                        <p>FACTURA NO: {facturaData.idFactura || '-'}</p>
                                    </div>
                                </div>

                                <div className="cliente-info">
                                    <div className="info-group">
                                        <div className="input-group">
                                            <label>IDENTIFICACIÓN:</label>
                                            <input
                                                type="text"
                                                name="identificacion"
                                                value={facturaData.identificacion}
                                                onChange={handleInputChange}
                                                disabled
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>USUARIO:</label>
                                            <input
                                                type="text"
                                                name="usuario"
                                                value={facturaData.usuario}
                                                onChange={handleInputChange}
                                                disabled
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>FECHA INICIO DE COBRO:</label>
                                            <input
                                                type="date"
                                                name="fechaInicioCobro"
                                                value={facturaData.fechaInicioCobro}
                                                onChange={handleInputChange}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="info-group">
                                        <div className="input-group">
                                            <label>BARRIO:</label>
                                            <input
                                                type="text"
                                                name="barrio"
                                                value={facturaData.barrio}
                                                onChange={handleInputChange}
                                                disabled
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>MATRICULA N°</label>
                                            <input
                                                type="text"
                                                name="MatriculaCliente"
                                                value={facturaData.MatriculaCliente}
                                                onChange={handleInputChange}
                                                disabled
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>FECHA DE VENCIMIENTO:</label>
                                            <input
                                                type="date"
                                                name="fechaVencimiento"
                                                value={facturaData.fechaVencimiento}
                                                onChange={handleInputChange}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="factura-tabla">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>DESCRIPCIÓN</th>
                                                <th>PRECIO UNITARIO</th>
                                                <th>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>PRECIO TARIFA ESTANDAR</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        name="precioUnitario"
                                                        value={facturaData.precioUnitario}
                                                        onChange={handleInputChange}
                                                        disabled
                                                    />
                                                </td>
                                                <td>{formatCurrency(facturaData.precioUnitario || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td>MULTAS</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        name="multas"
                                                        value={facturaData.multas}
                                                        onChange={handleInputChange}
                                                        disabled
                                                    />
                                                </td>
                                                <td>{formatCurrency(facturaData.multas || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td>SALDO PENDIENTE</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        name="saldoPendiente"
                                                        value={facturaData.saldoPendiente}
                                                        onChange={handleInputChange}
                                                        disabled
                                                    />
                                                </td>
                                                <td>{formatCurrency(facturaData.saldoPendiente || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td>OBSERVACIÓN</td>
                                                <td colSpan="2">
                                                    <input
                                                        type="text"
                                                        name="observacion"
                                                        value={facturaData.observacion}
                                                        onChange={handleInputChange}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="2">TOTAL A PAGAR</td>
                                                <td>
                                                    {formatCurrency((parseFloat(facturaData.precioUnitario || 0) +
                                                        parseFloat(facturaData.multas || 0) +
                                                        parseFloat(facturaData.saldoPendiente || 0)).toFixed(2))}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="comprobante">
                                    <h4>COMPROBANTE DE PAGO</h4>
                                    <div className="comprobante-grid">
                                        <div className="comprobante-item">
                                            <p className="label">USUARIO</p>
                                            <p className="value">{facturaData.usuario || '-'}</p>
                                        </div>
                                        <div className="comprobante-item">
                                            <p className="label">IDENTIFICACIÓN</p>
                                            <p className="value">{facturaData.identificacion || '-'}</p>
                                        </div>
                                        <div className="comprobante-item">
                                            <p className="label">BARRIO</p>
                                            <p className="value">{facturaData.barrio || '-'}</p>
                                        </div>
                                        <div className="comprobante-item">
                                            <p className="label">MATRICULA N°</p>
                                            <p className="value">{facturaData.MatriculaCliente || '-'}</p>
                                        </div>
                                        <div className="comprobante-item">
                                            <p className="label">TOTAL PAGADO</p>
                                            <p className="value">
                                                {formatCurrency((parseFloat(facturaData.precioUnitario || 0) +
                                                    parseFloat(facturaData.multas || 0) +
                                                    parseFloat(facturaData.saldoPendiente || 0)).toFixed(2))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={generarFacturasAutomaticas} className="btn btn-primary">
                                Generar Facturas Automáticas
                            </button>
                            <button onClick={generarFacturasAutomaticas} className="btn btn-primary">
                                Guardar Facturas Automáticas
                            </button>
                            <button onClick={exportarPDF} className={`btn btn-success ${!invoicesGenerated ? 'disabled' : ''}`}>
                                Exportar a PDF
                            </button>
                            <button onClick={handleCloseModal} className="btn btn-secondary">
                                Cerrar
                            </button>
                        </div>
                        {invoicesGenerated && <p className="success-message">Facturas generadas correctamente.</p>}
                    </div>
                </div>
            )}
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    opacity: 1;
                    visibility: visible;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                }

                .modal {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    width: 70%;
                    max-width: 700px;
                    max-height: 80vh;
                    opacity: 1;
                    visibility: visible;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .modal-title {
                    margin-bottom: 20px;
                    font-size: 20px;
                    font-weight: bold;
                    text-align: center;
                    flex-shrink: 0;
                }

                .modal-content {
                    overflow-y: auto;
                    flex-grow: 1;
                    margin-bottom: 20px;
                    padding-right: 10px;
                }

                .modal-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    padding-top: 10px;
                    border-top: 1px solid #e0e0e0;
                    flex-shrink: 0;
                }

                .success-message {
                    color: green;
                    text-align: center;
                    margin-top: 10px;
                }

                /* Additional styles for disabled button */
                .disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                }

                /* Existing styles... */
            `}</style>
        </div>
    );
};

export default FacturacionPage;