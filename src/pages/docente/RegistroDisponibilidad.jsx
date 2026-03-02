import React, { useMemo } from 'react';
import { useRegistroDisponibilidad } from '../../hooks/useRegistroDisponibilidad';
import Notification from '../../components/common/Notification';
import '../../styles/DocenteStyles.css';

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
];

const RegistroDisponibilidad = () => {
  const {
    loading, isSaving, notification, setNotification,
    docente, ciclo, isEditable,
    bloques, bloquesSeleccionados, toggleBloque,
    asignaturas, asignaturasSeleccionadas, toggleAsignatura,
    horasOfrecidas, handleGuardar
  } = useRegistroDisponibilidad();

  // 1. Lógica para estructurar la cuadrícula (Extraer filas de horas únicas)
  const horasUnicas = useMemo(() => {
    if (!bloques || bloques.length === 0) return [];
    // Obtenemos los rangos de horas y quitamos duplicados
    const rangos = bloques.map(b => `${b.hora_inicio.slice(0, 5)} - ${b.hora_fin.slice(0, 5)}`);
    return [...new Set(rangos)].sort(); // Ordenados cronológicamente
  }, [bloques]);

  // Función para encontrar si existe un bloque en un día y hora específicos
  const obtenerBloqueEnCelda = (diaId, rangoHora) => {
    const [inicio, fin] = rangoHora.split(' - ');
    return bloques.find(b => 
      b.dia_semana === diaId && 
      b.hora_inicio.startsWith(inicio) && 
      b.hora_fin.startsWith(fin)
    );
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando información...</div>;

  // Cálculos para el termómetro
  const metaHoras = docente?.carga_minima || 0;
  const porcentaje = metaHoras > 0 ? Math.min((horasOfrecidas / metaHoras) * 100, 100) : 100;
  const cumpleMinimo = horasOfrecidas >= metaHoras;

  return (
    <div>
      <div className="page-header-docente">
        <h2>Mi Disponibilidad Horaria</h2>
        <p>Ciclo Activo: <strong>{ciclo?.nombre}</strong></p>
      </div>

      {notification.show && (
        <Notification 
          show={notification.show} 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ ...notification, show: false })} 
        />
      )}

      {/* AVISO SI NO ES EDITABLE (Criterio 7) */}
      {!isEditable && (
        <div className="alert-banner">
          ⚠️ <strong>Solo lectura.</strong> El periodo de planificación ha finalizado o los horarios ya están en revisión.
        </div>
      )}

      {/* TERMÓMETRO DE HORAS */}
      <div className="progress-container">
        <div className="progress-header">
          <span>Horas Ofertadas: {horasOfrecidas} hrs</span>
          <span>Mínimo por Contrato: {metaHoras} hrs</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className={`progress-bar-fill ${cumpleMinimo ? 'success' : 'danger'}`} 
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>
        {!cumpleMinimo && metaHoras > 0 && (
          <p style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '8px', marginBottom: 0 }}>
            Faltan {parseFloat((metaHoras - horasOfrecidas).toFixed(1))} horas para cumplir su contrato.
          </p>
        )}
      </div>

      {/* CUADRÍCULA DE HORARIO */}
      <div className="schedule-grid-container">
        <h3>1. Seleccione sus bloques de tiempo libre</h3>
        
        <div className="schedule-grid">
          {/* Fila de Encabezados */}
          <div className="grid-header" style={{ backgroundColor: '#fff', color: '#fff' }}>Hora</div>
          {DIAS_SEMANA.map(dia => (
            <div key={dia.id} className="grid-header">{dia.nombre}</div>
          ))}

          {/* Filas de Horas */}
          {horasUnicas.map(rango => (
            <React.Fragment key={rango}>
              <div className="grid-time-label">{rango}</div>
              
              {DIAS_SEMANA.map(dia => {
                const bloque = obtenerBloqueEnCelda(dia.id, rango);
                const isSelected = bloque ? bloquesSeleccionados.includes(bloque.id_bloque_horario) : false;
                
                if (!bloque) {
                  return <div key={`${dia.id}-${rango}`} className="grid-cell empty" title="No hay clases en este horario">N/A</div>;
                }

                return (
                  <div 
                    key={bloque.id_bloque_horario} 
                    className={`grid-cell ${isSelected ? 'selected' : ''} ${!isEditable ? 'disabled' : ''}`}
                    onClick={() => toggleBloque(bloque.id_bloque_horario)}
                  >
                    {isSelected ? '✓ Disponible' : 'Libre'}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* PREFERENCIAS DE ASIGNATURAS */}
      <div className="subjects-container">
        <h3>2. Seleccione las asignaturas que desea impartir</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
          * Mostrando únicamente asignaturas de tu(s) facultad(es).
        </p>

        {asignaturas.length > 0 ? (
          <div className="subjects-grid">
            {asignaturas.map(asig => {
              const isSelected = asignaturasSeleccionadas.includes(asig.id_asignatura);
              return (
                <label 
                  key={asig.id_asignatura} 
                  className={`subject-card ${isSelected ? 'selected' : ''} ${!isEditable ? 'disabled' : ''}`}
                >
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => toggleAsignatura(asig.id_asignatura)}
                    disabled={!isEditable}
                  />
                  <div className="subject-info">
                    <span className="subject-name">{asig.nombre}</span>
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No hay asignaturas disponibles para su facultad en este ciclo.</p>
        )}
      </div>

      {/* CONTROLES DE GUARDADO */}
      <div className="bottom-controls">
        <button 
          className="btn-save-large" 
          onClick={handleGuardar}
          disabled={!isEditable || isSaving}
        >
          {isSaving ? 'Guardando preferencias...' : 'Guardar Disponibilidad'}
        </button>
      </div>

    </div>
  );
};

export default RegistroDisponibilidad;