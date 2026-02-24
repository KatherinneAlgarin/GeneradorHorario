import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const useMaterias = () => {
  const [materias, setMaterias] = useState([]);
  const [tiposAula, setTiposAula] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    type: 'add', 
    data: null 
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t, p] = await Promise.all([
        apiRequest('/asignaturas'),
        apiRequest('/tipos-aula'),
        apiRequest('/planes-estudio')
      ]);
      setMaterias(Array.isArray(m) ? m : []);
      setTiposAula(Array.isArray(t) ? t : []);
      setPlanes(Array.isArray(p) ? p : []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleStatus = useCallback(async (id, currentStatus) => {
    if (!currentStatus) return;
    if (window.confirm("¿Confirma dar de baja esta asignatura?")) {
      try {
        await apiRequest(`/asignaturas/desactivar/${id}`, { method: 'PUT' });
        await fetchData();
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  }, [fetchData]);

  const columns = useMemo(() => [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Asignatura', accessor: 'nombre' },
    { 
      header: 'Req. Aula', 
      accessor: 'requiere_tipo_aula',
      render: (row) => row.tipo_aula?.nombre || '---'
    },
    { header: 'H. Teóricas', accessor: 'horas_teoricas' },
    { header: 'H. Prácticas', accessor: 'horas_practicas' },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_asignatura, row.activo)}
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [toggleStatus]);

  const filteredMaterias = useMemo(() => {
    if (!searchTerm) return materias;
    const lower = searchTerm.toLowerCase();
    return materias.filter(m => 
      m.nombre?.toLowerCase().includes(lower) || 
      m.codigo?.toLowerCase().includes(lower) ||
      m.tipo_aula?.nombre?.toLowerCase().includes(lower)
    );
  }, [materias, searchTerm]);

  const handleSaveMateria = async (formData) => {
    if (!formData.nombre || !formData.codigo) {
      return alert("Nombre y Código son obligatorios.");
    }
    try {
      const payload = {
        ...formData,
        horas_teoricas: parseInt(formData.horas_teoricas) || 0,
        horas_practicas: parseInt(formData.horas_practicas) || 0,
        ciclo_recomendado: parseInt(formData.ciclo_recomendado) || 1
      };
      
      const url = modalState.type === 'add' ? '/asignaturas' : `/asignaturas/actualizar/${formData.id_asignatura}`;
      const method = modalState.type === 'add' ? 'POST' : 'PUT';
      
      await apiRequest(url, { method, body: JSON.stringify(payload) });
      await fetchData();
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const openAddModal = () => {
    const initialData = { 
      codigo: '', nombre: '', requiere_tipo_aula: '', 
      horas_teoricas: 0, horas_practicas: 0, 
      id_plan_estudio: '', ciclo_recomendado: 1 
    };
    setModalState({ isOpen: true, type: 'add', data: initialData });
    return initialData;
  };

  const openEditModal = (item) => {
    const planRelacion = item.plan_asignatura?.[0] || {};
    const dataToEdit = { 
      ...item, 
      id_plan_estudio: planRelacion.id_plan_estudio || '',
      ciclo_recomendado: planRelacion.ciclo_recomendado || 1
    };

    setModalState({ isOpen: true, type: 'edit', data: dataToEdit });
    return dataToEdit; 
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    materias: filteredMaterias, tiposAula, planes, columns,
    searchTerm, setSearchTerm, modalState, loading,
    openAddModal, openEditModal, closeModal, handleSaveMateria
  };
};