import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const usePlanEstudio = () => {
  const [planes, setPlanes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: { id_carrera: '', nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', vigente: true }
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [planesData, carrerasData] = await Promise.all([
        apiRequest('/planes-estudio'),
        apiRequest('/carreras')
      ]);
      
      setPlanes(Array.isArray(planesData) ? planesData : []);
      setCarreras(Array.isArray(carrerasData) ? carrerasData : []);
    } catch (error) {
      error("Error al cargar datos en Planes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value }
    }));
  };

  const toggleStatus = useCallback(async (id, currentStatus) => {
    if (!currentStatus) return; 

    if (window.confirm("¿Confirma dar de baja este plan de estudio?")) {
      try {
        await apiRequest(`/planes-estudio/desactivar/${id}`, { method: 'PUT' });
        await fetchData();
      } catch (error) {
        alert(error.message || "Error al intentar dar de baja el plan");
      }
    }
  }, [fetchData]);

  const handleSavePlan = async (formData) => {
    if (!formData.nombre || !formData.id_carrera) {
      return alert("La carrera y el nombre son obligatorios.");
    }

    try {
      const payload = {
        id_carrera: formData.id_carrera,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        fecha_inicio: formData.fecha_inicio ? `${formData.fecha_inicio}-01-01` : null,
        fecha_fin: formData.fecha_fin ? `${formData.fecha_fin}-12-31` : null
      };

      if (modalState.type === 'add') {
        await apiRequest('/planes-estudio', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest(`/planes-estudio/actualizar/${formData.id_plan_estudio}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }
      await fetchData();
      closeModal();
    } catch (error) {
      alert(error.message || "Error al guardar el plan de estudio");
    }
  };

  const getYearFromDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).getFullYear();
  };

  const columns = useMemo(() => [
    { header: 'Nombre del Plan', accessor: 'nombre' },
    { 
      header: 'Carrera', 
      accessor: 'carrera',
      render: (row) => row.carrera?.nombre || '---'
    },
    { header: 'Descripción', accessor: 'descripcion' },
    { 
      header: 'Año Inicio', 
      accessor: 'fecha_inicio',
      render: (row) => getYearFromDate(row.fecha_inicio)
    },
    { 
      header: 'Año Fin', 
      accessor: 'fecha_fin',
      render: (row) => getYearFromDate(row.fecha_fin)
    },
    { 
      header: 'Estado', 
      accessor: 'vigente',
      render: (row) => (
        <span 
          className={`status-badge ${row.vigente ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_plan_estudio, row.vigente)}
          title={row.vigente ? "Clic para dar de baja" : "Inactivo"}
        >
          {row.vigente ? 'Vigente' : 'Inactivo'}
        </span>
      )
    }
  ], [toggleStatus]);

  const filteredPlanes = useMemo(() => {
    if (!searchTerm) return planes;
    const lower = searchTerm.toLowerCase();
    
    return planes.filter(p => 
      p.nombre?.toLowerCase().includes(lower) || 
      p.carrera?.nombre?.toLowerCase().includes(lower) ||
      getYearFromDate(p.fecha_inicio).toString().includes(lower)
    );
  }, [planes, searchTerm]);

  const openAddModal = () => {
    setModalState({ 
      isOpen: true, 
      type: 'add', 
      data: { 
        id_carrera: '', 
        nombre: '', 
        descripcion: '',
        fecha_inicio: new Date().getFullYear(), 
        fecha_fin: new Date().getFullYear() + 5, 
        vigente: true 
      } 
    });
  };

  const openEditModal = (item) => {
    setModalState({ 
      isOpen: true, 
      type: 'edit', 
      data: { 
        ...item,
        fecha_inicio: item.fecha_inicio ? new Date(item.fecha_inicio).getFullYear() : '',
        fecha_fin: item.fecha_fin ? new Date(item.fecha_fin).getFullYear() : ''
      } 
    });
  };
  
  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    planes: filteredPlanes, carreras, columns,
    searchTerm, setSearchTerm, loading,
    modalState,
    openAddModal, openEditModal, closeModal,
    handleSavePlan, handleInputChange
  };
};