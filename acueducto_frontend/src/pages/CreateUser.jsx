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
        <div className="page-container">
            <ToastContainer />
            <div className="create-user-container">
                <div className="form-header">
                    <h1 className="form-title">Crear Nuevo Usuario</h1>
                    <p className="form-subtitle">Ingresa la información del usuario</p>
                </div>
                
                <div className="form-card">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="styled-input"
                            placeholder="Nombre Completo"
                        />
                        
                        <input
                            type="text"
                            name="nombre_usuario"
                            value={formData.nombre_usuario}
                            onChange={handleChange}
                            required
                            className="styled-input"
                            placeholder="Nombre de Usuario"
                        />
                        
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="styled-input"
                            placeholder="Contraseña"
                        />
                        
                        <select
                            name="id_rol"
                            value={formData.id_rol}
                            onChange={handleChange}
                            className="styled-select"
                            required
                        >
                            <option value="ROL0001">Administrador</option>
                            <option value="ROL0002">Contador</option>
                            <option value="ROL0003">Secretario</option>
                        </select>
                        
                        <button type="submit" className="submit-button">Crear Usuario</button>
                    </form>
                </div>
            </div>
            
            <style jsx>{`
                /* Contenedor principal */
                .page-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    font-family: 'Poppins', sans-serif;
                }
                
                .create-user-container {
                    width: 100%;
                    max-width: 400px;
                }
                
                .form-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .form-title {
                    font-size: 26px;
                    color: #333;
                    font-weight: 700;
                }
                
                .form-subtitle {
                    color: #555;
                    font-size: 14px;
                }
                
                /* Tarjeta del formulario */
                .form-card {
                    background-color: white;
                    border-radius: 12px;
                    padding: 25px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .form-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
                }
                
                /* Inputs y select con animaciones */
                .styled-input, .styled-select {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    font-size: 16px;
                    outline: none;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.8);
                }

                .styled-input:focus, .styled-select:focus {
                    border-color: #007bff;
                    box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
                    transform: scale(1.02);
                }

                .styled-select {
                    cursor: pointer;
                }
                
                /* Botón con animaciones */
                .submit-button {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
                    transform: translateY(0);
                }
                
                .submit-button:hover {
                    background: linear-gradient(135deg, #0056b3, #003d7a);
                    transform: translateY(-3px);
                    box-shadow: 0 6px 15px rgba(0, 123, 255, 0.6);
                }

                .submit-button:active {
                    transform: translateY(0);
                    box-shadow: 0 4px 10px rgba(0, 123, 255, 0.4);
                }

                /* Responsive */
                @media (max-width: 480px) {
                    .form-card {
                        padding: 20px;
                    }
                    
                    .form-title {
                        font-size: 22px;
                    }
                }
            `}</style>
        </div>
    );
};

export default CreateUser;
