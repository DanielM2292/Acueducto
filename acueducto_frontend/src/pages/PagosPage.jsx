import React, { useState } from 'react';

const PagosPage = () => {
    const [tipo, setTipo] = useState('Factura');
    const [tarifa, setTarifa] = useState('Estandar'); 
    const [showHistorial, setShowHistorial] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [historialData] = useState([
        {
            id: 'TIP0001',
            tipo: 'Factura',
            fecha: '2025-01-21',
            valor: 150000,
            estado: 'Pago recibido',
        },
        {
            id: 'TIP0002',
            tipo: 'Factura',
            fecha: '2025-01-21',
            valor: 150000,
            estado: 'Pago recibido',
        },
    ]);

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowHistorial(false);
            setIsClosing(false);
        }, 300);
    };

    const renderFields = () => {
        return (
            <div className="pagos-form-grid">
                <input
                    type="text"
                    disabled
                    placeholder="Tarifa"
                    className="pagos-input"
                />
                <input
                    type="text"
                    disabled
                    placeholder="Total"
                    className="pagos-input"
                />
                <input
                    type="text"
                    disabled
                    placeholder="Valor Pendiente"
                    className="pagos-input"
                />
                <input
                    type="text"
                    disabled
                    placeholder="Valor a Cancelar"
                    className="pagos-input"
                />
                {tarifa === 'Medidor' && (
                    <>
                        <input
                            type="date"
                            placeholder="Fecha Lectura Actual"
                            className="pagos-input"
                        />
                        <input
                            type="date"
                            placeholder="Fecha Lectura Anterior"
                            className="pagos-input"
                        />
                        <input
                            type="number"
                            placeholder="Lectura Actual"
                            className="pagos-input"
                        />
                        <input
                            type="number"
                            placeholder="Lectura Anterior"
                            className="pagos-input"
                        />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="pagos-container">
            <div className="pagos-card">
                <h2 className="pagos-title">Pagos</h2>
                <div className="pagos-form-grid">
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="pagos-select"
                    >
                        <option value="Factura">Factura</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Id Factura"
                        className="pagos-input"
                    />
                </div>
                <div className="pagos-form-grid">
                    <select
                        value={tarifa}
                        onChange={(e) => setTarifa(e.target.value)}
                        className="pagos-select"
                    >
                        <option value="Estandar">Estandar</option>
                        <option value="Medidor">Medidor</option>
                    </select>
                </div>
                {renderFields()}
                <div className="pagos-button-group">
                    <button className="pagos-button pagos-button-save">
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
                                            <td>{item.id}</td>
                                            <td>{item.tipo}</td>
                                            <td>{item.fecha}</td>
                                            <td>{item.valor}</td>
                                            <td>{item.estado}</td>
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