import React, { useState } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaSearch } from "react-icons/fa";

const IngresosPage = () => {
    const [idIngreso, setIdIngreso] = useState("");
    const [descripcionIngreso, setDescripcionIngreso] = useState("");
    const [valorIngreso, setValorIngreso] = useState("");
    const [idMatricula, setIdMatricula] = useState("");
    const [idMulta, setIdMulta] = useState("");
    const [idPago, setIdPago] = useState("");
    const [idProducto, setIdProducto] = useState("");
    const [ingresos, setIngresos] = useState([]);
    const [editMode, setEditMode] = useState(false);

    return (
        <div className='IngresosPageCustom'>
            <ToastContainer />
            <h1 className="pagesTitleCustom">Gestión de Ingresos</h1>
            <div className="formIngresosCustom">
                <div className="inputsRowCustom">
                    <div className="groupCustom">
                        <input
                            type="text"
                            name="descripcion_ingreso"
                            value={descripcionIngreso}
                            onChange={(e) => setDescripcionIngreso(e.target.value)}
                            className="inputCustom"
                            required
                        />
                        <label>Descripción del Ingreso</label>
                    </div>
                    <div className='groupCustom'>
                        <input 
                            type='number'
                            name='valor_ingreso'
                            value={valorIngreso}
                            onChange={(e) => setValorIngreso(e.target.value)}
                            className='inputCustom'
                            required
                        />
                        <label>Valor del Ingreso</label>
                    </div>
                    <div className='groupCustom'>
                        <input 
                            type='text'
                            name='id_matricula'
                            value={idMatricula}
                            onChange={(e) => setIdMatricula(e.target.value)}
                            className='inputCustom'
                        />
                        <label>ID Matricula</label>
                    </div>
                    <div className='groupCustom'>
                        <input 
                            type='text'
                            name='id_multa'
                            value={idMulta}
                            onChange={(e) => setIdMulta(e.target.value)}
                            className='inputCustom'
                        />
                        <label>ID Multa</label>
                    </div>
                    <div className='groupCustom'>
                        <input 
                            type='text'
                            name='id_pago'
                            value={idPago}
                            onChange={(e) => setIdPago(e.target.value)}
                            className='inputCustom'
                        />
                        <label>ID Pago</label>
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
                            Crear Ingreso
                        </button>
                        <button type='button' className='crudBtnCustom' >
                            Buscar Ingreso
                        </button>
                        <button type='button' className='crudBtnCustom' >
                            Actualizar Ingreso
                        </button>
                        <button type='button' className='crudBtnCustom' >
                            Limpiar Formulario
                        </button>
                        <button type='button' className='crudBtnCustom' >
                            Listar Todos
                        </button>
                    </div>
                </div>
                <div className="IngresosListCustom">
                    <h2 className="ListIngresosTitleCustom">Lista de Ingresos</h2>
                    <div className="ingresosTableCustom">
                        <div className="ingresosTableHeaderCustom">
                            <div>ID Ingreso</div>
                            <div>Descripción</div>
                            <div>Valor</div>
                            <div>Fecha</div>
                        </div>
                        <div className="ingresosTableBodyCustom">
                            {ingresos.map((item, index) => (
                                <div key={index} className="ingresosTableRowCustom">
                                    <div>{item.id_ingreso}</div>
                                    <div>{item.descripcion_ingreso}</div>
                                    <div>{item.valor_ingreso}</div>    
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IngresosPage;