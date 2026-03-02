import { useState, useMemo, useCallback, useEffect } from 'react';

const MOCK_DOCENTES = [
  { id_docente: "d1", nombres: "Katherinne", apellidos: "Algarín" },
  { id_docente: "d2", nombres: "Jimmy Ernesto", apellidos: "Ramos" },
  { id_docente: "d3", nombres: "Gustavo", apellidos: "Retana" },
];

const MOCK_PREFERENCIAS = [
  { id_docente: "d1", id_asignatura: "asig-1" }, 
  { id_docente: "d2", id_asignatura: "asig-2" }, 
];

const MOCK_CLASES = [
  { 
    id_clase: "c1", id_asignatura: "asig-1", codigo: "BDO101", asignatura: "Base de Datos I", 
    carrera: "Ingeniería en Sistemas", horas_teoricas: 2, horas_practicas: 2, seccion: "A", 
    docente: null 
  },
  { 
    id_clase: "c2", id_asignatura: "asig-2", codigo: "RED201", asignatura: "Redes de Computadoras", 
    carrera: "Ingeniería en Sistemas", horas_teoricas: 3, horas_practicas: 2, seccion: "B", 
    docente: null 
  },
  { 
    id_clase: "c3", id_asignatura: "asig-3", codigo: "MAT101", asignatura: "Matemática I", 
    carrera: "Ingeniería Industrial", horas_teoricas: 4, horas_practicas: 0, seccion: "A", 
    docente: { id_docente: "d3", nombre_completo: "Gustavo Retana" } 
  },
];

export const useGestorAcademicoDecano = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("sin_asignar");
  const [filterCarrera, setFilterCarrera] = useState("");
  const [modalAsignacion, setModalAsignacion] = useState({ isOpen: false, clase: null });
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setClases(MOCK_CLASES);
    } catch (error) {
      console.error("Error al cargar clases:", error);
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

      // Aplicamos el filtro de carrera
      const matchesCarrera = !filterCarrera || clase.carrera === filterCarrera;

      return matchesSearch && matchesEstado && matchesCarrera;
    });
  }, [clases, searchTerm, filterEstado, filterCarrera]);

  const obtenerCandidatosPriorizados = useCallback((id_asignatura) => {
    const recomendados = [];
    const otros = [];

    MOCK_DOCENTES.forEach(docente => {
      const pidioMateria = MOCK_PREFERENCIAS.some(
        pref => pref.id_docente === docente.id_docente && pref.id_asignatura === id_asignatura
      );

      if (pidioMateria) recomendados.push(docente);
      else otros.push(docente);
    });

    return { recomendados, otros };
  }, []);

  const abrirModalAsignacion = useCallback((clase) => {
    setModalAsignacion({ isOpen: true, clase });
    setDocenteSeleccionado(""); 
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAsignacion({ isOpen: false, clase: null });
  }, []);

  const guardarAsignacion = useCallback(() => {
    if (!docenteSeleccionado) return;

    const docenteAsignado = MOCK_DOCENTES.find(d => d.id_docente === docenteSeleccionado);
    
    setClases(prev => prev.map(c => 
      c.id_clase === modalAsignacion.clase.id_clase 
        ? { ...c, docente: { id_docente: docenteAsignado.id_docente, nombre_completo: `${docenteAsignado.nombres} ${docenteAsignado.apellidos}` } }
        : c
    ));

    cerrarModal();
  }, [docenteSeleccionado, modalAsignacion, cerrarModal]);

  return {
    clases: filteredClases, loading, estadisticas, carrerasUnicas,
    searchTerm, setSearchTerm, filterEstado, setFilterEstado, filterCarrera, setFilterCarrera,
    modalAsignacion, abrirModalAsignacion, cerrarModal,
    obtenerCandidatosPriorizados, docenteSeleccionado, setDocenteSeleccionado, guardarAsignacion
  };
};