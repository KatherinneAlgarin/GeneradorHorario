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

  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotification({ show: true, message: "Usuario no autenticado", type: 'error' });
        return;
      }

      const { data: docenteData } = await supabase
        .from("docente")
        .select("id_docente, activo, carga_minima, carga_maxima, nombres, apellidos")
        .eq("id_auth_user", user.id)
        .maybeSingle();

      if (!docenteData) {
        setNotification({ show: true, message: "No se encontró información de docente", type: 'error' });
        return;
      }

      if (!docenteData.activo) {
        setNotification({ show: true, message: "Tu cuenta está inactiva", type: 'error' });
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

    } catch (error) {
      console.error("Error al cargar disponibilidad:", error);
      setNotification({ show: true, message: error.message || "Error al cargar los datos.", type: 'error' });
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
    return parseFloat(total.toFixed(1));
  }, [bloquesSeleccionados, bloques]);

  const handleGuardar = async () => {
    if (!docente || !ciclo) {
      setNotification({ show: true, message: "Error: faltan datos del docente o ciclo", type: 'error' });
      return;
    }

    if (docente.carga_minima > 0 && horasOfrecidas < docente.carga_minima) {
      setNotification({ 
        show: true, 
        message: `Faltan horas. Tu contrato es de ${docente.carga_minima} hrs, pero solo has seleccionado ${horasOfrecidas} hrs.`, 
        type: 'error' 
      });
      return;
    }

    if (asignaturasSeleccionadas.length === 0) {
      setNotification({ show: true, message: "Debes seleccionar al menos una materia de preferencia.", type: 'error' });
      return;
    }

    setIsSaving(true);
    setNotification({ show: false, message: '', type: 'error' });

    try {
      await apiRequest(`/preferencias-docente/disponibilidad/${docente.id_docente}`, {
        method: 'POST',
        body: JSON.stringify({ 
          id_ciclo_academico: ciclo.id_ciclo_academico,
          bloques: bloquesSeleccionados 
        })
      });

      await apiRequest(`/preferencias-docente/asignaturas/${docente.id_docente}`, {
        method: 'POST',
        body: JSON.stringify({ 
          id_ciclo_academico: ciclo.id_ciclo_academico, 
          asignaturas: asignaturasSeleccionadas 
        })
      });

      setNotification({ show: true, message: "¡Tus preferencias han sido guardadas exitosamente!", type: 'success' });
      
    } catch (error) {
      console.error("Error al guardar:", error);
      setNotification({ show: true, message: error.message || "Error al guardar los datos.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    loading, isSaving, notification, setNotification,
    docente, ciclo, isEditable,
    bloques, bloquesSeleccionados, toggleBloque,
    asignaturas, asignaturasSeleccionadas, toggleAsignatura,
    horasOfrecidas, handleGuardar
  };
};
