import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format, parseISO, getYear, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const IngresosPage = () => {
    const name = localStorage.getItem("userName");
    const [formData, setFormData] = useState({
        nombre_usuario: name,
        descripcionIngreso: "",
        valorIngreso: "",
        idIngreso: null
    });
    const [ingresos, setIngresos] = useState([]);
    const [egresos, setEgresos] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [filteredIngresos, setFilteredIngresos] = useState([]);
    const [totals, setTotals] = useState({
        ingresos: 0,
        egresos: 0,
        caja: 0
    });
    const [searchTerm, setSearchTerm] = useState("");

    const years = [2025, 2026, 2027, 2028, 2029, 2030];
    const months = Array.from({ length: 12 }, (_, i) => i);

    const calculateTotals = (filteredIngresos) => {
        const totalIngresos = filteredIngresos.reduce((sum, ingreso) => sum + Number(ingreso.valor_ingreso), 0);

        // Filtrar egresos por mes y año
        const filteredEgresos = egresos.filter(egreso => {
            const egresoDate = new Date(egreso.fecha_egreso);
            return getYear(egresoDate) === selectedYear && getMonth(egresoDate) === selectedMonth;
        });

        const totalEgresos = filteredEgresos.reduce((sum, egreso) => sum + Number(egreso.total_egreso), 0);

        setTotals({
            ingresos: totalIngresos,
            egresos: totalEgresos,
            caja: totalIngresos - totalEgresos
        });
    };

    useEffect(() => {
        const filterData = () => {
            if (ingresos.length > 0) {
                const filtered = ingresos.filter(ingreso => {
                    const fecha = parseISO(ingreso.fecha_ingreso);
                    return getYear(fecha) === selectedYear && getMonth(fecha) === selectedMonth;
                });
                setFilteredIngresos(filtered);
                calculateTotals(filtered);
            }
        };
        filterData();
    }, [ingresos, selectedYear, selectedMonth, egresos]);

    const handleListarTodos = async () => {
        try {
            const [ingresosResponse, egresosResponse] = await Promise.all([
                fetch("http://localhost:9090/ingresos/listar_todos_ingresos"),
                fetch("http://localhost:9090/egresos/listar_todos_egresos")
            ]);

            const ingresosData = await ingresosResponse.json();
            const egresosData = await egresosResponse.json();

            if (ingresosResponse.ok && egresosResponse.ok) {
                setIngresos(ingresosData);
                setEgresos(egresosData);
                setIsModalOpen(true);
                toast.success("Datos cargados exitosamente");
            } else {
                toast.error("Error al cargar los datos");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error de conexión");
        }
    };

    const resetForm = () => {
        setFormData({
            descripcionIngreso: "",
            valorIngreso: "",
            idIngreso: null
        });
        setEditMode(false);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:9090/ingresos/crear_ingreso", {
                method: "POST",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success("Ingreso creado exitosamente");
                resetForm();
                handleListarTodos();
            } else {
                toast.error("Error al crear el ingreso");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const handleUpdate = async () => {
        if (!formData.idIngreso) {
            toast.warning("No hay ingreso seleccionado para actualizar");
            return;
        }

        try {
            const response = await fetch("http://localhost:9090/ingresos/actualizar_ingreso", {
                method: "PUT",
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre_usuario: name,
                    idIngreso: formData.idIngreso,
                    descripcionIngreso: formData.descripcionIngreso,
                    valorIngreso: formData.valorIngreso
                })
            });

            if (response.ok) {
                toast.success("Ingreso actualizado exitosamente");
                resetForm();
                handleListarTodos();
                setEditMode(false);
            } else {
                toast.error("Error al actualizar el ingreso");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const handleSelectIngreso = (ingreso) => {
        setFormData({
            idIngreso: ingreso.id_ingreso,
            descripcionIngreso: ingreso.descripcion_ingreso,
            valorIngreso: ingreso.valor_ingreso
        });
        setEditMode(true);
        setIsModalOpen(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const monthName = format(new Date(selectedYear, selectedMonth), 'MMMM', { locale: es });

        doc.setFontSize(18);
        doc.text(`Reporte Financiero - ${monthName} ${selectedYear}`, 14, 20);

        doc.setFontSize(12);
        doc.text(`Total Ingresos: ${formatCOP(totals.ingresos)}`, 14, 40);
        doc.text(`Total Egresos: ${formatCOP(totals.egresos)}`, 14, 50);
        doc.text(`Total en Caja: ${formatCOP(totals.caja)}`, 14, 60);

        const tableData = filteredIngresos.map(item => [
            item.id_ingreso,
            item.descripcion_ingreso,
            formatCOP(item.valor_ingreso),
            format(parseISO(item.fecha_ingreso), 'dd/MM/yyyy')
        ]);

        doc.autoTable({
            startY: 70,
            head: [['ID', 'Descripción', 'Valor', 'Fecha']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [74, 144, 226] }
        });

        doc.save(`reporte-financiero-${selectedYear}-${monthName}.pdf`);
        toast.success("Reporte PDF generado exitosamente");
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            toast.warning("Ingrese un término de búsqueda");
            return;
        }

        const filtered = ingresos.filter(ingreso =>
            ingreso.descripcion_ingreso.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredIngresos(filtered);
        calculateTotals(filtered);
        setSearchTerm("");
    };

    const formatCOP = (value) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(value);

        return (
            <div className="ingresos-container">
                <ToastContainer />
                <h1 className="ingresos-title">Gestión de Ingresos</h1>
    
                <div className="ingresos-form">
                    <div className="ingresos-input-stack">
                        <div className="ingresos-input-group">
                            <input
                                type="text"
                                value={formData.descripcionIngreso}
                                onChange={(e) => setFormData({ ...formData, descripcionIngreso: e.target.value })}
                                className="ingresos-input"
                                placeholder=" "
                                required
                            />
                            <label className="ingresos-label">Descripción del Ingreso</label>
                        </div>
    
                        <div className="ingresos-input-group">
                            <input
                                type="number"
                                value={formData.valorIngreso}
                                onChange={(e) => setFormData({ ...formData, valorIngreso: e.target.value })}
                                className="ingresos-input"
                                placeholder=" "
                                required
                            />
                            <label className="ingresos-label">Valor del Ingreso</label>
                        </div>
                    </div>
    
                    <div className="ingresos-buttons">
                        <button
                            onClick={handleSubmit}
                            className="ingresos-button ingresos-button-primary"
                            disabled={editMode}>
                            Crear Ingreso
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="ingresos-button"
                            disabled={!editMode}>
                            Actualizar
                        </button>
                        <button
                            onClick={handleListarTodos}
                            className="ingresos-button">
                            Listar Todos
                        </button>
                    </div>
                </div>
    
                {isModalOpen && (
                    <div className={`pagos-modal-overlay ${isClosing ? 'closing' : ''}`}>
                        <div className={`pagos-modal ${isClosing ? 'closing' : ''}`} style={{ width: '80%', maxWidth: '800px' }}>
                            <h3 className="pagos-modal-title">Lista de Ingresos</h3>
    
                            <div className="filters-container">
                                <div className="filter-group">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="filter-select"
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        className="filter-select"
                                    >
                                        {months.map(month => (
                                            <option key={month} value={month}>
                                                {new Date(2025, month).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar ingreso..."
                                        className="filter-input"
                                    />
                                    <button onClick={handleSearch} className="search-button">Buscar</button>
                                </div>
                            </div>
    
                            <div className="totals-container">
                                <div className="total-item">
                                    <span>Total Ingresos:</span>
                                    <span className="total-value">{formatCOP(totals.ingresos)}</span>
                                </div>
                                <div className="total-item">
                                    <span>Total Egresos:</span>
                                    <span className="total-value">{formatCOP(totals.egresos)}</span>
                                </div>
                                <div className={`total-item ${totals.caja < 0 ? 'negative' : ''}`}>
                                    <span>Total en Caja:</span>
                                    <span className="total-value">{formatCOP(totals.caja)}</span>
                                </div>
                            </div>
    
                            <div className="pagos-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table className="pagos-table">
                                    <thead>
                                        <tr>
                                            <th>ID Ingreso</th>
                                            <th>Descripción</th>
                                            <th>Valor</th>
                                            <th>Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredIngresos.length > 0 ? (
                                            filteredIngresos.map((item) => (
                                                <tr key={item.id_ingreso}>
                                                    <td>{item.id_ingreso}</td>
                                                    <td>{item.descripcion_ingreso}</td>
                                                    <td>{formatCOP(item.valor_ingreso)}</td>
                                                    <td>{new Date(item.fecha_ingreso).toLocaleDateString()}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleSelectIngreso(item)}
                                                            className="edit-button"
                                                        >
                                                            Editar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>No hay ingresos para mostrar</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
    
                            <div className="modal-buttons">
                                <button
                                    className="pagos-button pagos-button-close"
                                    onClick={handleCloseModal}
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="ingresos-button ingresos-button-pdf">
                                    Exportar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <style>{`
                    .ingresos-container {
                        padding: 20px;
                        width: 50%;
                        height: 50%;
                    }
    
                    .ingresos-title {
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
    
                    .ingresos-form {
                        margin-bottom: 20px;
                    }
    
                    .ingresos-input-stack {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                        max-width: 400px;
                        margin: 0 auto 2rem auto;
                    }
    
                    .ingresos-input-group {
                        width: 100%;
                        margin-bottom: 1rem;
                    }
    
                    .ingresos-input {
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #ddd;
                        border-radius: 0.375rem;
                        font-size: 1rem;
                        transition: border-color 0.2s;
                    }
    
                    .ingresos-input:focus {
                        border-color: #4a90e2;
                        outline: none;
                        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
                    }
    
                    .ingresos-label {
                        display: block;
                        margin-bottom: 0.5rem;
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: #374151;
                    }
    
                    .filters-container {
                        display: flex;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                        padding: 1rem;
                        background-color: #f8f9fa;
                        border-radius: 0.5rem;
                        align-items: center;
                    }
    
                    .filter-group {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
    
                    .filter-group label {
                        font-weight: 500;
                        color: #374151;
                    }
    
                    .filter-select {
                        padding: 0.5rem;
                        border: 1px solid #ddd;
                        border-radius: 0.25rem;
                        font-size: 0.875rem;
                        min-width: 120px;
                    }
    
                    .filter-input {
                        padding: 0.5rem;
                        border: 1px solid #ddd;
                        border-radius: 0.25rem;
                        font-size: 0.875rem;
                        width: 200px;
                    }
    
                    .search-button {
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 0.25rem;
                        background-color: #4a90e2;
                        color: white;
                        cursor: pointer;
                    }
    
                    .search-button:hover {
                        background-color: #357abd;
                    }
    
                    .pagos-modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
    
                    .pagos-modal {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        width: 80%;
                        max-width: 800px;
                    }
    
                    .pagos-modal-title {
                        font-size: 20px;
                        margin-bottom: 15px;
                    }
    
                    .pagos-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
    
                    .pagos-table th, .pagos-table td {
                        border: 1px solid #ddd;
                        padding: 5px;
                        text-align: left;
                    }
    
                    .pagos-table th {
                        background-color: #f2f2f2;
                    }
    
                    .pagos-button {
                        padding: 10px 15px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        background-color: #4a90e2;
                        color: white;
                    }
    
                    .pagos-button-close {
                        background-color: #dc3545;
                    }
    
                    .pagos-button-close:hover {
                        background-color: #c82333;
                    }
    
                    .ingresos-button-pdf {
                        background-color: #28a745;
                        margin-left: 10px;
                    }
    
                    .ingresos-button-pdf:hover {
                        background-color: #218838;
                    }
    
                    .ingresos-button-update {
                        background-color: #ffc107; 
                        margin-left: 10px;
                    }
    
                    .ingresos-button-update:hover {
                        background-color: #e0a800;
                    }
    
                    .edit-button {
                        background-color: #ffc107;
                        border: none;
                        border-radius: 4px;
                        color: white;
                        cursor: pointer;
                        padding: 5px 10px;
                    }
    
                    .edit-button:hover {
                        background-color: #e0a800;
                    }
    
                    .totals-container {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                        padding: 1rem;
                        background-color: #f8f9fa;
                        border-radius: 0.5rem;
                    }
    
                    .total-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 1rem;
                        background-color: white;
                        border-radius: 0.375rem;
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    }
    
                    .total-item span:first-child {
                        font-size: 0.875rem;
                        color: #6b7280;
                    }
    
                    .total-value {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #374151;
                    }
    
                    .total-caja .total-value {
                        color: #28a745;
                    }
    
                    .total-caja.negative .total-value {
                        color: #dc3545;
                    }
                `}</style>
            </div>
        );
    };
    
    export default IngresosPage;