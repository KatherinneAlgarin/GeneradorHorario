import React, { useMemo } from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Filtro from '../../components/common/Filtro';
import Card from '../../components/common/Card'; 
import ModalGeneral from '../../components/common/ModalGeneral'; 
import { useGestorAcademicoDecano } from '../../hooks/useGestorAcademicoDecano';
import '../../styles/AdminDashboard.css';
import '../../styles/Decano.css'; 

const GestorAcademicoDecano = () => {
  const { 
    clases, loading, estadisticas, carrerasUnicas,
    searchTerm, setSearchTerm, filterEstado, setFilterEstado, filterCarrera, setFilterCarrera,
    modalAsignacion, abrirModalAsignacion, cerrarModal,
    obtenerCandidatosPriorizados, docenteSeleccionado, setDocenteSeleccionado, guardarAsignacion
  } = useGestorAcademicoDecano();

  const opcionesCarreras = useMemo(() => {
    return carrerasUnicas.map(c => ({ label: c, value: c }));
  }, [carrerasUnicas]);

  const columns = useMemo(() => [
    { header: 'Código', render: (row) => <strong style={{ color: '#555' }}>{row.codigo}</strong> },
    { 
      header: 'Asignatura y Sección', 
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#333' }}>{row.asignatura}</div>
          <div className="text-muted-small">Sección: {row.seccion}</div>
        </div>
      ) 
    },
    { header: 'Carrera', accessor: 'carrera' },
    { 
      header: 'Horas', 
      render: (row) => (
        <span className="text-muted-small">
          T: {row.horas_teoricas}h | P: {row.horas_practicas}h
        </span>
      ) 
    },
    { 
      header: 'Estado / Docente', 
      render: (row) => {
        if (row.docente) {
          return <span className="status-badge status-active">👤 {row.docente.nombre_completo}</span>;
        }
        return <span className="status-badge status-inactive">⚠️ Sin Asignar</span>;
      } 
    },
    { 
      header: 'Acción', 
      render: (row) => (
        !row.docente ? (
          <button 
            className="btn-primary" 
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            onClick={() => abrirModalAsignacion(row)}
          >
            Asignar Docente
          </button>
        ) : (
          <span className="text-muted-small">Asignada</span>
        )
      ) 
    }
  ], [abrirModalAsignacion]);

  const candidatos = useMemo(() => {
    if (!modalAsignacion.clase) return { recomendados: [], otros: [] };
    return obtenerCandidatosPriorizados(modalAsignacion.clase.id_asignatura);
  }, [modalAsignacion.clase, obtenerCandidatosPriorizados]);

  return (
    <div className="dashboard-container">
      
      <div className="page-header">
        <div>
          <h2>Gestión Académica</h2>
          <p className="text-muted">Asignación de docentes a clases y resolución de materias sin asignar.</p>
        </div>
      </div>

      <div className="stats-grid">
        <Card title="Total de Clases" icon="📚" value={estadisticas.total} label="En el ciclo actual" />
        <Card title="Asignadas" icon="✅" value={estadisticas.asignadas} label="Con docente confirmado" subColor="#2E7D32" />
        <Card title="Materias sin asignar" icon="⚠️" value={estadisticas.sinAsignar} label="Requieren asignación" subColor="#D32F2F" />
      </div>

      <div className="filters-bar filters-bar-advanced">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar por nombre de materia..." 
        />
        
        <Filtro 
          value={filterCarrera} 
          onChange={setFilterCarrera} 
          defaultLabel="Todas las carreras"
          options={opcionesCarreras} 
        />

        <Filtro 
          value={filterEstado} onChange={setFilterEstado} defaultLabel="Todas las clases"
          options={[
            { label: 'Materias sin asignar', value: 'sin_asignar' },
            { label: 'Clases Asignadas', value: 'asignadas' }
          ]} 
        />
      </div>

      {loading ? (
        <div className="loading-container">Cargando clases...</div>
      ) : (
        <Table columns={columns} data={clases} />
      )}

      {/* MODAL DE ASIGNACIÓN */}
      <ModalGeneral
        isOpen={modalAsignacion.isOpen}
        onClose={cerrarModal}
        title="Asignar Docente a Clase"
        footer={
          <>
            <button className="btn-cancel" onClick={cerrarModal}>Cancelar</button>
            <button 
              className="btn-save" 
              onClick={guardarAsignacion}
              disabled={!docenteSeleccionado}
              style={{ opacity: !docenteSeleccionado ? 0.6 : 1 }}
            >
              Confirmar Asignación
            </button>
          </>
        }
      >
        {modalAsignacion.clase && (
          <div>
            <div className="info-card-summary" style={{ marginBottom: '20px' }}>
              <div className="info-row full-width">
                <strong>Clase:</strong> {modalAsignacion.clase.asignatura} (Sec. {modalAsignacion.clase.seccion})
              </div>
              <div className="info-row">
                <strong>Código:</strong> {modalAsignacion.clase.codigo}
              </div>
              <div className="info-row">
                <strong>Horas Semanales:</strong> {modalAsignacion.clase.horas_teoricas + modalAsignacion.clase.horas_practicas}h
              </div>
            </div>

            <div className="form-group-modal full-width">
              <label>Seleccionar Docente Disponible</label>
              <select 
                className="form-select" 
                value={docenteSeleccionado}
                onChange={(e) => setDocenteSeleccionado(e.target.value)}
              >
                <option value="">-- Selecciona un candidato --</option>
                
                {candidatos.recomendados.length > 0 && (
                  <optgroup label="CANDIDATOS PRIORITARIOS (Solicitaron la materia)">
                    {candidatos.recomendados.map(doc => (
                      <option key={doc.id_docente} value={doc.id_docente}>
                         {doc.nombres} {doc.apellidos}
                      </option>
                    ))}
                  </optgroup>
                )}

                {candidatos.otros.length > 0 && (
                  <optgroup label="OTROS DOCENTES DISPONIBLES">
                    {candidatos.otros.map(doc => (
                      <option key={doc.id_docente} value={doc.id_docente}>
                        {doc.nombres} {doc.apellidos}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        )}
      </ModalGeneral>

    </div>
  );
};

export default GestorAcademicoDecano;