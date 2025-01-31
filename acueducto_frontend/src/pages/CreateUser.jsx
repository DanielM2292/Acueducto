import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateUser = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        nombre_usuario: "",
        password: "",
        id_rol: "ROL0001",
        id_estado_empleado: "EMP0001",
    });

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
            const response = await fetch("http://localhost:9090/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                mode: "cors",
                credentials: "include",
                body: JSON.stringify({
                    id_estado_empleado: "1",
                    ...formData,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Usuario creado exitosamente");
                setFormData({ nombre: "", nombre_usuario: "", password: "", id_rol: "ROL0001", id_estado_empleado: "EMP0001" });
            } else {
                toast.error(data.message || "Error al crear el usuario");
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor");
            console.error("Error:", error);
        }
    };

    return (
        <div className="loginContainer">
            <ToastContainer />
            <h1 className="loginTitle">Crear un nuevo usuario</h1>
            <div className="loginForm">
                <form onSubmit={handleSubmit}>
                    <div className="inputGroup">
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="input-style"
                            placeholder="Nombre Completo"
                        />
                    </div>
                    <div className="inputGroup">
                        <input
                            type="text"
                            name="nombre_usuario"
                            value={formData.nombre_usuario}
                            onChange={handleChange}
                            required
                            className="input-style"
                            placeholder="Nombre de Usuario"
                        />
                    </div>
                    <div className="inputGroup">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="input-style"
                            placeholder="Contraseña"
                        />
                    </div>
                    <div className="inputGroup">
                        <select
                            name="id_rol"
                            value={formData.id_rol}
                            onChange={handleChange}
                            className="styledSelect"
                            required
                        >
                            <option value="ROL0001">Administrador</option>
                            <option value="ROL0002">Contador</option>
                            <option value="ROL0003">Secretario</option>
                        </select>
                    </div>
                    <button type="submit" className="loginButton">
                        Crear Usuario
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateUser;
