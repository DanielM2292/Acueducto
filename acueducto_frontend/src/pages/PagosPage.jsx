import React from 'react';

const PagosPage = () => {
    return (
        <div className='PagosPage'>
            <h1 className='titlePagos'>Pagos</h1>
            <div className='PagosContainer'>
                <select>
                    <option value="">Mensual</option>
                    <option value="">Semestral</option>
                    <option value="">Anual</option>
                    <option value="">Finca</option>
                </select>
                <div className='InputPagos'>
                <label>Número de Factura</label> <input type="text" />
                <label>Nombre Cliente</label> <input type="text" />
                <label>Apellido del Cliente</label><input type="text" />
                <label>Telefono</label><input type="text" />
                <label>Dirección</label><input type="text" />
                <label>Tarifa</label><select>
                    <option value="">Estandar</option>
                    <option value="">Finca</option>
                </select>
                <label>Tipo de Servicio</label><input type="text" />
                <label>Total a pagar</label><input type="text" />
                <label>Valor pendiente</label><input type="text" />
                </div>
            </div>
            <div className='PagosButton'>
                <button>Generar Pago</button>
                <button>Cancelar Pago</button>
            </div>
        </div>
    );
};

export default PagosPage;