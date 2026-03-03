import { useState, useMemo, useCallback, useEffect } from 'react';
import { getUserRole } from '../services/authService';
import { apiRequest } from '../services/api';

export const useGestorAcademicoDecano = () => {
  const [clases, setClases] = useState([]);
  const [docentesFacultad, setDocentesFacultad] = useState([]);
  const [preferencias, setPreferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("sin_asignar"); 
  const [filterCarrera, setFilterCarrera] = useState(""); 

  const [modalAsignacion, setModalAsignacion] = useState({ isOpen: false, clase: null });
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    try {
      const user = await getUserRole();
      if (!user || !user.id_facultad) {
        throw new Error("No se encontró la sesión del decano");
      }

      const [dataClases, dataDocentes, dataPreferencias] = await Promise.all([
        apiRequest(`/decano/clases-ciclo/${user.id_facultad}`),
        apiRequest(`/decano/docentes-carga/${user.id_facultad}`),
        apiRequest(`/decano/preferencias`)
      ]);

      setClases(Array.isArray(dataClases) ? dataClases : []);
      setDocentesFacultad(Array.isArray(dataDocentes) ? dataDocentes : []);
      setPreferencias(Array.isArray(dataPreferencias) ? dataPreferencias : []);

    } catch (error) {
      console.error("Error al cargar datos académicos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDatos(); }, [fetchDatos]);

  const carrerasUnicas = useMemo(() => {
    return [...new Set(clases.map(c => c.carrera))];
  }, [clases]);

  const estadisticas = useMemo(() => {
    const total = clases.length;
    const asignadas = clases.filter(c => c.docente !== null).length;
    const sinAsignar = total - asignadas;
    return { total, asignadas, sinAsignar };
  }, [clases]);

  const filteredClases = useMemo(() => {
    return clases.filter(clase => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || clase.asignatura.toLowerCase().includes(lowerSearch);
      
      let matchesEstado = true;
      if (filterEstado === "sin_asignar") matchesEstado = clase.docente === null;
      if (filterEstado === "asignadas") matchesEstado = clase.docente !== null;

      const matchesCarrera = !filterCarrera || clase.carrera === filterCarrera;

      return matchesSearch && matchesEstado && matchesCarrera;
    });
  }, [clases, searchTerm, filterEstado, filterCarrera]);

  const obtenerCandidatosPriorizados = useCallback((id_asignatura) => {
    const recomendados = [];
    const otros = [];

    docentesFacultad.forEach(docente => {
      const pidioMateria = preferencias.some(
        pref => pref.id_docente === docente.id_docente && pref.id_asignatura === id_asignatura
      );

      if (pidioMateria) recomendados.push(docente);
      else otros.push(docente);
    });

    return { recomendados, otros };
  }, [docentesFacultad, preferencias]);

  const abrirModalAsignacion = useCallback((clase) => {
    setModalAsignacion({ isOpen: true, clase });
    setDocenteSeleccionado(""); 
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAsignacion({ isOpen: false, clase: null });
  }, []);

  // 🌐 ENVIAR ASIGNACIÓN AL BACKEND
  const guardarAsignacion = useCallback(async () => {
    if (!docenteSeleccionado || !modalAsignacion.clase) return;

    try {
      await apiRequest(`/decano/clases/${modalAsignacion.clase.id_clase}/asignar`, {
        method: "PATCH",
        body: JSON.stringify({ id_docente: docenteSeleccionado })
      });

      await fetchDatos(); 
      cerrarModal();

    } catch (error) {
      console.error("Error guardando la asignación:", error);
      alert(error.message || "Hubo un error al intentar asignar el docente.");
    }
  }, [docenteSeleccionado, modalAsignacion, cerrarModal, fetchDatos]);

  return {
    clases: filteredClases, loading, estadisticas, carrerasUnicas,
    searchTerm, setSearchTerm, filterEstado, setFilterEstado, filterCarrera, setFilterCarrera,
    modalAsignacion, abrirModalAsignacion, cerrarModal,
    obtenerCandidatosPriorizados, docenteSeleccionado, setDocenteSeleccionado, guardarAsignacion
  };
};