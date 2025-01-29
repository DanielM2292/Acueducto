import React, { useState } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaSearch } from "react-icons/fa";

const EgresosPage = () => {
    const [idEgreso, setIdEgreso] = useState("");
    const [descripcionEgreso, setDescripcionEgreso] = useState("");
    const [cantidadEgreso, setCantidadEgreso] = useState("");
    const [valorEgreso, setValorEgreso] = useState("");
    const [idProducto, setIdProducto] = useState("");
    const [egresos, setEgresos] = useState([]);
    const [editMode, setEditMode] = useState(false);

    return (
        <div className='EgresosPageCustom'>
            <ToastContainer />
            <h1 className="pagesTitleCustom">Gestión de Egresos</h1>
            <div className="formEgresosCustom">
                <div className="inputsRowCustom">
                    <div className="groupCustom">
                        <input
                            type="text"
                            name="descripcion_egreso"
                            value={descripcionEgreso}
                            onChange={(e) => setDescripcionEgreso(e.target.value)}
                            className="inputCustom"
                            required
                        />
                        <label>Descripción del Egreso</label>
                    </div>
                    <div className='groupCustom'>
                        <input 
                            type='number'
                            name='cantidad_egreso'
                            value={cantidadEgreso}
                            onChange={(e) => setCantidadEgreso(e.target.value)}
                            className='inputCustom'
                            required
                        />
                        <label>Cantidad del Egreso</label>
                    </div>
                    <div className='groupCustom'>
                        <input 
                            type='number'
                            value={valorEgreso}
                            onChange={(e) => setValorEgreso(e.target.value)}
                            className='inputCustom'
                            required
                        />
                        <label>Valor del Egreso</label>
                    </div>
                    <div className='groupCustom'>
                        <input 
                            type='number'
                            name='valor_egreso'
                            value={valorEgreso}
                            onChange={(e) => setValorEgreso(e.target.value)}
                            className='inputCustom'
                            required
                        />
                        <label>Valor del Egreso</label>
                    </div>
                    <div className='groupCustom'>
                        <input 
                            type='text'
                            name='id_producto'
                            value={idProducto}
                            onChange={(e) => setIdProducto(e.target.value)}
                            className='inputCustom'
                        />
                        <label>ID Producto</label>
                    </div>
                    <div className='buttonsCustom'>
                        <button type='submit' className='crudBtnCustom' >
                            Crear Egreso
                        </button>
                        <button type='button' className='crudBtnCustom' >
                            Buscar Egreso
                        </button>
                        <button type='button' className='crudBtnCustom' >
                            Actualizar Egreso
                        </button>
                        <button type='button' className='crudBtnCustom' >
                            Limpiar Formulario
                        </button>
                        <button type='button' className='crudBtnCustom' >
                            Listar Todos
                        </button>
                    </div>
                </div>
                <div className="egresosListCustom">
                    <h2 className="ListegresosTitleCustom">Lista de Egresos</h2>
                    <div className="egresosTableCustom">
                        <div className="EgresosTableHeaderCustom">
                            <div>ID Egreso</div>
                            <div>Descripción</div>
                            <div>Cantidad</div>
                            <div>Valor</div>
                            <div>Fecha</div>
                        </div>
                        <div className="egresosTableBodyCustom">
                            {egresos.map((item, index) => (
                                <div key={index} className="egresosTableRowCustom">
                                    <div>{item.id_egreso}</div>
                                    <div>{item.descripcion_egreso}</div>
                                    <div>{item.valor_egreso}</div>    
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EgresosPage;