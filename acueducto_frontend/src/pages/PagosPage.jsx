import React, { useState } from 'react';

const PagosPage = () => {
    const [tipo, setTipo] = useState('Factura');
    const [tarifa, setTarifa] = useState('Estandar');
    const [showHistorial, setShowHistorial] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [idReferencia, setIdReferencia] = useState('');
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
        if (tipo === 'Factura') {
            return (
                <div className="pagos-form-grid">
                    <select
                        value={tarifa}
                        onChange={(e) => setTarifa(e.target.value)}
                        className="pagos-select"
                    >
                        <option value="Estandar">Estándar</option>
                        <option value="Medidor">Medidor</option>
                    </select>
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
                        <div className="meter-readings-container">
                            <div className="input-group">
                                <label className="input-label">Fecha Lectura Anterior</label>
                                <input
                                    type="date"
                                    className="pagos-input"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Fecha Lectura Actual</label>
                                <input
                                    type="date"
                                    className="pagos-input"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Lectura Anterior (m³)</label>
                                <input
                                    type="number"
                                    placeholder="Ingrese lectura anterior"
                                    className="pagos-input"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Lectura Actual (m³)</label>
                                <input
                                    type="number"
                                    placeholder="Ingrese lectura actual"
                                    className="pagos-input"
                                />
                            </div>
                        </div>
                    )}
                </div>
            );
        } else {
            // Para Multas y Matrículas
            return (
                <div className="pagos-form-grid">
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="pagos-select"
                    >
                        <option value="Multa">Multa</option>
                        <option value="Matricula">Matrícula</option>
                    </select>
                    <input
                        type="text"
                        value={idReferencia}
                        onChange={(e) => setIdReferencia(e.target.value)}
                        placeholder={`ID ${tipo}`}
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
                </div>
            );
        }
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
                        <option value="Multa">Multa</option>
                        <option value="Matricula">Matrícula</option>
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

            <style jsx>{`
                .meter-readings-container {
                    display: grid;
                    gap: 1rem;
                    width: 100%;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .input-label {
                    color: #1a1a1a;
                    font-size: 0.875rem;
                    font-weight: 500;
                    position: static;
                    margin-bottom: 0.25rem;
                }

                .pagos-input {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.375rem;
                    margin-top: 0;
                }

                .pagos-input:focus {
                    outline: none;
                    border-color: #4299e1;
                    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
                }
            `}</style>
        </div>
    );
};

export default PagosPage;