import React, { useState, useEffect, useMemo } from 'react';
import HorarioComponent from '../../components/common/horarioComponent'; 
import Card from '../../components/common/card';
import ModalGeneral from '../../components/common/ModalGeneral';  
import { useHorario } from '../../hooks/useHorario'; 
import { useFacultades } from '../../hooks/useFacultades';
import { useCiclos } from '../../hooks/useCiclos';
import { apiRequest } from '../../services/api';

import '../../styles/AdminDashboard.css';

const HomeAdmin = () => {
  const { facultades, loading: loadingFacultades } = useFacultades();
  const { ciclos } = useCiclos();
  
  const [selectedFacultyGen, setSelectedFacultyGen] = useState(""); 
  const [selectedFacultyView, setSelectedFacultyView] = useState(""); 
  
  const [selectedCareer, setSelectedCareer] = useState("");
  const [selectedCiclo, setSelectedCiclo] = useState("");
  
  const [stats, setStats] = useState({ docentes: { asignados: 0, sin_asignar: 0 }, aulas: { asignadas: 0, sin_asignar: 0 }, materias: 0 });
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictos, setConflictos] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    const cicloActivo = ciclos.find(c => c.activo);
    if (cicloActivo) {
      setSelectedCiclo(cicloActivo.id_ciclo_academico);
    }
  }, [ciclos]);

  const { 
    scheduleData, modalState, 
    // setDraggedClass, moveClass, updateModalData, saveClass, // COMENTADOS: Funcionalidad Futura
    openModal, closeModal, 
    loading: loadingHorario,
    isGenerating,
    error: errorHorario,
    generacionResult,
    horarioEstado,
    clearSchedule,
    generarHorario,
    obtenerHorarioPorCarrera,
    cambiarEstadoHorario,
    consultarEstadoFacultad,
    timeSlots,
    days
  } = useHorario();

  const [carreras, setCarreras] = useState([]);
  
  useEffect(() => {
    if (selectedFacultyView) {
      apiRequest(`/carreras/facultad/${selectedFacultyView}`)
        .then(data => setCarreras(data || []))
        .catch(err => {
          console.error("Error cargando carreras:", err);
          setCarreras([]);
        });
    } else {
      setCarreras([]);
    }
  }, [selectedFacultyView]);

  useEffect(() => {
    if (selectedFacultyView) {
      consultarEstadoFacultad(selectedFacultyView);
    } else {
      clearSchedule(); 
    }
  }, [selectedFacultyView, consultarEstadoFacultad]);

  useEffect(() => {
    if (selectedCareer) {
      obtenerHorarioPorCarrera(selectedCareer);
    } else {
      clearSchedule();
      if (selectedFacultyView) consultarEstadoFacultad(selectedFacultyView);
    }
  }, [selectedCareer, selectedFacultyView, consultarEstadoFacultad, obtenerHorarioPorCarrera]);

  const handleGenerarHorario = async (forzarSobrescritura = false) => {
    if (!selectedFacultyGen) {
      alert("Por favor selecciona una facultad para generar");
      return;
    }

    try {
      const result = await generarHorario(selectedFacultyGen, forzarSobrescritura);
      
      if (result && result.conflictos_pendientes && result.conflictos_pendientes.length > 0) {
        setConflictos(result.conflictos_pendientes);
        setShowConflictModal(true);
      }
      
      if (selectedFacultyView === selectedFacultyGen) {
        consultarEstadoFacultad(selectedFacultyView);
        if (selectedCareer) {
          await obtenerHorarioPorCarrera(selectedCareer);
        }
      }
      
      setShowConfirmModal(false);
    } catch (err) {
      if (err && err.statusCode === 409 && err.message && err.message.includes("BORRADOR")) {
        setConfirmMessage("Ya existe un horario en estado BORRADOR. ¿Desea eliminar las clases generadas previamente y volver a generarlas?");
        setShowConfirmModal(true);
      } else {
        alert((err && err.message) || "Error al generar el horario");
      }
    }
  };
  
  const handleConfirmSobrescritura = () => {
    handleGenerarHorario(true);
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!selectedFacultyView) return;
    try {
      await cambiarEstadoHorario(selectedFacultyView, nuevoEstado);
      alert(`Estado cambiado a ${nuevoEstado} exitosamente`);
    } catch (err) {
      alert(err.message || "Error al cambiar el estado");
    }
  };

  const estadoOpciones = useMemo(() => {
    const estado = horarioEstado?.estado;
    if (estado === "BORRADOR") {
      return [
        { label: "Enviar a Revisión", value: "EN_REVISION", color: "#f59e0b" },
        { label: "Publicar Oficial", value: "OFICIAL", color: "#10b981" }
      ];
    }
    if (estado === "EN_REVISION") {
      return [
        { label: "Volver a Borrador", value: "BORRADOR", color: "#6b7280" },
        { label: "Publicar Oficial", value: "OFICIAL", color: "#10b981" }
      ];
    }
    if (estado === "OFICIAL") {
      return [
        { label: "Volver a Borrador", value: "BORRADOR", color: "#6b7280" }
      ];
    }
    return [];
  }, [horarioEstado]);

  const filteredSchedule = scheduleData;

  const renderModalContent = () => (
    <>
      <div className="form-row">
        <div className="form-group-modal">
          <label>Materia</label>
          <input 
            disabled={true} // Forzado a true (solo lectura)
            value={modalState.data?.nombre_asignatura || ''} 
            /* onChange={e => updateModalData('nombre_asignatura', e.target.value)} // COMENTADO */
          />
        </div>
        <div className="form-group-modal">
          <label>Sección</label>
          <input 
            disabled={true} 
            value={modalState.data?.codigo_seccion || ''} 
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group-modal">
          <label>Docente</label>
          <input 
            disabled={true} 
            value={modalState.data?.nombre_docente || ''} 
          />
        </div>
        <div className="form-group-modal">
          <label>Aula</label>
          <input 
            disabled={true} 
            value={modalState.data?.nombre_aula || ''} 
          />
        </div>
      </div>
    </>
  );

  const renderModalFooter = () => (
    <>
      <button className="btn-cancel" onClick={closeModal}>
        Cerrar
      </button>
      {/* COMENTADO: Ocultamos el botón guardar porque estamos en modo de solo lectura 
      {modalState.type !== 'view' && (
        <button className="btn-save" onClick={saveClass}>Guardar</button>
      )} 
      */}
    </>
  );

  const renderConflictModal = () => (
    <>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Se encontraron los siguientes conflictos al generar el horario:
        </p>
        <ul style={{ paddingLeft: '20px', color: '#d32f2f' }}>
          {conflictos.map((conflicto, idx) => (
            <li key={idx} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              {conflicto}
            </li>
          ))}
        </ul>
      </div>
      <div className="modal-actions">
        <button className="btn-save" onClick={() => setShowConflictModal(false)}>Aceptar</button>
      </div>
    </>
  );

  return (
    <div className="dashboard-container">
      {/* Panel de Generación */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginTop: 0, marginBottom: '15px' }}>
          Generación de Horario
        </h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label>Facultad a Generar</label>
            <select 
              style={{ width: '100%', padding: '10px' }} 
              value={selectedFacultyGen} 
              onChange={e => setSelectedFacultyGen(e.target.value)}
              disabled={loadingFacultades}
            >
              <option value="">-- Seleccionar --</option>
              {facultades.map(f => (
                <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>
              ))}
            </select>
          </div>
          <button 
            className="btn-primary"
            onClick={() => handleGenerarHorario(false)}
            disabled={!selectedFacultyGen || isGenerating}
            style={{ opacity: (!selectedFacultyGen || isGenerating) ? 0.6 : 1 }}
          >
            {isGenerating ? 'Generando...' : 'Generar Horario'}
          </button>
        </div>
        
        {generacionResult && (
          <div style={{ marginTop: '15px', padding: '15px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <strong style={{ color: '#166534' }}>{generacionResult.mensaje}</strong>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#555' }}>
              <p>Clases asignadas: {generacionResult.estadisticas?.clases_asignadas || 0}</p>
              <p>Conflictos: {generacionResult.estadisticas?.conflictos || 0}</p>
            </div>
          </div>
        )}

        {errorHorario && (
          <div style={{ marginTop: '15px', padding: '15px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <strong style={{ color: '#dc2626' }}>Error: {errorHorario}</strong>
          </div>
        )}
      </div>

      {/* Panel de Visualización */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <label>Visualizar Facultad</label>
          <select style={{ width: '100%', padding: '10px' }} value={selectedFacultyView} onChange={e => { setSelectedFacultyView(e.target.value); setSelectedCareer(""); clearSchedule(); }}>
            <option value="">-- Seleccionar --</option>
            {facultades.map(f => <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Carrera</label>
          <select style={{ width: '100%', padding: '10px' }} value={selectedCareer} onChange={e => setSelectedCareer(e.target.value)} disabled={!selectedFacultyView}>
            <option value="">-- Seleccionar --</option>
            {carreras.map(c => <option key={c.id_carrera} value={c.id_carrera}>{c.nombre}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Ciclo Activo</label>
          <select style={{ width: '100%', padding: '10px' }} value={selectedCiclo} onChange={e => setSelectedCiclo(e.target.value)} disabled>
            <option value="">-- Seleccionar --</option>
            {ciclos.map(c => <option key={c.id_ciclo_academico} value={c.id_ciclo_academico}>{c.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Botones de estado del horario */}
      {horarioEstado && selectedCareer && filteredSchedule.length > 0 && (
        <div style={{ background: '#f8fafc', padding: '15px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontWeight: 'bold', color: '#333' }}>
              Estado General de la Facultad: 
              <span style={{ 
                marginLeft: '10px',
                padding: '6px 14px', 
                borderRadius: '15px',
                fontSize: '0.85rem',
                background: horarioEstado.estado === 'OFICIAL' ? '#dcfce7' : 
                          horarioEstado.estado === 'EN_REVISION' ? '#fef3c7' : '#e5e7eb',
                color: horarioEstado.estado === 'OFICIAL' ? '#166534' : 
                      horarioEstado.estado === 'EN_REVISION' ? '#92400e' : '#374151'
              }}>
                {horarioEstado.estado}
              </span>
            </span>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {estadoOpciones.map(opcion => (
                <button
                  key={opcion.value}
                  onClick={() => handleCambiarEstado(opcion.value)}
                  disabled={loadingHorario}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: `1px solid ${opcion.color}`,
                    background: 'white',
                    color: opcion.color,
                    cursor: loadingHorario ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {opcion.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', maxWidth: '300px', textAlign: 'right', lineHeight: '1.4' }}>
            Cambiar el estado afectará a todos los horarios de las carreras pertenecientes a esta facultad.
          </div>

        </div>
      )}

      {/* Horario */}
      {selectedCareer ? (
        loadingHorario ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px' }}>
            Cargando horario...
          </div>
        ) : filteredSchedule.length > 0 ? (
          <HorarioComponent 
            scheduleData={filteredSchedule}
            timeSlots={timeSlots}
            days={days}
            // Forzamos la vista de solo lectura independiente del estado del horario
            readOnly={true} 
            
            /* ==== COMENTADO: Funciones de edición y arrastre futuras ====
            onDragStart={setDraggedClass}
            onDrop={(e, day, time) => moveClass(day, time)}
            onAdd={(day, time) => openModal('add', null, { day, time }, selectedCareer)}
            onEdit={(e, item) => { e.stopPropagation(); openModal('edit', item); }}
            ================================================================*/
            
            // Mantenemos solo la visualización
            onView={(item) => openModal('view', item)}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px' }}>
            No hay clases programadas para esta carrera.
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px' }}>
          Selecciona una carrera en el panel de visualización para ver su horario.
        </div>
      )}

      {/* Modales */}
      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title="Detalles de la Clase"
        footer={renderModalFooter()}
      >
        {renderModalContent()}
      </ModalGeneral>

      <ModalGeneral
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        title="Conflictos Pendientes"
        footer={null}
      >
        {renderConflictModal()}
      </ModalGeneral>

      <ModalGeneral
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Acción"
        footer={
          <>
            <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </button>
            <button className="btn-save" onClick={handleConfirmSobrescritura}>
              Sí, Regenerar
            </button>
          </>
        }
      >
        <p style={{ padding: '10px 0', fontSize: '1rem', color: '#333' }}>
          {confirmMessage}
        </p>
      </ModalGeneral>
    </div>
  );
};

export default HomeAdmin;