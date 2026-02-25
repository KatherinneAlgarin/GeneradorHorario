import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const usePlanEstudio = () => {
  const [planes, setPlanes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  
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
      console.error("Error al cargar datos en Planes:", error);
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
        setNotification({
          show: true,
          message: "Plan de estudio dado de baja exitosamente",
          type: 'success'
        });
        await fetchData();
      } catch (error) {
        if (error.statusCode >= 500) {
          console.error("Error al desactivar plan de estudio:", error);
        }
        setNotification({
          show: true,
          message: error.message || "Error al dar de baja el plan de estudio",
          type: 'error'
        });
      }
    }
  }, [fetchData]);

  const handleSavePlan = async (formData) => {
    // Validar campos obligatorios
    if (!formData.nombre || !formData.id_carrera) {
      setNotificationModal({
        show: true,
        message: "La carrera y el nombre son obligatorios",
        type: 'error'
      });
      return;
    }

    // Validar que año_inicio < año_fin (si ambos están presentes)
    if (formData.fecha_inicio && formData.fecha_fin) {
      const yearInicio = parseInt(formData.fecha_inicio);
      const yearFin = parseInt(formData.fecha_fin);
      
      if (yearInicio >= yearFin) {
        setNotificationModal({
          show: true,
          message: "El año de inicio debe ser anterior al año de fin",
          type: 'error'
        });
        return;
      }
    }

    try {
      const payload = {
        id_carrera: formData.id_carrera,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        fecha_inicio: formData.fecha_inicio ? new Date(`${formData.fecha_inicio}-01-01`) : null,
        fecha_fin: formData.fecha_fin ? new Date(`${formData.fecha_fin}-12-31`) : null,
        vigente: formData.vigente !== undefined ? formData.vigente : true
      };

      if (modalState.type === 'add') {
        await apiRequest('/planes-estudio', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setNotificationModal({
          show: true,
          message: "Plan de estudio creado exitosamente",
          type: 'success'
        });
      } else {
        await apiRequest(`/planes-estudio/actualizar/${formData.id_plan_estudio}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setNotificationModal({
          show: true,
          message: "Plan de estudio actualizado exitosamente",
          type: 'success'
        });
      }
      await fetchData();
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      if (error.statusCode >= 500) {
        console.error("Error al guardar plan de estudio:", error);
      }
      setNotificationModal({
        show: true,
        message: error.message || "Error al procesar la solicitud",
        type: 'error'
      });
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
    planes: filteredPlanes, 
    carreras, 
    columns,
    searchTerm, 
    setSearchTerm, 
    loading,
    modalState,
    openAddModal, 
    openEditModal, 
    closeModal,
    handleSavePlan, 
    handleInputChange,
    notification,
    setNotification,
    notificationModal,
    setNotificationModal
  };
};