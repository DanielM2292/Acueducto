import React, { useState } from 'react';

const PagosPage = () => {
    const [tipo, setTipo] = useState('Factura');
    const [tarifa, setTarifa] = useState('Estandar'); 
    const [showHistorial, setShowHistorial] = useState(false);
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
            tipo: 'Multa',
            fecha: '2025-01-21',
            valor: 150000,
            estado: 'Pago recibido',
        },
    ]);

    const renderFields = () => {
        switch (tipo) {
            case 'Factura':
                return (
                    <div className='form-grid'>
                        <input
                            type='text'
                            disabled
                            placeholder='Tarifa'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Tipo'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Total'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Valor Pendiente'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Valor a Cancelar'
                            className='disabled-input'
                        />
                        {tarifa === 'Medidor' && (
                            <>
                                <input
                                    type='date'
                                    placeholder='Fecha Lectura Actual'
                                    className='disabled-input'
                                />
                                <input
                                    type='date'
                                    placeholder='Fecha Lectura Anterior'
                                    className='disabled-input'
                                />
                                <input
                                    type='number'
                                    placeholder='Lectura Actual'
                                    className='disabled-input'
                                />
                                <input
                                    type='number'
                                    placeholder='Lectura Anterior'
                                    className='disabled-input'
                                />
                            </>
                        )}
                    </div>
                );
            case 'Multa':
                return (
                    <div className='form-grid'>
                        <input
                            type='text'
                            disabled
                            placeholder='Concepto'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Total'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Valor Pendiente'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Valor a Cancelar'
                            className='disabled-input'
                        />
                    </div>
                );
            case 'Matricula':
                return (
                    <div className='form-grid'>
                        <input
                            type='text'
                            disabled
                            placeholder='Estado'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Total'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Valor Pendiente'
                            className='disabled-input'
                        />
                        <input
                            type='text'
                            disabled
                            placeholder='Valor a Cancelar'
                            className='disabled-input'
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className='container'>
            <div className='card'>
                <h2>Pagos</h2>
                <div className='form-grid'>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value='Factura'>Factura</option>
                        <option value='Multa'>Multa</option>
                        <option value='Matricula'>Matricula</option>
                    </select>
                    <input
                        type='text'
                        placeholder={`Id ${tipo}`}
                        className='input-focus'
                    />
                </div>
                {tipo === 'Factura' && (
                    <div className='form-grid'>
                        <select
                            value={tarifa}
                            onChange={(e) => setTarifa(e.target.value)}
                        >
                            <option value='Estandar'>Estandar</option>
                            <option value='Medidor'>Medidor</option>
                        </select>
                    </div>
                )}
                {renderFields()}
                <div className='button-group'>
                    <button className='save-button'>Guardar Pago</button>
                    <button
                        className='history-button'
                        onClick={() => setShowHistorial(true)}
                    >
                        Ver Historial
                    </button>
                </div>
            </div>
            {showHistorial && (
                <div className='modal-overlay'>
                    <div className='modal'>
                        <h3>Historial de Pagos</h3>
                        <table>
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
                        <button
                            className='close-button'
                            onClick={() => setShowHistorial(false)}
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