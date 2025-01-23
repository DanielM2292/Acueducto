import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListarUser = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newEstado, setNewEstado] = useState("");

    const fetchUsuarios = async () => {
        try {
            const response = await fetch("http://localhost:9090/listar_usuarios");
            const data = await response.json();
            if (response.ok) {
                setUsuarios(data);
            } else {
                toast.error("Error al obtener los usuarios");
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor");
            console.error("Error:", error);
        }
    };

    const handleEstadoChange = (e) => {
        setNewEstado(e.target.value);
    };

    const handleEditEstado = async () => {
        if (selectedUser && newEstado) {
            try {
                const response = await fetch(`http://localhost:9090/actualizar_estado_usuario?id_administrador=${selectedUser.id_administrador}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id_estado_empleado: newEstado }),
                });
                const data = await response.json();
                if (response.ok) {
                    toast.success("Estado del usuario actualizado exitosamente");
                    fetchUsuarios();
                } else {
                    toast.error(data.message || "Error al actualizar el estado del usuario");
                }
            } catch (error) {
                toast.error("Error de conexión con el servidor");
                console.error("Error:", error);
            }
        } else {
            toast.error("Selecciona un usuario y un nuevo estado");
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    return (
        <div className="UserList" style={{ fontFamily: "Fredoka, sans-serif" }}>
            <ToastContainer />
            <h1 className="pagesTitle">Listar Usuarios</h1>
            <div className="userTable">
                <div className="userTableHeader">
                    <div>ID Administrador</div>
                    <div>Nombre</div>
                    <div>Nombre de Usuario</div>
                    <div>Estado</div>
                    <div>Rol</div>
                    <div>Editar Estado</div>
                </div>
                <div className="userTableBody">
                    {usuarios.length > 0 ? (
                        usuarios.map((user) => (
                            <div key={user.id_administrador} className="userTableRow">
                                <div>{user.id_administrador}</div>
                                <div>{user.nombre}</div>
                                <div>{user.nombre_usuario}</div>
                                <div>{user.id_estado_empleado}</div>
                                <div>{user.id_rol}</div>
                                <div>
                                    <button className="editButton" onClick={() => setSelectedUser(user)}>
                                        <span className="label">Editar Estado</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No se encontraron usuarios.</p>
                    )}
                </div>
            </div>
            {selectedUser && (
                <div className="editEstado">
                    <h2>Editar Estado de {selectedUser.nombre}</h2>
                    <select className="estadoSelect" value={newEstado} onChange={handleEstadoChange}>
                        <option value="">Selecciona un estado</option>
                        <option value="ESTA001">Activo</option>
                        <option value="ESTA002">Inactivo</option>
                        <option value="ESTA003">Suspendido</option>
                    </select>
                    <button className="updateButton" onClick={handleEditEstado}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-arrow-repeat"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
                            ></path>
                            <path
                                fill-rule="evenodd"
                                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                            ></path>
                        </svg>
                        Actualizar Estado
                    </button>
                </div>
            )}
        </div>
    );
};

export default ListarUser;
