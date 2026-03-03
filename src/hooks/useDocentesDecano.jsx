import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { getUserRole } from '../services/authService';
import { apiRequest } from '../services/api';

const determinarEstadoCarga = (asignadas, min, max) => {
  if (asignadas > max) return { label: 'Sobrecarga', css: 'status-inactive', isProblem: true, explicacion: `Se le han asignado ${asignadas} hrs semanales, excediendo su límite máximo registrado de ${max} hrs. Debe reasignar clases a otro docente.` };
  if (asignadas === max) return { label: 'Óptima', css: 'status-active', isProblem: false, explicacion: `El docente ha alcanzado exactamente su límite máximo de ${max} hrs semanales. No se le pueden asignar más clases.` };
  if (asignadas >= min && asignadas < max) return { label: 'Disponible', css: 'color-blue', isProblem: false, explicacion: `Cumple su mínimo contractual de ${min} hrs, pero aún se le pueden asignar más clases (Límite máximo: ${max} hrs).` };
  if (asignadas > 0 && asignadas < min) return { label: 'Carga Incompleta', css: 'color-yellow', isProblem: true, explicacion: `Tiene ${asignadas} hrs asignadas, lo cual NO cubre su mínimo contractual de ${min} hrs semanales.` };
  return { label: 'Sin Carga', css: 'status-inactive', isProblem: true, explicacion: `Actualmente no tiene ninguna hora asignada en el ciclo. Su mínimo requerido es de ${min} hrs semanales.` };
};

export const useDocentesDecano = () => {
  const [docentesRaw, setDocentesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState(""); 
  const [filterEstado, setFilterEstado] = useState("");
  const [modalDocente, setModalDocente] = useState(null);

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    try {
      const user = await getUserRole();
      
      if (!user || !user.id_facultad) {
        console.error("No se encontró la sesión del decano o el ID de la facultad");
        setLoading(false);
        return;
      }

      const data = await apiRequest(`/decano/docentes-carga/${user.id_facultad}`);
      setDocentesRaw(Array.isArray(data) ? data : []); 

    } catch (error) {
      console.error("Error al cargar docentes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDatos(); }, [fetchDatos]);

  const abrirModalDetalle = useCallback((docente) => setModalDocente(docente), []);
  const cerrarModal = useCallback(() => setModalDocente(null), []);

  const docentesProcesados = useMemo(() => {
    return docentesRaw.map(d => ({ ...d, estadoCarga: determinarEstadoCarga(d.horas_asignadas, d.carga_minima, d.carga_maxima) }));
  }, [docentesRaw]);

  const estadisticas = useMemo(() => {
    let optimas = 0; let disponibles = 0; let atencion = 0; 
    docentesProcesados.forEach(d => {
      if (d.estadoCarga.label === 'Óptima') optimas++;
      else if (d.estadoCarga.label === 'Disponible') disponibles++;
      else atencion++; 
    });
    return { total: docentesProcesados.length, optimas, disponibles, atencion };
  }, [docentesProcesados]);

  const filteredDocentes = useMemo(() => {
    return docentesProcesados.filter(docente => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || docente.nombres.toLowerCase().includes(lowerSearch) || docente.apellidos.toLowerCase().includes(lowerSearch) || docente.correo.toLowerCase().includes(lowerSearch);
      const matchesTipo = !filterTipo || docente.tipo === filterTipo;
      
      let matchesEstado = true;
      if (filterEstado === "optima") matchesEstado = docente.estadoCarga.label === 'Óptima';
      else if (filterEstado === "disponible") matchesEstado = docente.estadoCarga.label === 'Disponible';
      else if (filterEstado === "incompleta") matchesEstado = docente.estadoCarga.label === 'Carga Incompleta';
      else if (filterEstado === "sin_carga") matchesEstado = docente.estadoCarga.label === 'Sin Carga';
      else if (filterEstado === "sobrecarga") matchesEstado = docente.estadoCarga.label === 'Sobrecarga';

      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [docentesProcesados, searchTerm, filterTipo, filterEstado]);

 
  const columns = useMemo(() => [
    { header: 'Nombres', accessor: 'nombres' },
    { header: 'Apellidos', accessor: 'apellidos' },
    { header: 'Correo', accessor: 'correo' },
    { header: 'Contrato', accessor: 'tipo' },
    { 
      header: 'Horas contratadas', 
      render: (row) => (
        <span className="text-muted-small">
          {row.carga_minima}h a {row.carga_maxima}h
        </span>
      )
    },
    { 
      header: 'Horas Asignadas', 
      render: (row) => (
        <span className={`horas-container ${row.estadoCarga.isProblem ? 'text-alert' : 'text-success'}`}>
          <strong>{row.horas_asignadas} hrs</strong>
          {row.estadoCarga.isProblem && <span title="Fuera del rango permitido">⚠️</span>}
        </span>
      )
    },
    { 
      header: 'Estado de Carga', 
      render: (row) => (
        <span 
          className={`status-badge ${row.estadoCarga.css} clickable-badge`} 
          onClick={() => abrirModalDetalle(row)}
          title="Clic para ver detalles"
        >
          {row.estadoCarga.label}
        </span>
      )
    }
  ], [abrirModalDetalle]);

  return {
    docentes: filteredDocentes, loading, estadisticas,
    searchTerm, setSearchTerm, filterTipo, setFilterTipo, filterEstado, setFilterEstado,
    columns, modalDocente, abrirModalDetalle, cerrarModal
  };
};