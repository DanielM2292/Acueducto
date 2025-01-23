import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AcueductoLogo from '../imagenes/LogoAcueducto.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('ROL001');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append('email', username);
      formData.append('password', password);
      const response = await fetch('http://localhost:9090/verify_role', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const realRole = data.rol;

        if (realRole !== rol) {
          alert("El rol seleccionado no coincide con el rol real del usuario. Por favor, selecciona el rol correcto.");
          return;
        }
        formData.append('rol', rol);
        const loginResponse = await fetch('http://localhost:9090/login', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (loginResponse.ok) {
          localStorage.setItem('userRole', rol);
          navigate('/app');
        } else {
          setError('Usuario o contraseña incorrectos');
        }
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div>
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
              placeholder="Escribe aquí..."
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
              placeholder="Escribe aquí..."
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
              <option value="ROL001">Administrador</option>
              <option value="ROL002">Contador</option>
              <option value="ROL003">Secretario</option>
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
