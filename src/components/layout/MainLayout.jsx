import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/Layout.css';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="layout-container">
      
      <aside className="sidebar">
        <div className="sidebar-logo">UNICAES</div>
        
        <ul className="nav-links">
          <li className="nav-item">
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link 
                to="/admin/academico" 
                className={`nav-link ${location.pathname.includes('/academico') ? 'active' : ''}`}
            >
              Gestión Académica
            </Link>
          </li>

          <li className="nav-item">
            <Link 
                to="/admin/infraestructura" 
                className={`nav-link ${location.pathname.includes('/infraestructura') ? 'active' : ''}`}
            >
              Infraestructura
            </Link>
          </li>
          
          <li className="nav-item">
            <Link 
                to="/admin/docentes" 
                className={`nav-link ${location.pathname.includes('/docentes') ? 'active' : ''}`}
            >
              Gestión Docente
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/admin/horarios" className="nav-link">
              Horarios
            </Link>
          </li>
        </ul>
      </aside>

      <header className="header">
        <div className="header-title">Panel de Administración</div>
        <div className="user-profile">
          <span>Hola, <strong>Administrador</strong></span>
          <button onClick={handleLogout} className="btn-logout">Salir</button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;