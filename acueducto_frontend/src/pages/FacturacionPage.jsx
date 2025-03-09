import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2canvas from 'html2canvas';
import LogoAcueducto from '../imagenes/LogoAcueducto.png';

const FacturacionPage = () => {
    const name = localStorage.getItem("userName");
    const [facturaDataEstandar, setFacturaDataEstandar] = useState({
        nombre_usuario: name,
        identificacion: '',
        nombre: '',
        barrio: '',
        numeroMatricula: '',
        fechaInicioCobro: '',
        fechaVencimiento: '',
        precioUnitario: '',
        multas: '',
        saldoPendiente: '',
        observacion: ''
    });
    const [facturaData, setFacturaData] = useState({
        nombre_usuario: name,
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
    });
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [invoicesGenerated, setInvoicesGenerated] = useState(false);
    const [showFacturasModal, setShowFacturasModal] = useState(false);
    const [facturas, setFacturas] = useState([]);
    const [isFacturasClosing, setIsFacturasClosing] = useState(false);
    const [matriculasTAM, setMatriculasTAM] = useState([]);
    const [numeroMatriculaInput, setNumeroMatriculaInput] = useState("");
    const [numeroFactura, setNumeroFactura] = useState("");
    const [cargandoNumero, setCargandoNumero] = useState(false);
    const [selectedYear, setSelectedYear] = useState('todos');
    const [selectedMonth, setSelectedMonth] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');

    const abrirModalFacturasAutomaticas = () => {
        setShowModal(true);
    };

    const abrirModalFacturas = async () => {
        try {
            await obtenerFacturas(); // Primero obtener las facturas
            setShowFacturasModal(true); // Luego mostrar el modal
        } catch (error) {
            console.error('Error al abrir modal de facturas:', error);
            toast.error('Error al cargar las facturas');
        }
    };

    const obtenerDatosIniciales = async () => {
        try {
            const response = await fetch('http://localhost:9090/facturas/datos_iniciales');
            if (response.ok) {
                const data = await response.json();
                setFacturaData({
                    id_factura: data.id_factura || '',
                    identificacion: data.numero_documento || '',
                    nombre: data.nombre || '',
                    barrio: data.direccion || '',
                    numeroMatricula: data.numero_matricula || '',
                    fechaInicioCobro: data.fecha_factura ? new Date(data.fecha_factura).toISOString().split('T')[0] : '',
                    fechaVencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento).toISOString().split('T')[0] : '',
                    lecturaAnterior: data.lectura_anterior || '',
                    lecturaActual: data.lectura_actual || '',
                    precioUnitario: data.precio_unitario || 0,  // Ahora usamos el valor del backend
                    multas: data.total_multas || 0,
                    saldoPendiente: data.valor_pendiente || 0,
                    observacion: data.observacion || ''
                });
                setNumeroFactura(data.id_factura || '');
                setNumeroMatriculaInput(data.numero_matricula || '');
            }
        } catch (error) {
            console.error("Error al obtener datos iniciales:", error);
        }
    };

    // Llamar a la función cuando el componente se monte
    useEffect(() => {
        obtenerDatosIniciales();
        if (numeroMatriculaInput.length >= 4) {
            buscarDatosPorMatricula(numeroMatriculaInput);
        }
    }, [numeroMatriculaInput]);

    const buscarFactura = async () => {
        if (!numeroFactura) {
            toast.warning("Ingrese un número de factura");
            return;
        }

        try {
            const response = await fetch(`http://localhost:9090/facturas/buscar_factura?id_factura=${numeroFactura}`);
            if (response.ok) {
                const factura = await response.json();
                console.log("Factura encontrada:", factura);
                const facturas = {
                    id_factura: factura.id_factura || '',
                    identificacion: factura.numero_documento || '',
                    nombre: factura.nombre || '',
                    barrio: factura.direccion || '',
                    numeroMatricula: factura.numero_matricula || '',
                    fechaInicioCobro: factura.fecha_factura ? new Date(factura.fecha_factura).toISOString().split('T')[0] : '',
                    fechaVencimiento: factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento).toISOString().split('T')[0] : '',
                    multas: factura.total_multas || 0,
                    saldoPendiente: factura.valor_pendiente || 0,
                    observacion: factura.observacion || ''
                };

                if (factura.tarifa_definida != null) {
                    setFacturaDataEstandar({
                        ...facturas,
                        precioUnitario: factura.tarifa_definida || 0
                    });
                    setNumeroFactura(factura.id_factura);
                    setShowModal(true);
                } else {
                    // Si es factura de medidor
                    setFacturaData({
                        ...facturas,
                        lecturaAnterior: factura.lectura_anterior || '',
                        lecturaActual: factura.lectura_actual || '',
                        precioUnitario: factura.valor_total_lectura || 0
                    });
                    setNumeroFactura(factura.id_factura);
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

    const obtenerSiguienteNumeroFactura = async () => {
        try {
            setCargandoNumero(true);
            const response = await fetch('http://localhost:9090/facturas/siguiente_numero');
            if (response.ok) {
                const data = await response.json();
                setNumeroFactura(data.siguiente_numero);
                resaltarNuevoNumero();
            } else {
                console.error('Error al obtener el siguiente número de factura');
                toast.error('Error al obtener el número de factura');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión con el servidor');
        } finally {
            setCargandoNumero(false);
        }
    };

    useEffect(() => {
        obtenerSiguienteNumeroFactura();
    }, []);

    const resaltarNuevoNumero = () => {
        const elemento = document.querySelector('.numero-factura-input');
        if (elemento) {
            elemento.classList.add('destacado');
            setTimeout(() => {
                elemento.classList.remove('destacado');
            }, 2000);
        }
    };

    const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFacturaData(prev => ({
            ...prev,
            [name]: value || ''
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

        try {
            const response = await fetch('http://localhost:9090/facturas/crear_factura', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(facturaData)
            });

            if (response.ok) {
                toast.success('Factura creada exitosamente');
                // Exportar PDF inmediatamente después de crear la factura
                await exportarPDF();
                await obtenerSiguienteNumeroFactura();
                setNumeroMatriculaInput('');
            } else {
                toast.error('Error al crear la factura');
            }
        } catch (error) {
            console.error('Error:', error);
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

            // Limpiar el formulario después de exportar
            setFacturaData({
                nombre_usuario: name,
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
            });
            setNumeroMatriculaInput('');

            // **Ahora actualizamos el ID de la factura después de exportar**
            await obtenerSiguienteNumeroFactura();

        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al exportar el PDF');
        }
    };

    // Método mejorado para generar facturas automáticas
    const generarFacturasAutomaticas = async () => {
        try {
            const response = await fetch('http://localhost:9090/facturas/generarFacturasAutomaticas', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({nombre_usuario: name})
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del backend:', errorData.message);
                throw new Error('Error al generar facturas');
            }

            const { facturas } = await response.json();
            if (!facturas || facturas.length === 0) {
                toast.info('No hay facturas para generar');
                return;
            }

            setFacturas(facturas);
            setInvoicesGenerated(true);

            // Obtener el nuevo número de factura después de generar facturas automáticas
            await obtenerSiguienteNumeroFactura();
            await exportarFacturasPDF(facturas);
            toast.success(`Se generaron ${facturas.length} facturas automáticamente`);

            // Limpiar el formulario después de generar facturas automáticas
            setFacturaData({
                nombre_usuario: name,
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
            });
            setNumeroMatriculaInput('');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al generar facturas automáticas');
        }
    };

    const handleMatriculaChange = (e) => {
        const value = e.target.value;
        setNumeroMatriculaInput(value);
        setFacturaData(prev => ({
            ...prev,
            numeroMatricula: value
        }));

        if (value.length >= 4) {
            buscarDatosPorMatricula(value);
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
                                    <p>${factura.id_factura}</p>
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
                                                    value="${factura.valor_estandar || 0}"
                                                    readOnly
                                                />
                                            </td>
                                            <td>${formatCurrency(factura.valor_estandar || 0)}</td>
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
                                                ${formatCurrency((parseFloat(factura.valor_estandar || 0) +
                    parseFloat(factura.multas || 0) + parseFloat(factura.valor_pendiente || 0)).toFixed(3))}
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
                                        ${formatCurrency((parseFloat(factura.valor_estandar || 0) +
                        parseFloat(factura.multas || 0) + parseFloat(factura.valor_pendiente || 0)).toFixed(3))}
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
                console.log("Datos recibidos del backend:", data); // Para depuración
                setFacturas(Array.isArray(data) ? data : [data]);
                toast.success('Facturas cargadas exitosamente');
            } else {
                toast.error('Error al obtener las facturas');
            }
        } catch (error) {
            console.error("Error completo:", error); // Para depuración
            toast.error('Error de conexión con el servidor');
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

            console.log("Datos recibidos del backend:", data);

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
                precioUnitario: data.precio_unitario,
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
                    <button onClick={crearFactura} className="btn btn-success">Guardar Factura y Exportar Factura en PDF</button>
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
                            <p> {numeroFactura || 'Cargando...'}</p>
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
                                    readOnly
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
                                    value={facturaData.numeroMatricula}
                                    onChange={handleMatriculaChange}
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
                                            readOnly
                                        />
                                    </td>
                                    <td>
                                        {formatCurrency(
                                            (parseFloat(facturaData.lecturaActual || 0) - parseFloat(facturaData.lecturaAnterior || 0))
                                            * parseFloat(facturaData.precioUnitario || 0)
                                        )}
                                    </td>
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
                                        {formatCurrency(((parseFloat(facturaData.lecturaActual || 0) - parseFloat(facturaData.lecturaAnterior || 0))
                                            * parseFloat(facturaData.precioUnitario || 0) +
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
                                <p className="value" style={{ fontWeight: 'bold' }}>{facturaData.numeroMatricula || '-'}</p>
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
                                                value={facturaDataEstandar.identificacion || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>USUARIO:</label>
                                            <input
                                                type="text"
                                                name="usuario"
                                                value={facturaDataEstandar.nombre || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>FECHA INICIO DE COBRO:</label>
                                            <input
                                                type="date"
                                                name="fechaInicioCobro"
                                                value={facturaDataEstandar.fechaInicioCobro}
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
                                                value={facturaDataEstandar.barrio || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>MATRICULA N°</label>
                                            <input
                                                type="text"
                                                name="MatriculaCliente"
                                                value={facturaDataEstandar.numeroMatricula}
                                                readOnly
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>FECHA DE VENCIMIENTO:</label>
                                            <input
                                                type="date"
                                                name="fechaVencimiento"
                                                value={facturaDataEstandar.fechaVencimiento}
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
                                                        value={facturaDataEstandar.precioUnitario}
                                                        readOnly
                                                    />
                                                </td>
                                                <td>{formatCurrency(facturaDataEstandar.precioUnitario || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td>MULTAS</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        name="multas"
                                                        value={facturaDataEstandar.multas}
                                                        readOnly
                                                    />
                                                </td>
                                                <td>{formatCurrency(facturaDataEstandar.multas || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td>SALDO PENDIENTE</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        name="saldoPendiente"
                                                        value={facturaDataEstandar.saldoPendiente}
                                                        readOnly
                                                    />
                                                </td>
                                                <td>{formatCurrency(facturaDataEstandar.saldoPendiente || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td>OBSERVACIÓN</td>
                                                <td colSpan="2">
                                                    <input
                                                        type="text"
                                                        name="observacion"
                                                        value={facturaDataEstandar.observacion}
                                                        readOnly
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="2">TOTAL A PAGAR</td>
                                                <td>
                                                    {formatCurrency((parseFloat(facturaDataEstandar.precioUnitario || 0) +
                                                        parseFloat(facturaDataEstandar.multas || 0) +
                                                        parseFloat(facturaDataEstandar.saldoPendiente || 0)).toFixed(2))}
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
                                            <p className="value">{facturaDataEstandar.nombre || '-'}</p>
                                        </div>
                                        <div className="comprobante-item">
                                            <p className="label">IDENTIFICACIÓN</p>
                                            <p className="value">{facturaDataEstandar.identificacion || '-'}</p>
                                        </div>
                                        <div className="comprobante-item">
                                            <p className="label">BARRIO</p>
                                            <p className="value">{facturaDataEstandar.barrio || '-'}</p>
                                        </div>
                                        <div className="comprobante-item">
                                            <p className="label">MATRICULA N°</p>
                                            <p className="value">{facturaDataEstandar.numeroMatricula || '-'}</p>
                                        </div>
                                        <div className="comprobante-item">
                                            <p className="label">TOTAL PAGADO</p>
                                            <p className="value">
                                                {formatCurrency((parseFloat(facturaDataEstandar.precioUnitario || 0) +
                                                    parseFloat(facturaDataEstandar.multas || 0) +
                                                    parseFloat(facturaDataEstandar.saldoPendiente || 0)).toFixed(2))}
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
                </div>
            )}
            {showFacturasModal && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <h2 className="modalTitle">Lista de Facturas</h2>

                        <div className="filterContainer">
                            <div className="searchContainer">
                                <div className="searchIcon">
                                    {/* Ícono de búsqueda simple con CSS */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar por número, usuario, identificación..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="searchInput"
                                />
                            </div>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="yearSelect"
                            >
                                <option value="">Todos los años</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="monthSelect"
                            >
                                <option value="todos">Todos los meses</option>
                                <option value="01">Enero</option>
                                <option value="02">Febrero</option>
                                <option value="03">Marzo</option>
                                <option value="04">Abril</option>
                                <option value="05">Mayo</option>
                                <option value="06">Junio</option>
                                <option value="07">Julio</option>
                                <option value="08">Agosto</option>
                                <option value="09">Septiembre</option>
                                <option value="10">Octubre</option>
                                <option value="11">Noviembre</option>
                                <option value="12">Diciembre</option>
                            </select>
                        </div>

                        <div className="historialTableContainer">
                            <table className="historialTableCustom">
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
                                    {facturas && facturas.length > 0 ? (
                                        facturas
                                            .filter(factura => {
                                                const yearMatch = (() => {
                                                    if (selectedYear === 'todos') return true;
                                                    if (!factura.fecha_factura) return false;
                                                    try {
                                                        const facturaDate = new Date(factura.fecha_factura);
                                                        if (isNaN(facturaDate.getTime())) return false;
                                                        const facturaYear = String(facturaDate.getFullYear());
                                                        return facturaYear === selectedYear;
                                                    } catch (error) {
                                                        console.error("Error al procesar fecha:", error);
                                                        return false;
                                                    }
                                                })();
                                                // Filtro por mes
                                                const monthMatch = (() => {
                                                    if (selectedMonth === 'todos') return true;
                                                    if (!factura.fecha_factura) return false;
                                                    try {
                                                        const facturaDate = new Date(factura.fecha_factura);
                                                        if (isNaN(facturaDate.getTime())) return false;
                                                        const facturaMonth = String(facturaDate.getMonth() + 1).padStart(2, '0');
                                                        return facturaMonth === selectedMonth;
                                                    } catch (error) {
                                                        console.error("Error al procesar fecha:", error);
                                                        return false;
                                                    }
                                                })();
                                                    
                                                // Filtro por término de búsqueda
                                                const searchMatch = (() => {
                                                    if (!searchTerm.trim()) return true;
                                                    const term = searchTerm.toLowerCase();
                                                    return (
                                                        (factura.id_factura && factura.id_factura.toString().toLowerCase().includes(term)) ||
                                                        (factura.nombre && factura.nombre.toLowerCase().includes(term)) ||
                                                        (factura.numero_documento && factura.numero_documento.toString().toLowerCase().includes(term)) ||
                                                        (factura.direccion && factura.direccion.toLowerCase().includes(term)) ||
                                                        (factura.numero_matricula && factura.numero_matricula.toString().toLowerCase().includes(term)) ||
                                                        (factura.descripcion_estado_factura && factura.descripcion_estado_factura.toLowerCase().includes(term))
                                                    );
                                                })();

                                                // Debe cumplir ambos filtros
                                                return yearMatch && monthMatch && searchMatch;
                                            })
                                            .map((factura, index) => (
                                                <tr key={index}>
                                                    <td>{factura.id_factura}</td>
                                                    <td>{factura.fecha_factura ? new Date(factura.fecha_factura).toLocaleDateString() : 'Fecha no disponible'}</td>
                                                    <td>{factura.nombre}</td>
                                                    <td>{factura.numero_documento}</td>
                                                    <td>{factura.direccion}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{factura.numero_matricula}</td>
                                                    <td>{typeof formatCurrency === 'function' ? formatCurrency(factura.valor_total) : factura.valor_total}</td>
                                                    <td>{factura.descripcion_estado_factura}</td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center' }}>No hay facturas disponibles</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={handleCloseFacturasModal} className="closeModalButton">Cerrar</button>
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
        }

        .modal-large {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 1200px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          z-index: 1001;
        }

        .filters-container {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }

        .search-container, .filter-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-input {
          width: 300px;
          padding: 0.5rem;
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          font-size: 1rem;
        }

        .search-input:focus, .select-input:focus {
          outline: none;
          border-color: #0CB7F2;
          box-shadow: 0 0 0 2px rgba(12, 183, 242, 0.2);
        }

        .mes-selector {
          width: 200px;
        }

        .table-container {
          overflow-x: auto;
          margin: 15px 0;
          max-height: calc(80vh - 240px);
          overflow-y: auto;
        }

        .facturas-table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
        }

        .facturas-table th,
        .facturas-table td {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: left;
        }

        .facturas-table th {
          background-color: #53D4FF;
          color: white;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .modal.closing,
        .modal-overlay.closing {
          opacity: 0;
          visibility: hidden;
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

        /* Responsive styles */
        @media (max-width: 768px) {
          .filters-container {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .search-container, .filter-container {
            width: 100%;
          }
          
          .search-input, .mes-selector {
            width: 100%;
          }
          
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
          .modalOverlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modalContent {
        background: white;
        padding: 25px;
        border-radius: 12px;
        width: 95%;
        max-width: 1200px;
        height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .modalTitle {
        text-align: center;
        margin-bottom: 20px;
        font-size: 24px;
        color: #2c3e50;
    }

    .filterContainer {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        align-items: center;
    }

    .searchContainer {
        flex: 1;
        position: relative;
        max-width: 500px;
    }

    .searchIcon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
    }

    .searchInput {
        width: 100%;
        padding: 10px 10px 10px 40px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.3s ease;
    }

    .searchInput:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .monthSelect {
        padding: 10px 35px 10px 15px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        background-color: white;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        min-width: 180px;
    }

    .monthSelect:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .historialTableContainer {
        flex: 1;
        overflow-y: auto;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        margin-bottom: 20px;
        position: relative;
    }

    .historialTableContainer::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    .historialTableContainer::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    .yearSelect {
        padding: 10px 35px 10px 15px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        background-color: white;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        min-width: 180px;
    }

    .historialTableContainer::-webkit-scrollbar-thumb {
        background: #bbb;
        border-radius: 4px;
    }

    .historialTableContainer::-webkit-scrollbar-thumb:hover {
        background: #999;
    }

    .historialTableCustom {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }

    .historialTableCustom thead {
        position: sticky;
        top: 0;
        z-index: 10;
        background-color: #3498db;
        color: white;
    }

    .historialTableCustom th, 
    .historialTableCustom td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .historialTableCustom th {
        font-weight: 600;
    }

    .historialTableCustom tbody tr {
        transition: background-color 0.2s;
    }

    .historialTableCustom tbody tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    .historialTableCustom tbody tr:hover {
        background-color: #e8f4fc;
        cursor: pointer;
    }

    .closeModalButton {
        align-self: center;
        padding: 10px 25px;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s;
    }

    .closeModalButton:hover {
        background-color: #c0392b;
    }

    @media (max-width: 768px) {
        .filterContainer {
            flex-direction: column;
            gap: 10px;
        }

        .searchContainer {
            max-width: 100%;
        }

        .monthSelect {
            width: 100%;
        }
    }
      `}</style>
        </div>
    );
};

export default FacturacionPage;