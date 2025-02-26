import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2canvas from 'html2canvas';
import LogoAcueducto from '../imagenes/LogoAcueducto.png';

const TARIFA_BASE = 7000;
const LIMITE_BASE = 20;
const PRECIO_ADICIONAL_POR_METRO = 500;

const FacturacionPage = () => {
    const [facturaData, setFacturaData] = useState({
        identificacion: '',
        nombre: '',
        barrio: '',
        numeroMatricula: '',
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
    const [invoicesGenerated, setInvoicesGenerated] = useState(false);
    const [showFacturasModal, setShowFacturasModal] = useState(false);
    const [facturas, setFacturas] = useState([]);
    const [isFacturasClosing, setIsFacturasClosing] = useState(false);
    const [matriculasTAM, setMatriculasTAM] = useState([]);
    const [numeroFactura, setNumeroFactura] = useState(1);
    const [numeroMatriculaInput, setNumeroMatriculaInput] = useState("");

    const abrirModalFacturasAutomaticas = () => {
        setShowModal(true);
    };

    const abrirModalFacturas = () => {
        setShowFacturasModal(true);
    };

    useEffect(() => {
        if (numeroMatriculaInput.length >= 4) {
            buscarDatosPorMatricula(numeroMatriculaInput);
        }
    }, [numeroMatriculaInput]); // Se ejecuta cuando cambia numeroMatriculaInput

    const buscarFactura = async () => {
        if (!numeroFactura) {
            toast.warning("Ingrese un número de factura");
            return;
        }

        try {
            const response = await fetch(`http://localhost:9090/facturas/buscar_factura?id_factura=${numeroFactura}`);
            if (response.ok) {
                const factura = await response.json();

                // Si la factura es de medidor, mostrar en la pantalla principal
                if (factura.id_tarifa_medidor !== null) {
                    setFacturaData(factura);
                }
                // Si la factura es estándar, mostrar en la ventana emergente
                else if (factura.id_tarifa_estandar !== null) {
                    setFacturas([factura]);
                    setShowModal(true);
                }

                toast.success("Factura encontrada");
            } else {
                toast.error("No se encontró la factura");
            }
        } catch (error) {
            toast.error("Error al buscar la factura");
            console.error("Error:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFacturaData(prev => ({
            ...prev,
            [name]: value || '' // Asegurar que no se asigna undefined
        }));
    };

    const calcularValores = (lecturaActual) => {
        const lecturaAnterior = parseFloat(facturaData.lecturaAnterior || 0);
        const consumo = lecturaActual - lecturaAnterior;

        let precioUnitario = TARIFA_BASE;

        if (consumo > LIMITE_BASE) {
            const exceso = consumo - LIMITE_BASE;
            precioUnitario += exceso * PRECIO_ADICIONAL_POR_METRO;
        }

        return precioUnitario;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(value);
    };

    const crearFactura = async () => {
        if (!facturaData.numeroMatricula) {
            toast.warning("No hay matrícula seleccionada para crear factura");
            return;
        }

        const { saldoPendiente } = calcularValores();
        const nuevaFactura = {
            ...facturaData,
            saldoPendiente,
            numeroFactura
        };

        try {
            const response = await fetch('http://localhost:9090/facturas/crear_factura', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaFactura)
            });

            if (response.ok) {
                toast.success('Factura creada exitosamente');
                setFacturaData(nuevaFactura);
            } else {
                toast.error('Error al crear la factura');
            }
        } catch (error) {
            toast.error('Error de conexión con el servidor');
        }
    };

    const exportarPDF = async () => {
        try {
            const element = document.getElementById('factura');
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF();
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const fecha = new Date();
            const mes = fecha.toLocaleString('es-ES', { month: 'long' });
            const numeroMatricula = facturaData.numeroMatricula || 'sin_matricula';

            pdf.save(`factura Matricula N°${numeroMatricula} del mes de ${mes}.pdf`);
            toast.success('PDF exportado exitosamente');

            // Reiniciar el formulario después de la exportación
            setFacturaData({
                identificacion: '',
                nombre: '',
                barrio: '',
                numeroMatricula: '',
                fechaInicioCobro: '',
                fechaVencimiento: '',
                lecturaAnterior: '',
                lecturaActual: '',
                precioUnitario: TARIFA_BASE,
                multas: '',
                saldoPendiente: '',
                observacion: ''
            });

        } catch (error) {
            toast.error('Error al exportar el PDF');
        }
    };
    // Método mejorado para generar facturas automáticas
    const generarFacturasAutomaticas = async () => {
        try {
            const response = await fetch('http://localhost:9090/facturas/generarFacturasAutomaticas', {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del backend:', errorData.message);
                throw new Error('Error al generar facturas');
            }

            const { facturas } = await response.json();
            console.log(facturas)
            if (!facturas || facturas.length === 0) {
                toast.info('No hay facturas para generar');
                return;
            }

            // Llenar los inputs con los datos de la primera factura
            const primeraFactura = facturas[0];
            setFacturaData({
                identificacion: primeraFactura.numero_documento,
                nombre: primeraFactura.nombre,
                barrio: primeraFactura.direccion,
                numeroMatricula: primeraFactura.id_matricula_cliente,
                fechaVencimiento: primeraFactura.fecha_vencimiento,
                valorPendiente: primeraFactura.valor_pendiente,
                // Agrega otros campos según sea necesario
            });

            setFacturas(facturas);
            setInvoicesGenerated(true);

            // Generar el PDF con todas las facturas
            await exportarFacturasPDF(facturas);
            toast.success(`Se generaron ${facturas.length} facturas automáticamente`);
        } catch (error) {
            toast.error('Error al generar facturas automáticas');
            console.error('Error:', error);
        }
    };
    // Método mejorado para exportar múltiples facturas a PDF
    const exportarFacturasPDF = async (facturasParaExportar) => {
        try {
            const pdf = new jsPDF();
            let firstPage = true;

            // Crear un elemento oculto para renderizar cada factura
            const hiddenDiv = document.createElement('div');
            hiddenDiv.id = 'factura-temp';
            hiddenDiv.style.position = 'absolute';
            hiddenDiv.style.left = '-9999px';
            document.body.appendChild(hiddenDiv);

            for (let i = 0; i < facturasParaExportar.length; i++) {
                const factura = facturasParaExportar[i];
                console.log(factura); // Cambiado para mostrar la factura completa

                // Renderizar la factura en el div oculto
                hiddenDiv.innerHTML = `
                <div id="factura-automatica-${i}" class="factura">
                    <div class="factura-header">
                        <div class="modal-content">
                            <div class="factura-header">
                                <div class="logo-section">
                                    <img
                                        src="${LogoAcueducto}"
                                        alt="Logo Acueducto"
                                        class="logo"
                                    />
                                    <div class="company-info">
                                        <h2>JUNTA ADMINISTRA DE ACUEDUCTO Y ALCANTARILLADO</h2>
                                        <p>NIT: 900.306.104-7</p>
                                        <h3>AGUA PURA, VIDA SEGURA</h3>
                                    </div>
                                </div>
                                <div class="factura-numero">
                                    <p>FACTURA N°: ${factura.id_factura}</p>
                                </div>
                            </div>
                            <div class="cliente-info">
                                <div class="info-group">
                                    <div class="input-group">
                                        <label>IDENTIFICACIÓN:</label>
                                        <input
                                            type="text"
                                            name="identificacion"
                                            value="${factura.numero_documento || ''}"
                                            readOnly
                                        />
                                    </div>
                                    <div class="input-group">
                                        <label>USUARIO:</label>
                                        <input
                                            type="text"
                                            name="usuario"
                                            value="${factura.nombre_cliente || ''}"
                                            readOnly
                                        />
                                    </div>
                                    <div class="input-group">
                                        <label>FECHA INICIO DE COBRO:</label>
                                        <input
                                            type="date"
                                            name="fechaInicioCobro"
                                            value="${factura.fecha_inicio || ''}"
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div class="info-group">
                                    <div class="input-group">
                                        <label>BARRIO:</label>
                                        <input
                                            type="text"
                                            name="barrio"
                                            value="${factura.direccion || ''}"
                                            readOnly
                                        />
                                    </div>
                                    <div class="input-group">
                                        <label>MATRICULA N°</label>
                                        <input
                                            type="text"
                                            name="MatriculaCliente"
                                            value="${factura.numero_matricula || ''}"
                                            readOnly
                                        />
                                    </div>
                                    <div class="input-group">
                                        <label>FECHA DE VENCIMIENTO:</label>
                                        <input
                                            type="date"
                                            name="fechaVencimiento"
                                            value="${factura.fecha_vencimiento || ''}"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="factura-tabla">
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
                                                    value="${factura.valor_pendiente || 0}"
                                                    readOnly
                                                />
                                            </td>
                                            <td>${formatCurrency(factura.valor_pendiente || 0)}</td>
                                        </tr>
                                        <tr>
                                            <td>MULTAS</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    name="multas"
                                                    value="${factura.multas || 0}"
                                                    readOnly
                                                />
                                            </td>
                                            <td>${formatCurrency(factura.multas || 0)}</td>
                                        </tr>
                                        <tr>
                                            <td>SALDO PENDIENTE</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    name="saldoPendiente"
                                                    value="${factura.valor_pendiente || 0}"
                                                    readOnly
                                                />
                                            </td>
                                            <td>${formatCurrency(factura.valor_pendiente || 0)}</td>
                                        </tr>
                                        <tr>
                                            <td>OBSERVACIÓN</td>
                                            <td colSpan="2">
                                                <input
                                                    type="text"
                                                    name="observacion"
                                                    value="${factura.observacion || ''}"
                                                    readOnly
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="2">TOTAL A PAGAR</td>
                                            <td>
                                                ${formatCurrency((parseFloat(factura.valor_pendiente || 0) +
                    parseFloat(factura.multas || 0)).toFixed(2))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div class="comprobante">
                                <h4>COMPROBANTE DE PAGO</h4>
                                <div class="comprobante-grid">
                                    <div class="comprobante-item">
                                        <p class="label">USUARIO</p>
                                        <p class="value">${factura.nombre_cliente || '-'}</p>
                                    </div>
                                    <div class="comprobante-item">
                                        <p class="label">IDENTIFICACIÓN</p>
                                        <p class="value">${factura.numero_documento || '-'}</p>
                                    </div>
                                    <div class="comprobante-item">
                                        <p class="label">BARRIO</p>
                                        <p class="value">${factura.direccion || '-'}</p>
                                    </div>
                                    <div class="comprobante-item">
                                        <p class="label">MATRICULA N°</p>
                                        <p class="value">${factura.numero_matricula || '-'}</p>
                                    </div>
                                    <div class="comprobante-item">
                                        <p class="label">TOTAL PAGADO</p>
                                        <p class="value">
                                            ${formatCurrency((parseFloat(factura.valor_pendiente || 0) +
                        parseFloat(factura.multas || 0)).toFixed(2))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

                // Esperar un momento para que el DOM se actualice
                await new Promise(resolve => setTimeout(resolve, 300));

                const element = document.getElementById(`factura-automatica-${i}`);
                if (!element) {
                    console.error('Elemento de factura no encontrado');
                    continue;
                }

                const canvas = await html2canvas(element, {
                    scale: 2,
                    logging: false,
                    useCORS: true
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const imgWidth = pdf.internal.pageSize.getWidth();
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (!firstPage) {
                    pdf.addPage(); // Agregar una nueva página para cada factura
                }
                firstPage = false;

                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            }

            // Eliminar el div temporal
            document.body.removeChild(hiddenDiv);

            // Guardar el PDF
            const fecha = new Date();
            const mes = fecha.toLocaleString('es-ES', { month: 'long' });
            const año = fecha.getFullYear();
            pdf.save(`facturas_automaticas_${mes}_${año}.pdf`);
            toast.success('PDF generado exitosamente');
        } catch (error) {
            toast.error('Error al generar el PDF');
            console.error('Error:', error);
        }
    };
    const obtenerFacturas = async () => {
        try {
            const response = await fetch('http://localhost:9090/facturas/listar_facturas');
            if (response.ok) {
                const data = await response.json();
                setFacturas(data);
                toast.success('Facturas cargadas exitosamente');
            } else {
                toast.error('Error al obtener las facturas');
            }
        } catch (error) {
            toast.error('Error de conexión con el servidor');
            console.error('Error:', error);
        }
    };

    const buscarDatosPorMatricula = async (numeroMatricula) => {
        if (!numeroMatricula.trim()) {
            toast.warning("Ingrese un número de matrícula");
            return;
        }

        try {
            const response = await fetch(`http://localhost:9090/matriculas/buscar_numero_matricula?numero_matricula=${numeroMatricula}`);
            if (!response.ok) throw new Error("No se encontró la matrícula");

            const data = await response.json();

            if (!data || typeof data !== "object") {
                toast.warning("No hay datos para esta matrícula");
                return;
            }

            console.log("Datos recibidos del backend:", data); // Para depuración

            setFacturaData(prev => ({
                ...prev,
                identificacion: data.numero_documento ?? prev.identificacion ?? '',
                nombre: data.nombre ?? prev.nombre ?? '',
                barrio: data.direccion ?? prev.barrio ?? '',
                fechaInicioCobro: data.fecha_creacion ?? prev.fechaInicioCobro ?? '',
                numeroMatricula: data.numero_matricula ?? prev.numeroMatricula ?? '',
                lecturaAnterior: data.lectura_anterior ?? prev.lecturaAnterior ?? '0',
                multas: data.total_multas ?? prev.multas ?? '0',
                saldoPendiente: data.saldo_pendiente ?? prev.saldoPendiente ?? '0',
                observacion: data.observacion ?? prev.observacion ?? '',
            }));

            setNumeroMatriculaInput(data.numero_matricula ?? prev.numeroMatricula ?? '');

            toast.success("Datos de la matrícula cargados exitosamente");

        } catch (error) {
            toast.error("Error al buscar la matrícula");
        }
    };

    const handleCloseFacturasModal = () => {
        setIsFacturasClosing(true);
        setTimeout(() => {
            setShowFacturasModal(false);
            setIsFacturasClosing(false);
        }, 300);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
        }, 300);
    };

    useEffect(() => {
        obtenerFacturas();
    }, []);

    return (
        <div className="facturacion-container">
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
            <div className="facturacion-content">
                <div className="header-buttons">
                    <input
                        type="text"
                        value={numeroFactura}
                        onChange={(e) => setNumeroFactura(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && buscarFactura()}
                        className="factura-input"
                        placeholder="Número de Factura"
                    />
                    <button onClick={crearFactura} className="btn btn-success">Grabar</button>
                    <button onClick={exportarPDF} className="btn btn-success">Exportar a PDF</button>
                    <button onClick={abrirModalFacturasAutomaticas} className="btn btn-secondary">
                        Facturas Automáticas
                    </button>
                    <button onClick={abrirModalFacturas} className="btn btn-info">
                        Mostrar Facturas
                    </button>
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
                            <p>FACTURA N°: {numeroFactura}</p>
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
                                    value={facturaData.nombre}
                                    onChange={handleInputChange}
                                    readOnly
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
                                    readOnly
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
                                    readOnly
                                />
                            </div>
                            <div className="input-group">
                                <label>MATRICULA N°:</label>
                                <input
                                    type="text"
                                    name="numeroMatricula"
                                    value={numeroMatriculaInput || ''}
                                    onChange={(e) => setNumeroMatriculaInput(e.target.value)}
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
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                name="precioUnitario"
                                                value={facturaData.precioUnitario}
                                                readOnly
                                            />
                                        </div>
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
                                            readOnly
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
                                <p className="value">{facturaData.nombre || '-'}</p>
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
                                <p className="value">{facturaData.numeroMatricula || '-'}</p>
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
            {showFacturasModal && (
                <div className={`modal-overlay ${isFacturasClosing ? 'closing' : ''}`}>
                    <div className={`modal modal-large ${isFacturasClosing ? 'closing' : ''}`}>
                        <h3 className="modal-title">Lista de Facturas</h3>
                        <div className="modal-content">
                            <div className="table-container">
                                <table className="facturas-table">
                                    <thead>
                                        <tr>
                                            <th>N° Factura</th>
                                            <th>Fecha</th>
                                            <th>Usuario</th>
                                            <th>Identificación</th>
                                            <th>Barrio</th>
                                            <th>Matrícula</th>
                                            <th>Valor Total</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {facturas.map((factura, index) => (
                                            <tr key={index}>
                                                <td>{factura.id_factura}</td>
                                                <td>{new Date(factura.fecha_factura).toLocaleDateString()}</td>
                                                <td>{factura.nombre}</td>
                                                <td>{factura.numero_documento}</td>
                                                <td>{factura.direccion}</td>
                                                <td>{factura.id_matricula}</td>
                                                <td>{formatCurrency(factura.tarifa_definida)}</td>
                                                <td>{factura.descripcion_estado_factura}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleCloseFacturasModal} className="btn btn-secondary">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                                        <p>FACTURA N°: {numeroFactura}</p>
                                    </div>
                                </div>
                                <div className="cliente-info">
                                    <div className="info-group">
                                        <div className="input-group">
                                            <label>IDENTIFICACIÓN:</label>
                                            <input
                                                type="text"
                                                name="identificacion"
                                                value={facturaData.identificacion || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>USUARIO:</label>
                                            <input
                                                type="text"
                                                name="usuario"
                                                value={facturaData.usuario || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>FECHA INICIO DE COBRO:</label>
                                            <input
                                                type="date"
                                                name="fechaInicioCobro"
                                                value={facturaData.fechaInicioCobro}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="info-group">
                                        <div className="input-group">
                                            <label>BARRIO:</label>
                                            <input
                                                type="text"
                                                name="barrio"
                                                value={facturaData.barrio || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>MATRICULA N°</label>
                                            <input
                                                type="text"
                                                name="MatriculaCliente"
                                                value={facturaData.numeroMatricula}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>FECHA DE VENCIMIENTO:</label>
                                            <input
                                                type="date"
                                                name="fechaVencimiento"
                                                value={facturaData.fechaVencimiento}
                                                readOnly
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
                                                        readOnly
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
                                                        readOnly
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
                                                        readOnly
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
                                                        readOnly
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
                                            <p className="value">{facturaData.nombre || '-'}</p>
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
                                            <p className="value">{facturaData.numeroMatricula || '-'}</p>
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
                            <button onClick={exportarFacturasPDF} className="btn btn-primary">
                                Exportar Factura Automática
                            </button>
                            <button onClick={generarFacturasAutomaticas} className="btn btn-primary">
                                Generar Facturas Automáticas
                            </button>
                            <button className="btn btn-secondary" onClick={handleCloseModal}>
                                Cerrar
                            </button>
                        </div>
                        {invoicesGenerated && <p className="success-message">Facturas generadas correctamente.</p>}
                    </div>
                    {showFacturasModal && (
                        <div className={`modal-overlay ${isFacturasClosing ? 'closing' : ''}`}>
                            <div className={`modal modal-large ${isFacturasClosing ? 'closing' : ''}`}>
                                <h3 className="modal-title">Lista de Facturas</h3>
                                <div className="modal-content">
                                    <div className="table-container">
                                        <table className="facturas-table">
                                            <thead>
                                                <tr>
                                                    <th>N° Factura</th>
                                                    <th>Fecha</th>
                                                    <th>Usuario</th>
                                                    <th>Identificación</th>
                                                    <th>Barrio</th>
                                                    <th>Matrícula</th>
                                                    <th>Valor Total</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {facturas.map((factura, index) => (
                                                    <tr key={index}>
                                                        <td>{factura.numero_factura}</td>
                                                        <td>{new Date(factura.fecha_creacion).toLocaleDateString()}</td>
                                                        <td>{factura.usuario}</td>
                                                        <td>{factura.identificacion}</td>
                                                        <td>{factura.barrio}</td>
                                                        <td>{factura.matricula_cliente}</td>
                                                        <td>{formatCurrency(factura.valor_total)}</td>
                                                        <td>{factura.estado}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="modal-buttons">
                                    <button onClick={handleCloseFacturasModal} className="btn btn-secondary">
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                    .factura-numero {
                    background-color: #f8f9fa;
                    padding: 10px 20px;
                    border-radius: 5px;
                    border: 1px solid #dee2e6;
                    margin-left: auto;
                }

                .factura-numero p {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #0056b3;
                }

                /* Additional styles for disabled button */
                .disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                }

                .modal-large {
                    width: 90% !important;
                    max-width: 1200px !important;
                }

                .table-container {
                    overflow-x: auto;
                    margin-bottom: 1rem;
                }

                .facturas-table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: white;
                }

                .facturas-table th,
                .facturas-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e2e8f0;
                }

                .facturas-table th {
                    background-color: #53D4FF;
                    color: white;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .facturas-table tbody tr:hover {
                    background-color: #f7fafc;
                }

                .btn-info {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .btn-info:hover {
                    background-color: #2980b9;
                }
                .select-input {
                    width: 100%;
                    padding: 0.5rem;
                    margin-top: 4px;
                    border: 1px solid #dee2e6;
                    border-radius: 0.375rem;
                    background-color: white;
                    font-size: 1rem;
                }

                .factura-input{
                    width: 30%;
                    padding: 0.5rem;
                    margin-top: 4px;
                    border: 1px solid #dee2e6;
                    border-radius: 0.375rem;
                }
                .select-input:focus {
                    outline: none;
                    border-color: #0CB7F2;
                    box-shadow: 0 0 0 2px rgba(12, 183, 242, 0.2);
                }

                /* Responsive styles */
                @media (max-width: 768px) {
                    .button-group {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .button-group button {
                        width: 100%;
                    }

                    .modal-large {
                        width: 95% !important;
                        margin: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default FacturacionPage;