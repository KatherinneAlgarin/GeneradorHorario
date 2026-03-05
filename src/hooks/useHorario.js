import { useState, useCallback } from 'react';
import { apiRequest } from '../services/api';
import { supabase } from '../services/supabaseClient';

const timeSlots = [
  "06:45 - 07:35", "07:35 - 08:25", "08:30 - 09:20", "09:20 - 10:10",
  "10:15 - 11:05", "11:05 - 11:55", "11:55 - 12:45", "12:45 - 01:30",
  "02:00 - 02:50", "02:55 - 03:45", "03:50 - 04:40", "04:45 - 05:35",
  "05:40 - 06:30", "06:35 - 07:25", "07:30 - 08:20"
];

const daysMap = {
  1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado"
};

const timeToSlot = (horaInicio) => {
  const hour = horaInicio.split(':').slice(0, 2).join(':');
  return timeSlots.find(ts => ts.startsWith(hour)) || "";
};

const transformApiDataToSchedule = (eventos) => {
  return eventos.map((evento, idx) => ({
    id_clase: evento.id_clase,
    dia: daysMap[evento.dia_semana] || "",
    hora_inicio: timeToSlot(evento.hora_inicio),
    nombre_asignatura: evento.asignatura,
    nombre_docente: evento.docente,
    nombre_aula: evento.aula,
    codigo_seccion: evento.seccion,
    id_carrera: evento.id_carrera || 0,
    color: ['color-blue', 'color-green', 'color-purple', 'color-yellow', 'color-pink'][idx % 5],
    tipo_clase: evento.tipo_clase,
    tipo_aula: evento.tipo_aula
  }));
};

export const useHorario = (initialData = []) => {
  const [scheduleData, setScheduleData] = useState(initialData);
  // const [draggedClass, setDraggedClass] = useState(null); // COMENTADO: Funcionalidad futura
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generacionResult, setGeneracionResult] = useState(null);
  const [horarioEstado, setHorarioEstado] = useState(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'view',
    data: null,
    targetSlot: null
  });

  const getAdminId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.id) return null;
      
      const { data: admin } = await supabase
        .from("administrador")
        .select("id_administrador")
        .eq("id_auth_user", user.id)
        .maybeSingle();
      
      return admin?.id_administrador ? String(admin.id_administrador) : null;
    } catch (error) {
      console.error("Error en getAdminId:", error);
      return null;
    }
  };

  const obtenerHorarioPorCarrera = useCallback(async (idCarrera) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/horarios/carrera/${idCarrera}`);
      
      if (data.eventos && data.eventos.length > 0) {
        const transformed = transformApiDataToSchedule(data.eventos);
        setScheduleData(transformed);
      } else {
        setScheduleData([]);
      }
      
      setHorarioEstado({
        id_horario: data.horario_id,
        estado: data.estado_actual,
        es_editable: data.es_editable
      });
      
      return data;
    } catch (err) {
      const errorMessage = err?.message || "Error al obtener el horario";
      console.error("Error al obtener horario:", errorMessage);
      setError(errorMessage);
      setScheduleData([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const consultarEstadoFacultad = useCallback(async (idFacultad) => {
    if (!idFacultad) {
      setHorarioEstado(null);
      return;
    }
    try {
      const data = await apiRequest(`/horarios/estado-facultad/${idFacultad}`);
      if (data && data.estado) {
        setHorarioEstado({
          estado: data.estado,
          es_editable: data.es_editable
        });
      } else {
        setHorarioEstado(null);
      }
    } catch (err) {
      console.error("Error consultando estado de la facultad:", err);
      setHorarioEstado(null);
    }
  }, []);

  const generarHorario = useCallback(async (idFacultad, forzarSobrescritura = true) => {
    setIsGenerating(true);
    setError(null);
    setGeneracionResult(null);
    
    try {
      if (!idFacultad) throw new Error("ID de facultad no proporcionado");
      
      const idAdmin = await getAdminId();
      const payload = {
        id_facultad: String(idFacultad).trim(),
        id_administrador: idAdmin ? String(idAdmin).trim() : null,
        forzar_sobrescritura: Boolean(forzarSobrescritura)
      };
      
      const jsonString = JSON.stringify(payload);
      
      const result = await apiRequest('/horarios/generar', {
        method: 'POST',
        body: jsonString
      });
      
      setGeneracionResult(result);
      return result;
    } catch (err) {
      const errorMessage = (err && err.message) ? String(err.message) : "Error al generar el horario";
      console.error("Error al generar horario:", errorMessage);
      setError(errorMessage);
      
      const customError = new Error(errorMessage);
      if (err && err.statusCode) {
        customError.statusCode = err.statusCode;
      }
      throw customError;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const cambiarEstadoHorario = useCallback(async (idFacultad, nuevoEstado) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(`/horarios/cambiar-estado/${idFacultad}`, {
        method: 'PUT',
        body: JSON.stringify({ nuevo_estado: nuevoEstado })
      });
      
      if (horarioEstado) {
        setHorarioEstado({ ...horarioEstado, estado: nuevoEstado });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err?.message || "Error al cambiar el estado";
      console.error("Error al cambiar estado:", errorMessage);
      setError(errorMessage);
      const customError = new Error(errorMessage);
      customError.statusCode = err?.statusCode;
      throw customError;
    } finally {
      setLoading(false);
    }
  }, [horarioEstado]);

  /* FUNCIONALIDADES DE EDICIÓN MANUAL Y ARRASTRE FUTURAS
  
  const checkConflicts = (newItem, excludeId = null) => {
    const isOccupied = scheduleData.find(c => 
      c.dia === newItem.dia && 
      c.hora_inicio === newItem.hora_inicio && 
      c.id_carrera === newItem.id_carrera &&
      c.id_clase !== excludeId
    );
    if (isOccupied) return "Este horario ya está ocupado en esta carrera.";

    const roomConflict = scheduleData.find(c => 
      c.dia === newItem.dia && 
      c.hora_inicio === newItem.hora_inicio && 
      c.nombre_aula === newItem.nombre_aula && 
      c.id_clase !== excludeId
    );
    if (roomConflict) return `El aula ${newItem.nombre_aula} ya está ocupada.`;

    return null;
  };

  const moveClass = (newDay, newTime) => {
    if (!draggedClass) return;
    const tempClass = { ...draggedClass, dia: newDay, hora_inicio: newTime };
    const error = checkConflicts(tempClass, draggedClass.id_clase);
    if (error) { alert(error); return; }
    const updated = scheduleData.map(item => 
      item.id_clase === draggedClass.id_clase ? tempClass : item
    );
    setScheduleData(updated);
    setDraggedClass(null);
  };
  
  const updateModalData = (field, value) => {
    setModalState(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  const saveClass = () => {
    const { data, type, targetSlot } = modalState;
    if (!data.nombre_asignatura || !data.nombre_aula) return alert("Faltan datos obligatorios");
    const classToSave = type === 'add' ? {
      ...data, id_clase: crypto.randomUUID(), dia: targetSlot.day, hora_inicio: targetSlot.time
    } : data;
    const error = checkConflicts(classToSave, type === 'edit' ? data.id_clase : null);
    if (error) return alert(error);
    if (type === 'add') { setScheduleData([...scheduleData, classToSave]); } 
    else { setScheduleData(scheduleData.map(c => c.id_clase === classToSave.id_clase ? classToSave : c)); }
    closeModal();
  }; */

  const openModal = (type, data = null, slot = null, careerId = null) => {
    // Por el momento solo abriremos en modo vista
    setModalState({ isOpen: true, type: 'view', data: { ...data }, targetSlot: slot });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const clearSchedule = () => {
    setScheduleData([]);
    setGeneracionResult(null);
    setHorarioEstado(null);
  };

  return {
    scheduleData,
    modalState,
    // setDraggedClass, 
    // moveClass,        
    openModal,
    closeModal,
    // updateModalData, 
    // saveClass,       
    loading,
    isGenerating,
    error,
    generacionResult,
    horarioEstado,
    clearSchedule,
    obtenerHorarioPorCarrera,
    generarHorario,
    cambiarEstadoHorario,
    timeSlots,
    consultarEstadoFacultad,
    days: Object.values(daysMap)
  };
};