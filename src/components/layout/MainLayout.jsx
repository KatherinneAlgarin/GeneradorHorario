import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "../../services/supabaseClient";
import { getUserRole} from "../../services/authService";
import '../../styles/Layout.css';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole =async () => {
      const userRole = await getUserRole();
      setRole(userRole?.rol);
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate("/login");
};

  return (
    <div className="layout-container">
      
      <aside className="sidebar">
        <div className="sidebar-logo">UNICAES</div>
        
        <ul className="nav-links">

          {role === "admin_general" && (
            <>
              <li className="nav-item">
                <Link to="/admin" className="nav-link">
                  Dashboard
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/admin/academico" className="nav-link">
                  Gestión Académica
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/admin/infraestructura" className="nav-link">
                  Infraestructura
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/admin/docentes" className="nav-link">
                  Gestión Usuarios
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/admin/horarios" className="nav-link">
                  Horarios
                </Link>
              </li>
            </>
          )}

          {role === "decano" && (
            <>
              <li className="nav-item">
                <Link to="/decano" className="nav-link">
                  Dashboard
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/decano/docentes" className="nav-link">
                  Gestión Docente
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/decano/academico" className="nav-link">Gestión Académica</Link>
              </li>

              <li className="nav-item">
                <Link to="/decano/horarios" className="nav-link">
                  Horarios Facultad
                </Link>
              </li>
            </>
          )}

          {role === "docente" && (
            <>
              <li className="nav-item">
                <Link to="/docente" className="nav-link">
                  Inicio
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/docente/disponibilidad" className="nav-link">
                  Mi Disponibilidad
                </Link>
              </li>
            </>
          )}

        </ul>
      </aside>

      <header className="header">
        <div className="header-title">
          {role === "admin_general" && "Panel Administrativo"}
          {role === "decano" && "Panel Decano"}
          {role === "docente" && "Panel Docente"}
        </div>
        <div className="user-profile">
          <span>Hola, <strong>{role}</strong></span>
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