import React, { useState } from "react";

const CreateUser = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        nombre_usuario: "",
        password: "",
        id_rol: "ROL001",
        id_estado_empleado: "ESTA001",
    });

    const [message, setMessage] = useState("");

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
            const response = await fetch("http://localhost:9090/register", {
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
                notify("Usuario creado exitosamente");
                setFormData({ nombre: "", nombre_usuario: "", password: "", id_rol: "ROL001" });
            } else {
                notify(data.message || "Error al crear el usuario");
            }
        } catch (error) {
            notify("Error de conexión con el servidor");
            console.error("Error:", error);
        }
    };

    return (
        <div className="loginContainer">
            <h1 className="loginTitle">Crear un nuevo usuario</h1>
            {message && (
                <div className={`message ${message.includes("exitosamente") ? "success" : "error"}`}>
                    {message}
                </div>
            )}
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
                            <option value="ROL001">Administrador</option>
                            <option value="ROL002">Contador</option>
                            <option value="ROL003">Secretario</option>
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
