import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import FacturacionPage from './pages/FacturacionPage';
import ClientesPage from './pages/ClientesPage';
import MultasPage from './pages/MultasPage';
import MatriculasPage from './pages/MatriculasPage';
import PagosPage from './pages/PagosPage';
import IngresosPage from './pages/IngresosPage';
import EgresosPage from './pages/EgresosPage';
import InventarioPage from './pages/InventarioPage';
import CreateUser from './pages/CreateUser';
import ChangePassword from './pages/ChangePassword';
import ListarUser from './pages/ListarUser';
import WelcomePage from './pages/WelcomePage'; 
import VerHistorialPage from './pages/VerHistorialPage';
import TarifaPage from './pages/TarifaPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                    path="/app/*"
                    element={
                        <div className="appLayout">
                            <Sidebar />
                            <div className="content">
                                <Routes>
                                    <Route path="welcome" element={<WelcomePage />} />
                                    <Route path="facturacion" element={<FacturacionPage />} />
                                    <Route path="clientes" element={<ClientesPage />} />
                                    <Route path="multas" element={<MultasPage />} />
                                    <Route path="matriculas" element={<MatriculasPage />} />
                                    <Route path="pagos" element={<PagosPage />} />
                                    <Route path="ingresos" element={<IngresosPage />} />
                                    <Route path="egresos" element={<EgresosPage />} />
                                    <Route path="inventario" element={<InventarioPage />} />
                                    <Route path="crear_usuario" element={<CreateUser />} />
                                    <Route path="cambiar_contraseña" element={<ChangePassword />} />
                                    <Route path="listar_usuarios" element={<ListarUser />} />
                                    <Route path="ver_historial" element={<VerHistorialPage />} />
                                    <Route path="tarifa" element={<TarifaPage />} />
                                    <Route path="*" element={<Navigate to="welcome" />} />
                                </Routes>
                            </div>
                        </div>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
