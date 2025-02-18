import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2canvas from 'html2canvas';
import LogoAcueducto from '../imagenes/LogoAcueducto.png';

const FacturacionPage = () => {
    const [facturaData, setFacturaData] = useState({
        identificacion: '',
        nombre: '',
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
    const [invoicesGenerated, setInvoicesGenerated] = useState(false);
    const [numeroFactura, setNumeroFactura] = useState('0001');
    const [showFacturasModal, setShowFacturasModal] = useState(false);
    const [facturas, setFacturas] = useState([]);
    const [isFacturasClosing, setIsFacturasClosing] = useState(false);
    const [matriculasTAM, setMatriculasTAM] = useState([]);


    useEffect(() => {
        obtenerUltimoNumeroFactura();
    }, []);

    const abrirModalFacturasAutomaticas = () => {
        setShowModal(true);
    };

    useEffect(() => {
        if (facturaData.identificacion) {
            obtenerDatosCliente(facturaData.identificacion);
        }
    }, [facturaData.identificacion]);

    const obtenerDatosCliente = async (identificacion) => {
        try {
            // Agrega un delay de 1 segundo
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await fetch(`http://localhost:9090/clientes/obtener_cliente?numero_documento=${identificacion}`);
            if (response.ok) {
                const cliente = await response.json();

                // Agrega otro delay de 1 segundo antes de obtener las matrículas
                await new Promise(resolve => setTimeout(resolve, 1000));

                const responseMatriculas = await fetch(`http://localhost:9090/matriculas/obtener_matriculas_tam?numero_documento=${identificacion}`);
                if (responseMatriculas.ok) {
                    const matriculas = await responseMatriculas.json();
                    console.log('matriculas recibidas', matriculas)
                    setMatriculasTAM(matriculas);

                    if (matriculas.length > 0) {
                        setFacturaData(prev => ({
                            ...prev,
                            nombre: cliente.nombre,
                            barrio: matriculas[0].direccion
                        }));
                        toast.success('Datos del cliente cargados exitosamente');
                    } else {
                        toast.warning('El cliente no tiene matrículas con tarifa TAM');
                    }
                } else {
                    toast.error('Error al obtener datos de las matrículas');
                }
            } else {
                setFacturaData(prev => ({
                    ...prev,
                    nombre: '',
                    MatriculaCliente: '',
                    barrio: ''
                }));
                setMatriculasTAM([]);
                toast.error('No se encontró el cliente');
            }
        } catch (error) {
            toast.error('Error al obtener datos del cliente');
            console.error('Error:', error);
        }
    };


    const obtenerTarifas = async () => {
        try {
            const response = await fetch('http://localhost:9090/tarifas/listar_tarifas');
            if (response.ok) {
                const data = await response.json();
                // Filtra solo las tarifas que comienzan con TAM
                const tarifasFiltradas = data.filter(tarifa => tarifa.id_tarifa.startsWith('TAM'));
                setTarifas(tarifasFiltradas);
            } else {
                toast.error('Error al obtener las tarifas');
            }
        } catch (error) {
            toast.error('Error de conexión al obtener tarifas');
            console.error('Error:', error);
        }
    };

    const buscarFactura = async () => {
        if (!numeroFactura.trim()) {
            toast.warning("Ingrese un número de factura");
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:9090/facturas/buscar_factura?id_factura=${numeroFactura}`);
            if (response.ok) {
                const factura = await response.json();
    
                // Si la factura es de medidor, mostrar en la pantalla principal
                if (factura.tipo_tarifa === "Medidor") {
                    setFacturaData(factura);
                }
                // Si la factura es estándar, mostrar en la ventana emergente
                else if (factura.tipo_tarifa === "Estandar") {
                    setFacturas([factura]);
                    setShowFacturasModal(true);
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
    
    useEffect(() => {
        obtenerUltimoNumeroFactura();
    }, []);
    
    const obtenerUltimoNumeroFactura = async () => {
        try {
            const response = await fetch('http://localhost:9090/facturas/ultimo_numero');
            if (response.ok) {
                const data = await response.json();
                const ultimoNumero = parseInt(data.ultimo_numero || '0');
                const siguienteNumero = (ultimoNumero + 1).toString().padStart(4, '0');
                setNumeroFactura(siguienteNumero);
            }
        } catch (error) {
            toast.error('Error al obtener el último número de factura');
            console.error('Error:', error);
        }
    };    

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
            const facturaCompleta = {
                ...facturaData,
                numeroFactura
            };

            const response = await fetch('http://localhost:9090/facturas/crear_factura', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(facturaCompleta)
            });

            if (response.ok) {
                toast.success('Factura creada exitosamente');
                const siguienteNumero = (parseInt(numeroFactura) + 1).toString().padStart(4, '0');
                setNumeroFactura(siguienteNumero);
            } else {
                toast.error('Error al crear la factura');
            }
        } catch (error) {
            toast.error('Error de conexión con el servidor');
            console.error('Error:', error);
        }
    };

    const exportarPDF = async () => {
        try {
            const element = document.getElementById('factura');
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('factura.pdf');
            toast.success('PDF exportado exitosamente');
        } catch (error) {
            toast.error('Error al exportar el PDF');
            console.error('Error:', error);
        }
    };

    const generarFacturasAutomaticas = async () => {
        try {
            // Obtener todas las matrículas con TAE
            const responseMatriculas = await fetch('http://localhost:9090/matriculas/obtener_matriculas_tae');
            if (!responseMatriculas.ok) {
                throw new Error('Error al obtener matrículas TAE');
            }
            const matriculasTAE = await responseMatriculas.json();

            // Array para almacenar todas las facturas generadas
            const facturasGeneradas = [];

            // Generar factura para cada matrícula TAE
            for (const matricula of matriculasTAE) {
                // Obtener datos del cliente
                const responseCliente = await fetch(`http://localhost:9090/clientes/obtener_cliente?numero_documento=${matricula.numero_documento}`);
                if (!responseCliente.ok) {
                    continue;
                }
                const cliente = await responseCliente.json();

                // Obtener tarifa actual
                const responseTarifa = await fetch(`http://localhost:9090/tarifas/obtener_tarifa?id_tarifa=${matricula.tipo_tarifa}`);
                if (!responseTarifa.ok) {
                    continue;
                }
                const tarifa = await responseTarifa.json();

                // Calcular fechas
                const fechaActual = new Date();
                const fechaVencimiento = new Date(fechaActual);
                fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

                // Crear objeto de factura
                const facturaGenerada = {
                    identificacion: cliente.numero_documento,
                    nombre: cliente.nombre,
                    barrio: matricula.direccion,
                    MatriculaCliente: matricula.id_matricula,
                    fechaInicioCobro: fechaActual.toISOString().split('T')[0],
                    fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
                    lecturaAnterior: matricula.ultima_lectura || 0,
                    lecturaActual: matricula.ultima_lectura || 0,
                    precioUnitario: tarifa.valor_tarifa,
                    multas: 0,
                    saldoPendiente: 0,
                    observacion: 'Factura generada automáticamente'
                };

                facturasGeneradas.push(facturaGenerada);
            }

            // Actualizar estado con las facturas generadas
            setFacturas(facturasGeneradas);
            setInvoicesGenerated(true);

            // Generar PDF con todas las facturas
            await exportarFacturasPDF(facturasGeneradas);

            toast.success(`Se generaron ${facturasGeneradas.length} facturas automáticamente`);
        } catch (error) {
            toast.error('Error al generar facturas automáticas');
            console.error('Error:', error);
        }
    };

    const exportarFacturasPDF = async (facturasParaExportar) => {
        try {
            const pdf = new jsPDF();
            let firstPage = true;

            for (const factura of facturasParaExportar) {
                // Actualizar el estado con los datos de la factura actual
                setFacturaData(factura);

                // Esperar a que el DOM se actualice
                await new Promise(resolve => setTimeout(resolve, 100));

                const element = document.getElementById('factura-automatica');
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
                    pdf.addPage();
                }
                firstPage = false;

                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            }

            // Obtener el mes y año actual para el nombre del archivo
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
                setShowFacturasModal(true);
                toast.success('Facturas cargadas exitosamente');
            } else {
                toast.error('Error al obtener las facturas');
            }
        } catch (error) {
            toast.error('Error de conexión con el servidor');
            console.error('Error:', error);
        }
    };

    const buscarDatosPorMatricula = async () => {
        if (!facturaData.numeroMatricula.trim()) {
            toast.warning("Ingrese un número de matrícula");
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:9090/matriculas/buscar_matricula?id_matricula=${facturaData.numeroMatricula}`);
            if (response.ok) {
                const data = await response.json();
                
                setFacturaData(prev => ({
                    ...prev,
                    identificacion: data.numero_documento,
                    nombre: data.nombre,
                    barrio: data.direccion,
                    fechaInicioCobro: data.fecha_creacion,
                    MatriculaCliente: data.id_matricula
                }));
    
                toast.success("Datos de la matrícula cargados exitosamente");
            } else {
                toast.error("No se encontró la matrícula");
            }
        } catch (error) {
            toast.error("Error al buscar la matrícula");
            console.error("Error:", error);
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
        obtenerTarifas();
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
                    <button onClick={exportarPDF} className="btn btn-success">
                        Exportar a PDF
                    </button>
                    <button onClick={abrirModalFacturasAutomaticas} className="btn btn-secondary">
                        Facturas Automáticas
                    </button>
                    <button onClick={obtenerFacturas} className="btn btn-info">
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
                                    type="number"
                                    name='numeroMatricula'
                                    value={facturaData.numeroMatricula}
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
                                                value={facturaData.identificacion}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>USUARIO:</label>
                                            <input
                                                type="text"
                                                name="usuario"
                                                value={facturaData.usuario}
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
                                                value={facturaData.barrio}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>MATRICULA N°</label>
                                            <input
                                                type="text"
                                                name="MatriculaCliente"
                                                value={facturaData.MatriculaCliente}
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