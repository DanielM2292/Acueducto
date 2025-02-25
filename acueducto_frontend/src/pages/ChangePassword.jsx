import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChangePassword = () => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      password: formData.get('password_old'),
      new_password: formData.get('password'),
    };

    try {
      const response = await fetch('/changuePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || "Contraseña cambiada exitosamente");
      } else {
        toast.error(result.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error de conexión. Intenta nuevamente.");
    }
  };

  return (
    <div className="changePasswordContainer">
      <form className="form" onSubmit={handleSubmit}>
        <h1 id="heading">Cambiar Contraseña</h1>
        <div className="field">
          <input 
            type="password"
            name="password_old"
            required
            className="input-field"
            placeholder="Contraseña Antigua"
          />
        </div>
        <div className="field">
          <input
            type="password"
            name="password"
            required
            className="input-field"
            placeholder="Contraseña Nueva"
          />
        </div>
        <div className="field">
          <input
            type="password"
            name="password_confirmation"
            required
            className="input-field"
            placeholder="Confirmar Contraseña"
          />
        </div>
        <div className="btn">
          <button type="submit" className="button1">
            Cambiar Contraseña
          </button>
        </div>
      </form>
      <ToastContainer />
      <style jsx>{`
        .changePasswordContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: auto; 
          padding: 20px; 
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 400px;
          padding-left: 2em;
          padding-right: 2em;
          padding-bottom: 0.4em;
          background-color: #53D4FF;
          border-radius: 25px;
          transition: .4s ease-in-out;
        }

        .form:hover {
          transform: scale(1.05);
          border: 1px solid black;
        }

        #heading {
          text-align: center;
          margin: 2em 0;
          color: rgb(255, 255, 255);
          font-size: 1.2em;
        }

        .field {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5em;
          border-radius: 7px;
          padding: 0.6em;
          border: none;
          outline: none;
          color: white;
          background-color: #BCEEFF;
        }

        .input-field {
          background: none;
          border: none;
          outline: none;
          width: 100%;
          font-size: 15px;
          color:rgb(0, 0, 0);
        }

        .btn {
          display: flex;
          justify-content: center;
          flex-direction: row;
          margin-top: 2.5em;
        }

        .button1 {
          padding: 0.5em;
          padding-left: 1.1em;
          padding-right: 1.1em;
          border-radius: 5px;
          margin-right: 0.5em;
          border: none;
          outline: none;
          transition: .4s ease-in-out;
          background-color:rgb(7, 40, 255);
          color: white;
        }

        .button1:hover {
          background-color: rgb(1, 25, 179);
          color: white;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .changePasswordContainer {
            padding: 10px;
          }

          .form {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;