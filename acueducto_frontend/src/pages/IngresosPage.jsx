import React from 'react';

const IngresosPage = () => {
    return (
        <div>
            <h1 className='loginTitle'>Ingresos</h1>
            <div className='IngresosContainer'>
                <input type="text" placeholder="Tipo de Ingreso" />
                <input type="text" placeholder="Cantidad" />
                <input type="text" placeholder="Valor" />
                <button>Guardar</button>
            </div>
        </div>
    );
};

export default IngresosPage;