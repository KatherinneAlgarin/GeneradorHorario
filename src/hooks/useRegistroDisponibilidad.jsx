import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { apiRequest } from '../services/api';

export const useRegistroDisponibilidad = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [docente, setDocente] = useState(null);
  const [ciclo, setCiclo] = useState(null);
  const [bloques, setBloques] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [bloquesSeleccionados, setBloquesSeleccionados] = useState([]);
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState([]);
  const [isEditable, setIsEditable] = useState(true);
  const [mensajeBloqueo, setMensajeBloqueo] = useState("");
  
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAlertModal({ show: true, title: 'Error', message: "Usuario no autenticado", type: 'error' });
        return;
      }

      const { data: docenteData } = await supabase
        .from("docente")
        .select("id_docente, activo, carga_minima, carga_maxima, nombres, apellidos")
        .eq("id_auth_user", user.id)
        .maybeSingle();

      if (!docenteData) {
        setAlertModal({ show: true, title: 'Error', message: "No se encontró información de docente", type: 'error' });
        return;
      }

      if (!docenteData.activo) {
        setAlertModal({ show: true, title: 'Acceso Denegado', message: "Su cuenta está inactiva", type: 'error' });
        return;
      }

      const docenteInfo = {
        id_docente: docenteData.id_docente,
        nombres: docenteData.nombres,
        apellidos: docenteData.apellidos,
        carga_minima: docenteData.carga_minima || 0,
        carga_maxima: docenteData.carga_maxima || 0,
      };

      setDocente(docenteInfo);

      const cicloActivo = await apiRequest('/ciclos/activo');
      setCiclo(cicloActivo);

      const catalogoBloques = await apiRequest('/preferencias-docente/bloques');
      setBloques(catalogoBloques);

      const catalogoAsignaturas = await apiRequest(`/preferencias-docente/impartir-asignaturas/${docenteInfo.id_docente}`);
      setAsignaturas(catalogoAsignaturas);

      const miDisponibilidad = await apiRequest(
        `/preferencias-docente/disponibilidad/${docenteInfo.id_docente}?id_ciclo=${cicloActivo.id_ciclo_academico}`
      );
      setBloquesSeleccionados(miDisponibilidad.map(d => d.id_bloque_horario));

      const misAsignaturas = await apiRequest(
        `/preferencias-docente/asignaturas/${docenteInfo.id_docente}?id_ciclo=${cicloActivo.id_ciclo_academico}`
      );
      setAsignaturasSeleccionadas(misAsignaturas.map(a => a.id_asignatura));

      const estadoHorario = await apiRequest(`/horarios/estado-docente/${docenteInfo.id_docente}`);
      setIsEditable(estadoHorario.editable);
      if (!estadoHorario.editable) {
        setMensajeBloqueo(estadoHorario.mensaje);
      }

    } catch (error) {
      console.error("Error al cargar disponibilidad:", error);
      setAlertModal({ show: true, title: 'Error de Conexión', message: error.message || "Error al cargar los datos.", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleBloque = (id_bloque) => {
    if (!isEditable) return;

    setBloquesSeleccionados(prev => 
      prev.includes(id_bloque) ? prev.filter(id => id !== id_bloque) : [...prev, id_bloque]
    );
  };

  const toggleAsignatura = (id_asignatura) => {
    if (!isEditable) return;

    setAsignaturasSeleccionadas(prev => 
      prev.includes(id_asignatura) ? prev.filter(id => id !== id_asignatura) : [...prev, id_asignatura]
    );
  };

  const calcularHoras = (horaInicio, horaFin) => {
    const [hI, mI] = horaInicio.split(':').map(Number);
    const [hF, mF] = horaFin.split(':').map(Number);
    return (hF + mF / 60) - (hI + mI / 60);
  };

  const horasOfrecidas = useMemo(() => {
    if (!bloques.length) return 0;
    
    let total = 0;
    bloquesSeleccionados.forEach(idBloque => {
      const bloqueObj = bloques.find(b => b.id_bloque_horario === idBloque);
      if (bloqueObj) {
        total += calcularHoras(bloqueObj.hora_inicio, bloqueObj.hora_fin);
      }
    });
    return Math.ceil(total); 
  }, [bloquesSeleccionados, bloques]);

  const handleGuardar = async () => {
    if (!docente || !ciclo) {
      setAlertModal({ show: true, title: 'Error', message: "Error: faltan datos del docente o ciclo", type: 'error' });
      return;
    }

    if (asignaturasSeleccionadas.length === 0) {
      setAlertModal({ show: true, title: 'Atención requerida', message: "Debes seleccionar al menos una materia de preferencia.", type: 'warning' });
      return;
    }

    setIsSaving(true);

    try {
      // guardar la disponibilidad
      await apiRequest(`/preferencias-docente/disponibilidad/${docente.id_docente}`, {
        method: 'POST',
        body: JSON.stringify({ 
          id_ciclo_academico: ciclo.id_ciclo_academico,
          bloques: bloquesSeleccionados 
        })
      });

      // Mandamos a guardar las asignaturas
      await apiRequest(`/preferencias-docente/asignaturas/${docente.id_docente}`, {
        method: 'POST',
        body: JSON.stringify({ 
          id_ciclo_academico: ciclo.id_ciclo_academico, 
          asignaturas: asignaturasSeleccionadas 
        })
      });

      setAlertModal({ show: true, title: '¡Éxito!', message: "¡Sus preferencias han sido guardadas exitosamente!", type: 'success' });
      
    } catch (error) {
      console.error("Error al guardar:", error);
      //  error 400 del backend horas insuficientes, etc.
      setAlertModal({ show: true, title: 'Aviso Importante', message: error.message || "Error al guardar los datos.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    loading, isSaving, alertModal, setAlertModal,
    docente, ciclo, isEditable,mensajeBloqueo,
    bloques, bloquesSeleccionados, toggleBloque,
    asignaturas, asignaturasSeleccionadas, toggleAsignatura,
    horasOfrecidas, handleGuardar
  };
};