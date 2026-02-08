import React, { useState, useMemo } from 'react';
import HorarioComponent from '../../components/common/horarioComponent'; 
import Card from '../../components/common/card';
import ModalGeneral from '../../components/common/ModalGeneral';  
import { useHorario } from '../../hooks/useHorario'; 
import { useInfo } from '../../hooks/useInfo';

import '../../styles/AdminDashboard.css';


const timeSlots = ["06:45 - 07:35", "07:35 - 08:25", "08:30 - 09:20", "09:20 - 10:10", "10:15 - 11:05", "11:05 - 11:55", "11:55 - 12:45", "12:45 - 01:30", "02:00 - 02:50", "02:55 - 03:45", "03:50 - 04:40", "04:45 - 05:35", "05:40 - 06:30", "06:35 - 07:25", "07:30 - 08:20"];
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];


const faculties = [{ id: 1, name: "Facultad de Ingeniería" }, { id: 2, name: "Facultad de Medicina" }, { id: 3, name: "Facultad de Humanidades" }];
const careers = [{ id: 101, facultyId: 1, name: "Ing. Desarrollo de Software" }, { id: 102, facultyId: 1, name: "Ing. Industrial" }, { id: 201, facultyId: 2, name: "Doctorado en Medicina" }];
const initialSchedule = [{ id_clase: "uuid-1", dia: "Lunes", hora_inicio: "06:45 - 07:35", nombre_asignatura: "Matemáticas I", nombre_docente: "Prof. García", nombre_aula: "A-101", codigo_seccion: "A", id_carrera: 101, color: "color-blue" }];

const HomeAdmin = () => {
  // Filtros locales
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("");

  // Hooks de Lógica
  const { 
    scheduleData, modalState, setDraggedClass, moveClass, 
    openModal, closeModal, updateModalData, saveClass 
  } = useHorario(initialSchedule);
  
  const { stats, materiasMostradas } = useInfo(selectedFaculty);


  const filteredCareers = useMemo(() => careers.filter(c => c.facultyId === parseInt(selectedFaculty)), [selectedFaculty]);
  const filteredSchedule = scheduleData.filter(c => c.id_carrera === parseInt(selectedCareer));

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

  return (
    <div className="dashboard-container">
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Dashboard Administrativo</h2>
      
     
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
          value={materiasMostradas} label={selectedFaculty ? "En Facultad" : "Total"}
        />
        <Card 
          title="AULAS" 
          icon="🏫" 
          value={stats.aulas.asignadas} label="Ocupadas"
          subValue={stats.aulas.sin_asignar} subLabel="Libres" subColor="#2E7D32"
        />
      </div>

      
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <label>Facultad</label>
          <select style={{width:'100%', padding: '10px'}} value={selectedFaculty} onChange={e => {setSelectedFaculty(e.target.value); setSelectedCareer("");}}>
            <option value="">-- Seleccionar --</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Carrera</label>
          <select style={{width:'100%', padding: '10px'}} value={selectedCareer} onChange={e => setSelectedCareer(e.target.value)} disabled={!selectedFaculty}>
            <option value="">-- Seleccionar --</option>
            {filteredCareers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

     
      {selectedCareer ? (
        <HorarioComponent 
          scheduleData={filteredSchedule}
          timeSlots={timeSlots}
          days={days}
          readOnly={false} 
          onDragStart={setDraggedClass}
          onDrop={(e, day, time) => moveClass(day, time)}
          // Conectamos con el nuevo sistema de Modales del Hook
          onAdd={(day, time) => openModal('add', null, { day, time }, selectedCareer)}
          onEdit={(e, item) => { e.stopPropagation(); openModal('edit', item); }}
          onView={(item) => openModal('view', item)}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px' }}>
          Selecciona una carrera para gestionar horarios.
        </div>
      )}

      
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
    </div>
  );
};

export default HomeAdmin;