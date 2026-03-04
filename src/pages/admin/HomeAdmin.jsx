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
  // Datos de facultades y ciclos
  const { facultades, loading: loadingFacultades } = useFacultades();
  const { ciclos } = useCiclos();
  
  // Filtros locales
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("");
  const [selectedCiclo, setSelectedCiclo] = useState("");
  
  // Estado para estadísticas
  const [stats, setStats] = useState({
    docentes: { asignados: 0, sin_asignar: 0 },
    aulas: { asignadas: 0, sin_asignar: 0 },
    materias: 0
  });

  // Estado para modal de conflictos
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictos, setConflictos] = useState([]);
  
  // Estado para modal de confirmación de sobrescritura
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  // Ciclo activo por defecto
  useEffect(() => {
    const cicloActivo = ciclos.find(c => c.activo);
    if (cicloActivo) {
      setSelectedCiclo(cicloActivo.id_ciclo_academico);
    }
  }, [ciclos]);

  // Hook de horario
  const { 
    scheduleData, modalState, setDraggedClass, moveClass, 
    openModal, closeModal, updateModalData, saveClass,
    loading: loadingHorario,
    error: errorHorario,
    generacionResult,
    horarioEstado,
    clearSchedule,
    generarHorario,
    obtenerHorarioPorCarrera,
    cambiarEstadoHorario,
    timeSlots,
    days
  } = useHorario();

  // Cargar carreras cuando se selecciona facultad
  const [carreras, setCarreras] = useState([]);
  
  useEffect(() => {
    if (selectedFaculty) {
      apiRequest(`/carreras/facultad/${selectedFaculty}`)
        .then(data => setCarreras(data || []))
        .catch(err => {
          console.error("Error cargando carreras:", err);
          setCarreras([]);
        });
    } else {
      setCarreras([]);
    }
  }, [selectedFaculty]);

  // Cargar horario cuando se selecciona carrera
  useEffect(() => {
    if (selectedCareer) {
      obtenerHorarioPorCarrera(selectedCareer);
    } else {
      clearSchedule();
    }
  }, [selectedCareer]);


  // Obtener estadísticas de la facultad
  useEffect(() => {
    if (!selectedFaculty || !selectedCiclo) {
      setStats({
        docentes: { asignados: 0, sin_asignar: 0 },
        aulas: { asignadas: 0, sin_asignar: 0 },
        materias: 0
      });
      return;
    }

    const fetchStats = async () => {
      try {
        // Obtener docentes de la facultad
        const docentesRes = await apiRequest(`/docentes/facultad/${selectedFaculty}`);
        const docentes = Array.isArray(docentesRes) ? docentesRes : [];
        
        // Obtener aulas
        const aulasRes = await apiRequest('/aulas');
        const aulas = Array.isArray(aulasRes) ? aulasRes : [];
        const aulasActivas = aulas.filter(a => a.activo);
        
        // Obtener asignaturas de la facultad
        const carrerasRes = await apiRequest(`/carreras/facultad/${selectedFaculty}`);
        const carrerasArray = Array.isArray(carrerasRes) ? carrerasRes : [];
        
        let totalMaterias = 0;
        for (const carrera of carrerasArray) {
          const planesRes = await apiRequest(`/planes-estudio/carrera/${carrera.id_carrera}`);
          if (Array.isArray(planesRes)) {
            for (const plan of planesRes) {
              // Las asignaturas se pueden obtener de otra forma o simplificamos
              totalMaterias += 1; // Placeholder
            }
          }
        }

        // Contar docentes con carga (simplificado)
        const docentesConClase = new Set();
        if (scheduleData.length > 0) {
          scheduleData.forEach(c => {
            if (c.nombre_docente && c.nombre_docente !== "Sin asignar") {
              docentesConClase.add(c.nombre_docente);
            }
          });
        }

        // Aulas ocupadas (simplificado)
        const aulasOcupadas = new Set(scheduleData.map(c => c.nombre_aula).filter(Boolean));

        setStats({
          docentes: { 
            asignados: docentesConClase.size, 
            sin_asignar: docentes.length - docentesConClase.size 
          },
          aulas: { 
            asignadas: aulasOcupadas.size, 
            sin_asignar: aulasActivas.length - aulasOcupadas.size 
          },
          materias: totalMaterias
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [selectedFaculty, selectedCiclo, scheduleData.length]);

  // Handler para generar horario
  const handleGenerarHorario = async (forzarSobrescritura = false) => {
    if (!selectedFaculty) {
      alert("Por favor selecciona una facultad");
      return;
    }

    try {
      const result = await generarHorario(selectedFaculty, forzarSobrescritura);
      
      // Mostrar conflictos si existen
      if (result && result.conflictos_pendientes && result.conflictos_pendientes.length > 0) {
        setConflictos(result.conflictos_pendientes);
        setShowConflictModal(true);
      }
      
      // Recargar el horario si hay una carrera seleccionada
      if (selectedCareer) {
        await obtenerHorarioPorCarrera(selectedCareer);
      }
      
      setShowConfirmModal(false);
    } catch (err) {
      // Si hay un borrador existente, preguntar
      if (err && err.statusCode === 409 && err.message && err.message.includes("BORRADOR")) {
        setConfirmMessage("Ya existe un horario en estado BORRADOR. ¿Desea eliminar las clases generadas previamente y volver a generarlos?");
        setShowConfirmModal(true);
      } else {
        alert((err && err.message) || "Error al generar el horario");
      }
    }
  };
  
  const handleConfirmSobrescritura = () => {
    handleGenerarHorario(true);
  };

  // Handler para cambiar estado
  const handleCambiarEstado = async (nuevoEstado) => {
    if (!selectedFaculty) return;
    
    try {
      await cambiarEstadoHorario(selectedFaculty, nuevoEstado);
      alert(`Estado cambiado a ${nuevoEstado} exitosamente`);
    } catch (err) {
      alert(err.message || "Error al cambiar el estado");
    }
  };

  // Opciones de estado según el estado actual
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

  // La API ya filtra por carrera, usamos scheduleData directamente
  const filteredSchedule = scheduleData;

  // formulario
  const renderModalContent = () => (
    <>
      <div className="form-row">
        <div className="form-group-modal">
          <label>Materia</label>
          <input 
            disabled={modalState.type === 'view'} 
            value={modalState.data?.nombre_asignatura || ''} 
            onChange={e => updateModalData('nombre_asignatura', e.target.value)} 
          />
        </div>
        <div className="form-group-modal">
          <label>Sección</label>
          <input 
            disabled={modalState.type === 'view'} 
            value={modalState.data?.codigo_seccion || ''} 
            onChange={e => updateModalData('codigo_seccion', e.target.value)} 
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group-modal">
          <label>Docente</label>
          <input 
            disabled={modalState.type === 'view'} 
            value={modalState.data?.nombre_docente || ''} 
            onChange={e => updateModalData('nombre_docente', e.target.value)} 
          />
        </div>
        <div className="form-group-modal">
          <label>Aula</label>
          <input 
            disabled={modalState.type === 'view'} 
            value={modalState.data?.nombre_aula || ''} 
            onChange={e => updateModalData('nombre_aula', e.target.value)} 
          />
        </div>
      </div>
    </>
  );

  const renderModalFooter = () => (
    <>
      <button className="btn-cancel" onClick={closeModal}>
        {modalState.type === 'view' ? 'Cerrar' : 'Cancelar'}
      </button>
      {modalState.type !== 'view' && (
        <button className="btn-save" onClick={saveClass}>Guardar</button>
      )}
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
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Dashboard Administrativo</h2>
      
      {/* Stats */}
      <div className="stats-grid">
        <Card 
          title="DOCENTES" 
          icon="👨‍🏫" 
          value={stats.docentes.asignados} label="Asignados"
          subValue={stats.docentes.sin_asignar} subLabel="Sin carga"
        />
        <Card 
          title="MATERIAS" 
          icon="📚" 
          value={stats.materias} label={selectedFaculty ? "En Facultad" : "Total"}
        />
        <Card 
          title="AULAS" 
          icon="🏫" 
          value={stats.aulas.asignadas} label="Ocupadas"
          subValue={stats.aulas.sin_asignar} subLabel="Libres" subColor="#2E7D32"
        />
      </div>

      {/* Panel de Generación de Horario */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginTop: 0, marginBottom: '15px' }}>
          ⚙️ Generación de Horario
        </h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label>Facultad</label>
            <select 
              style={{ width: '100%', padding: '10px' }} 
              value={selectedFaculty} 
              onChange={e => { setSelectedFaculty(e.target.value); setSelectedCareer(""); clearSchedule(); }}
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
            onClick={handleGenerarHorario}
            disabled={!selectedFaculty || loadingHorario}
            style={{ opacity: (!selectedFaculty || loadingHorario) ? 0.6 : 1 }}
          >
            {loadingHorario ? 'Generando...' : '🚀 Generar Horario'}
          </button>
        </div>
        
        {/* Resultado de generación */}
        {generacionResult && (
          <div style={{ marginTop: '15px', padding: '15px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <strong style={{ color: '#166534' }}>✅ {generacionResult.mensaje}</strong>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#555' }}>
              <p>Clases asignadas: {generacionResult.estadisticas?.clases_asignadas || 0}</p>
              <p>Conflictos: {generacionResult.estadisticas?.conflictos || 0}</p>
            </div>
          </div>
        )}

        {errorHorario && (
          <div style={{ marginTop: '15px', padding: '15px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <strong style={{ color: '#dc2626' }}>❌ Error: {errorHorario}</strong>
          </div>
        )}
      </div>

      {/* Panel de Visualización */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <label>Facultad</label>
          <select style={{ width: '100%', padding: '10px' }} value={selectedFaculty} onChange={e => { setSelectedFaculty(e.target.value); setSelectedCareer(""); }}>
            <option value="">-- Seleccionar --</option>
            {facultades.map(f => <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Carrera</label>
          <select style={{ width: '100%', padding: '10px' }} value={selectedCareer} onChange={e => setSelectedCareer(e.target.value)} disabled={!selectedFaculty}>
            <option value="">-- Seleccionar --</option>
            {carreras.map(c => <option key={c.id_carrera} value={c.id_carrera}>{c.nombre}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Ciclo</label>
          <select style={{ width: '100%', padding: '10px' }} value={selectedCiclo} onChange={e => setSelectedCiclo(e.target.value)}>
            <option value="">-- Seleccionar --</option>
            {ciclos.map(c => <option key={c.id_ciclo_academico} value={c.id_ciclo_academico}>{c.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Botones de estado del horario */}
      {horarioEstado && selectedCareer && (
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: '#333' }}>
            Estado: 
            <span style={{ 
              marginLeft: '10px',
              padding: '4px 12px', 
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
                fontSize: '0.85rem'
              }}
            >
              {opcion.label}
            </button>
          ))}
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
            readOnly={!horarioEstado?.es_editable} 
            onDragStart={setDraggedClass}
            onDrop={(e, day, time) => moveClass(day, time)}
            onAdd={(day, time) => openModal('add', null, { day, time }, selectedCareer)}
            onEdit={(e, item) => { e.stopPropagation(); openModal('edit', item); }}
            onView={(item) => openModal('view', item)}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px' }}>
            No hay clases programadas para esta carrera. Selecciona una facultad y genera el horario.
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px' }}>
          Selecciona una carrera para gestionar horarios.
        </div>
      )}

      {/* Modal de edición de clase */}
      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.type === 'view' ? 'Detalles de Clase' : 
          modalState.type === 'add' ? 'Nueva Clase' : 'Editar Clase'
        }
        footer={renderModalFooter()}
      >
        {renderModalContent()}
      </ModalGeneral>

      {/* Modal de conflictos */}
      <ModalGeneral
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        title="Conflictos Pendientes"
        footer={null}
      >
        {renderConflictModal()}
      </ModalGeneral>

      {/* Modal de confirmación de sobrescritura */}
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
