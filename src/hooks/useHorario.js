import { useState } from 'react';

export const useHorario = (initialData) => {
  const [scheduleData, setScheduleData] = useState(initialData);
  const [draggedClass, setDraggedClass] = useState(null);

  // Estado del modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'view', // 'view', 'add', 'edit'
    data: null,
    targetSlot: null
  });

  // validaciones
  const checkConflicts = (newItem, excludeId = null) => {
    //mismo espacio ocupado
    const isOccupied = scheduleData.find(c => 
      c.dia === newItem.dia && 
      c.hora_inicio === newItem.hora_inicio && 
      c.id_carrera === newItem.id_carrera &&
      c.id_clase !== excludeId
    );
    if (isOccupied) return "⚠️ Este horario ya está ocupado en esta carrera.";

    // Aula ocupada globalmente
    const roomConflict = scheduleData.find(c => 
      c.dia === newItem.dia && 
      c.hora_inicio === newItem.hora_inicio && 
      c.nombre_aula === newItem.nombre_aula && 
      c.id_clase !== excludeId
    );
    if (roomConflict) return `⚠️ El aula ${newItem.nombre_aula} ya está ocupada.`;

    return null;
  };


  const moveClass = (newDay, newTime) => {
    if (!draggedClass) return;
    
    const tempClass = { ...draggedClass, dia: newDay, hora_inicio: newTime };
    const error = checkConflicts(tempClass, draggedClass.id_clase);
    
    if (error) {
      alert(error);
      return;
    }

    const updated = scheduleData.map(item => 
      item.id_clase === draggedClass.id_clase ? tempClass : item
    );
    setScheduleData(updated);
    setDraggedClass(null);
  };

  // Gestión modal
  const openModal = (type, data = null, slot = null, careerId = null) => {
    // Inicializa datos vacíos si es agregar
    const initialData = type === 'add' ? {
      id_clase: '', nombre_asignatura: '', nombre_docente: '', 
      nombre_aula: '', codigo_seccion: '', color: 'color-blue',
      id_carrera: parseInt(careerId) 
    } : { ...data };

    setModalState({ isOpen: true, type, data: initialData, targetSlot: slot });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const updateModalData = (field, value) => {
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value }
    }));
  };

  const saveClass = () => {
    const { data, type, targetSlot } = modalState;
    if (!data.nombre_asignatura || !data.nombre_aula) return alert("Faltan datos obligatorios");

    const classToSave = type === 'add' ? {
      ...data,
      id_clase: crypto.randomUUID(),
      dia: targetSlot.day,
      hora_inicio: targetSlot.time
    } : data;

    const error = checkConflicts(classToSave, type === 'edit' ? data.id_clase : null);
    if (error) return alert(error);

    if (type === 'add') {
      setScheduleData([...scheduleData, classToSave]);
    } else {
      setScheduleData(scheduleData.map(c => c.id_clase === classToSave.id_clase ? classToSave : c));
    }
    closeModal();
  };

  return {
    scheduleData,
    modalState,
    setDraggedClass,
    moveClass,
    openModal,
    closeModal,
    updateModalData,
    saveClass
  };
};