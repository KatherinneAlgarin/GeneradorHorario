import React from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Filtro from '../../components/common/Filtro';
import Card from '../../components/common/Card'; 
import ModalGeneral from '../../components/common/ModalGeneral'; 
import { useDocentesDecano } from '../../hooks/useDocentesDecano';
import '../../styles/AdminDashboard.css';
import '../../styles/Decano.css'; 

const GestorDocentesDecano = () => {
  const { 
    docentes, loading, estadisticas,
    searchTerm, setSearchTerm, 
    filterTipo, setFilterTipo,         
    filterEstado, setFilterEstado,
    columns, modalDocente, cerrarModal
  } = useDocentesDecano();

  return (
    <div className="dashboard-container">
      
      <div className="page-header">
        <div>
          <h2>Gestión y Monitoreo Docente</h2>
          <p className="text-muted">Directorio de la facultad y estado de la carga académica post-generación de horarios.</p>
        </div>
      </div>

      <div className="stats-grid">
        <Card title="Total Facultad" icon="👥" value={estadisticas.total} label="Docentes registrados" />
        <Card title="Carga Cumplida" icon="✅" value={estadisticas.optimas} label="Al tope de su contrato" subColor="#2E7D32" />
        <Card title="Disponibles" icon="🟢" value={estadisticas.disponibles} label="Pueden dar más clases" subColor="#1565C0" />
        <Card title="Requieren Atención" icon="⚠️" value={estadisticas.atencion} label="Sobrecarga o incompletos" subColor="#D32F2F" />
      </div>

      <div className="filters-bar filters-bar-advanced">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre, apellido o correo..." />
        <Filtro value={filterTipo} onChange={setFilterTipo} defaultLabel="Todos los contratos" options={[{ label: 'Tiempo Completo', value: 'Tiempo Completo' }, { label: 'Hora Clase', value: 'Hora Clase' }]} />
        <Filtro 
          value={filterEstado} onChange={setFilterEstado} defaultLabel="Todos los estados"
          options={[
            { label: 'Cumplida / Óptima', value: 'optima' },
            { label: 'Disponibles (Pueden dar más)', value: 'disponible' },
            { label: 'Carga Incompleta', value: 'incompleta' },
            { label: 'Sin Carga', value: 'sin_carga' },
            { label: 'Sobrecarga (Error)', value: 'sobrecarga' }
          ]} 
        />
      </div>

      {loading ? (
        <div className="loading-container">Calculando cargas académicas...</div>
      ) : (
        <Table columns={columns} data={docentes} />
      )}

      <ModalGeneral
        isOpen={!!modalDocente}
        onClose={cerrarModal}
        title={`Detalle de Carga: ${modalDocente?.nombres} ${modalDocente?.apellidos}`}
        footer={<button className="btn-cancel" onClick={cerrarModal}>Cerrar</button>}
      >
        {modalDocente && (
          <div>
            <h4 className="modal-section-title">Resumen de Horas Semanales</h4>
            
            <div className="info-card-summary">
              <div className="info-row">
                <strong>Mínimo Contractual:</strong>
                <span className="stat-value-large">{modalDocente.carga_minima} hrs</span>
              </div>
              <div className="info-row">
                <strong>Máximo Permitido:</strong>
                <span className="stat-value-large">{modalDocente.carga_maxima} hrs</span>
              </div>
              <div className="info-row full-width">
                <strong>Horas Asignadas (Actual):</strong>
                <span className={`stat-value-large ${modalDocente.estadoCarga.isProblem ? 'stat-value-alert' : 'stat-value-success'}`}>
                  {modalDocente.horas_asignadas} hrs
                </span>
              </div>
            </div>

            <div className="modal-detail-box">
              <span className={`status-badge ${modalDocente.estadoCarga.css}`}>
                {modalDocente.estadoCarga.label}
              </span>
              <p className="modal-detail-text">
                {modalDocente.estadoCarga.explicacion}
              </p>
            </div>
          </div>
        )}
      </ModalGeneral>

    </div>
  );
};

export default GestorDocentesDecano;