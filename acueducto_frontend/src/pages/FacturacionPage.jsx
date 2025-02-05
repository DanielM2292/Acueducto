import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import LogoAcueducto from '../imagenes/LogoAcueducto.png';

const FacturacionPage = () => {
    const [facturaData, setFacturaData] = useState({
        identificacion: '',
        usuario: '',
        barrio: '',
        tipoTarifa: '',
        fechaInicioCobro: '',
        fechaVencimiento: '',
        lecturaAnterior: '',
        lecturaActual: '',
        precioUnitario: '',
        multas: '',
        saldoPendiente: '',
        observacion: ''
    });

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

    const crearFactura = () => {
        console.log('Factura creada:', facturaData);
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

    const generarFacturasAutomaticas = () => {
        console.log('Generando facturas automáticas...');
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
                            <p>FACTURA NO: _________</p>
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
                                <label>TIPO DE TARIFA:</label>
                                <input
                                    type="text"
                                    name="tipoTarifa"
                                    value={facturaData.tipoTarifa}
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
                                <p className="label">TIPO DE TARIFA</p>
                                <p className="value">{facturaData.tipoTarifa || '-'}</p>
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
        </div>
    );
};

export default FacturacionPage;
