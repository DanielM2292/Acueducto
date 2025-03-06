import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AcueductoLogo from '../imagenes/LogoAcueducto.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('ROL0001');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append('email', username);
      formData.append('password', password);
      const response = await fetch('http://localhost:9090/auth/verify_role', {
        method: "POST",
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const realRole = data.rol
        console.log(data)

        if (realRole !== rol) {
          toast.error("El rol seleccionado no coincide con tu rol asignado. Por favor, selecciona el rol correcto.");
          return;
        }
        formData.append('rol', rol);

        const loginResponse = await fetch('http://localhost:9090/auth/login', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          localStorage.setItem('userRole', rol);
          localStorage.setItem('userName', username);
          console.log(data);
          navigate('/app');
        } else {
          const errorData = await loginResponse.json();
          if (errorData.message?.includes('password')) {
            toast.error('Contraseña incorrecta');
          } else {
            toast.error('Error al iniciar sesión');
          }
        }
      } else {
        const errorData = await response.json();
        if (errorData.message?.includes('user')) {
          toast.error('Usuario no encontrado');
        } else {
          toast.error('Error al verificar credenciales');
        }
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className='logoContainer'>
        <img src={AcueductoLogo} alt='Acueducto Logo' className='logo' />
        <h1 className='textoLogo'>Agua Pura, Vida Segura</h1>
      </div>
      <div className="loginContainer">
        <h2 className="loginTitle">Iniciar Sesión</h2>
        <form className="loginForm" onSubmit={handleLogin}>
          <div className="coolinput">
            <label htmlFor="username" className="text">Usuario:</label>
            <input
              id="username"
              type="text"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="input"
            />
          </div>

          <div className="coolinput">
            <label htmlFor="password" className="text">Contraseña:</label>
            <input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="input"
            />
          </div>

          <div className="coolinput">
            <label htmlFor="role" className="text">Rol:</label>
            <select
              id="role"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
              className="input"
            >
              <option value="ROL0001">Administrador</option>
              <option value="ROL0002">Contador</option>
              <option value="ROL0003">Secretario</option>
            </select>
          </div>
          <button type="submit" className="loginButton">
            Iniciar Sesión
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;