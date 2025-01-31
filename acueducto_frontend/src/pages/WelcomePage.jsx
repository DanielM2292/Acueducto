import React from "react";
import { LogoAcueducto } from "../imagenes/LogoAcueducto.png"

const WelcomePage = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="header">
          <div className="logo-container">
            <LogoAcueducto viewBox="0 0 24 24" fill="#2c3e50" className="logo">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </LogoAcueducto>
          </div>
          <h1>Sistema de Facturación Acueducto</h1>
          <p className="tagline">"Gestionando el flujo de recursos con transparencia y eficiencia"</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">📄</div>
            <h3>Facturación</h3>
            <p>Gestión eficiente de facturas y cobros para el servicio de acueducto</p>
          </div>
          <div className="feature-card">
            <div className="icon">🧮</div>
            <h3>Contabilidad</h3>
            <p>Control preciso de ingresos, egresos y balance financiero</p>
          </div>
          <div className="feature-card">
            <div className="icon">👥</div>
            <h3>Gestión de Clientes</h3>
            <p>Administración integral de usuarios y sus servicios</p>
          </div>
          <div className="feature-card">
            <div className="icon">💰</div>
            <h3>Pagos</h3>
            <p>Registro y control de pagos de servicios de acueducto</p>
          </div>
        </div>

        <footer>
          <p>© 2024 Sistema de Facturación Acueducto. Todos los derechos reservados.</p>
        </footer>
      </div>

      <style jsx>{`
        .welcome-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #BCEEFF);
          font-family: Arial, sans-serif;
          margin: 0 auto;
          padding: 0;
        }

        .welcome-content {
          background-color: #53D4FF;
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 40px;
          max-width: 900px;
          width: 100%;
          text-align: center;
        }

        .header {
          margin-bottom: 30px;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .logo {
          width: 80px;
          height: 80px;
        }

        h1 {
          color: #2c3e50;
          font-size: 2.5rem;
          margin-bottom: 15px;
        }

        .tagline {
          color: #34495e;
          font-size: 1.2rem;
          font-style: italic;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .feature-card {
          background-color: #f1f8ff;
          border-radius: 10px;
          padding: 20px;
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: scale(1.05);
        }

        .icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .feature-card h3 {
          color: #2980b9;
          margin-bottom: 10px;
        }

        .feature-card p {
          color: #7f8c8d;
        }

        footer {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
