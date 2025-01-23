import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClientesPage = () => {
    const [noClientsFound, setNoClientsFound] = useState(false);

    const [formData, setFormData] = useState({
        id_cliente: "",
        tipo_documento: "C.C",
        numero_documento: "",
        nombre: "",
        telefono: "",
        direccion: "",
        id_estado_cliente: "ESTCLI001",
        id_tarifa_estandar: "TAREST001",  // Añadido
        id_tarifa_medidor: ""  // Añadido
    });

    const [clientes, setClientes] = useState([]);

    const estadosCliente = {
        "ESTCLI001": "Activo",
        "ESTCLI002": "Inactivo",
        "ESTCLI003": "Suspendido"
    };

    const tarifas = {
        "TAREST001": "Tarifa Residencial",
        "TAREST002": "Tarifa Quesera",
        "TAREST003": "Tarifa Matadero",
        "TAREST004": "Tarifa Marranera",
        "TARMED001": "Tarifa Finca"
    };

    const notify = (message, type) => {
        if (type === "success") {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:9090/agregar_cliente", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                notify("Cliente agregado exitosamente", "success");
                resetForm();
                fetchAllClientes();
            } else {
                notify(data.message || "Error al agregar el cliente", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            id_cliente: "",
            tipo_documento: "C.C",
            numero_documento: "",
            nombre: "",
            telefono: "",
            direccion: "",
            id_estado_cliente: "ESTCLI001",
            id_tarifa_estandar: "TAREST001",  // Añadido
            id_tarifa_medidor: ""  // Añadido
        });
    };

    const fetchClienteById = async () => {
        if (!formData.id_cliente) {
            notify("Por favor, ingrese un ID de cliente", "error");
            return;
        }
        try {
            const response = await fetch(`http://localhost:9090/buscar_cliente?id_cliente=${formData.id_cliente}`);
            const data = await response.json();
            if (response.ok) {
                setFormData(data);
                notify("Cliente encontrado", "success");
            } else {
                notify("Cliente no encontrado", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleEdit = async () => {
        if (!formData.id_cliente) {
            notify("Por favor, seleccione un cliente para editar", "error");
            return;
        }
        try {
            const response = await fetch(`http://localhost:9090/actualizar_cliente?id_cliente=${formData.id_cliente}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                notify("Cliente actualizado exitosamente", "success");
                resetForm();
                fetchAllClientes();
            } else {
                notify(data.message || "Error al actualizar el cliente", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleDelete = async () => {
        if (!formData.id_cliente) {
            notify("Por favor, seleccione un cliente para eliminar", "error");
            return;
        }
        if (window.confirm("¿Está seguro de que desea eliminar este cliente?")) {
            try {
                const response = await fetch(`http://localhost:9090/eliminar_cliente?id_cliente=${formData.id_cliente}`, {
                    method: "DELETE",
                });
                const data = await response.json();
                if (response.ok) {
                    notify("Cliente eliminado exitosamente", "success");
                    resetForm();
                    fetchAllClientes();
                } else {
                    notify(data.message || "Error al eliminar el cliente", "error");
                }
            } catch (error) {
                notify("Error de conexión con el servidor", "error");
                console.error("Error:", error);
            }
        }
    };

    const fetchAllClientes = async () => {
        try {
            const response = await fetch("http://localhost:9090/buscar_todos_clientes");
            const data = await response.json();
            if (response.ok) {
                setClientes(data);
                setNoClientsFound(data.length === 0);
            } else {
                notify("Error al obtener los clientes", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
            console.error("Error:", error);
        }
    };

    const handleRowClick = (cliente) => {
        setFormData(cliente);
    };

    useEffect(() => {
        fetchAllClientes();
    }, []);

    return (
        <div className="ClientesPageCustom">
            <ToastContainer />
            <h1 className="pagesTitleCustom">Gestión de Clientes</h1>

            <form className="FormContainerCustom" onSubmit={handleSubmit}>
                <div className="inputsRowCustom">
                    <div className="groupCustom">
                        <input
                            type="text"
                            name="id_cliente"
                            value={formData.id_cliente}
                            onChange={handleChange}
                            className="inputCustom"
                            placeholder="CLI001"
                        />
                        <span className="highlightCustom"></span>
                        <span className="barCustom"></span>
                        <label>ID Cliente</label>
                    </div>

                    <div className="groupCustom">
                        <select
                            name="tipo_documento"
                            value={formData.tipo_documento}
                            onChange={handleChange}
                            className="inputCustom"
                        >
                            <option value="C.C">C.C</option>
                            <option value="Nit">Nit</option>
                        </select>

                        <label>Tipo de Documento</label>
                    </div>

                    <div className="groupCustom">
                        <input
                            type="text"
                            name="numero_documento"
                            value={formData.numero_documento}
                            onChange={handleChange}
                            className="inputCustom"
                            required
                        />
                        <span className="highlightCustom"></span>
                        <span className="barCustom"></span>
                        <label>Número de Documento</label>
                    </div>

                    <div className="groupCustom">
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="inputCustom"
                            required
                        />
                        <span className="highlightCustom"></span>
                        <span className="barCustom"></span>
                        <label>Nombre</label>
                    </div>

                    <div className="groupCustom">
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="inputCustom"
                            required
                        />
                        <span className="highlightCustom"></span>
                        <span className="barCustom"></span>
                        <label>Teléfono</label>
                    </div>

                    <div className="groupCustom">
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            className="inputCustom"
                            required
                        />
                        <span className="highlightCustom"></span>
                        <span className="barCustom"></span>
                        <label>Dirección</label>
                    </div>

                    <div className="groupCustom">
                        <select
                            name="id_estado_cliente"
                            value={formData.id_estado_cliente}
                            onChange={handleChange}
                            className="inputCustom"
                        >
                            <option value="ESTCLI001">Activo</option>
                            <option value="ESTCLI002">Inactivo</option>
                            <option value="ESTCLI003">Suspendido</option>
                        </select>
                        <label>Estado</label>
                    </div>

                    <div className="groupCustom">
                        <select
                            name="id_tarifa"
                            value={formData.id_tarifa}
                            onChange={handleChange}
                            className="inputCustom"
                            required
                        >
                            <option value="TAREST001">Tarifa Residencial</option>
                            <option value="TAREST002">Tarifa Quesera</option>
                            <option value="TAREST003">Tarifa Matadero</option>
                            <option value="TAREST004">Tarifa Marranera</option>
                            <option value="TARMED001">Tarifa Finca</option>
                        </select>
                        <label>Tipo de Tarifa</label>
                    </div>
                </div>

                <div className="buttonsCustom">
                    <button type="submit" className="crudBtnCustom">
                        Crear Cliente
                    </button>
                    <button type="button" className="crudBtnCustom" onClick={fetchClienteById}>
                        Buscar por ID
                    </button>
                    <button type="button" className="crudBtnCustom" onClick={handleEdit}>
                        Actualizar
                    </button>
                    <button type="button" className="btnEliminarCustom" onClick={handleDelete}>
                        Eliminar
                    </button>
                    <button type="button" className="crudBtnCustom" onClick={fetchAllClientes}>
                        Listar Todos
                    </button>
                    <button type="button" className="crudBtnCustom" onClick={resetForm}>
                        Limpiar Formulario
                    </button>
                </div>
            </form>

            <div className="ClientListCustom">
                <h2 className="ListClientTitleCustom">Lista de Clientes</h2>
                <div className="clientTableCustom">
                    <div className="clientTableHeaderCustom">
                        <div>ID Cliente</div>
                        <div>Tipo Documento</div>
                        <div>Número Documento</div>
                        <div>Nombre</div>
                        <div>Teléfono</div>
                        <div>Dirección</div>
                        <div>Estado</div>
                        <div>Matrícula</div>
                        <div>Tarifa</div>
                    </div>
                    <div className="clientTableBodyCustom">
                        {clientes.map((cliente) => (
                            <div
                                key={cliente.id_cliente}
                                className="clientTableRowCustom"
                                onClick={() => handleRowClick(cliente)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div>{cliente.id_cliente}</div>
                                <div>{cliente.tipo_documento}</div>
                                <div>{cliente.numero_documento}</div>
                                <div>{cliente.nombre}</div>
                                <div>{cliente.telefono}</div>
                                <div>{cliente.direccion}</div>
                                <div>{estadosCliente[cliente.id_estado_cliente]}</div>
                                <div>{cliente.id_matricula}</div>
                                <div>{tarifas[cliente.id_tarifa_estandar] || tarifas[cliente.id_tarifa_medidor]}</div> {/* Actualizado */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientesPage;
