import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/ErrorPages.css';

const NotFound = () => {
  return (
    <div className="error-page-container">
      <div className="error-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Página No Encontrada</h1>
        <p className="error-message">
          La página que estás buscando no existe o ha sido eliminada.
        </p>
        <div className="error-actions">
          <Link to="/" className="btn-error-primary">
            Ir al Inicio
          </Link>
          <button onClick={() => window.history.back()} className="btn-error-secondary">
            Volver Atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
