import React from "react";

const ChangePassword = () => {
  return (
    <div className="loginContainer">
      <h1 className="loginTitle">Cambiar Contraseña</h1>
      <div className="loginForm">
        <form>
          <div className="inputGroup">
            <input 
              type="password"
              name="password_old"
              required
              className="input-style"
              placeholder="Contraseña Antigua"
            />
            <input
              type="password"
              name="password"
              required
              className="input-style"
              placeholder="Contraseña Nueva"
            />
          </div>
          <div className="inputGroup">
            <input
              type="password"
              name="password_confirmation"
              required
              className="input-style"
              placeholder="Confirmar Contraseña"
            />
          </div>
          <button type="submit" className="loginButton">
            Cambiar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;