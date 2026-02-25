import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const useFacultades = () => {
  const [facultades, setFacultades] = useState([]);
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
    data: { nombre: '', descripcion: '', activo: true }
  });

  const fetchFacultades = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/facultades');
      setFacultades(data);
    } catch (error) {
      console.error("Error al cargar facultades:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacultades();
  }, [fetchFacultades]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value }
    }));
  };

  // Función para Desactivar desde la tabla
  const toggleStatus = useCallback(async (id, currentStatus) => {
    if (!currentStatus) return;

    if (window.confirm("¿Confirma dar de baja esta facultad?")) {
      try {
        await apiRequest(`/facultades/desactivar/${id}`, { method: 'PUT' });
        await fetchFacultades();
        setNotification({
          show: true,
          message: "Facultad dada de baja exitosamente",
          type: 'success'
        });
      } catch (error) {
        setNotification({
          show: true,
          message: error.message,
          type: 'error'
        });
      }
    }
  }, [fetchFacultades]);

  const handleSaveFacultad = async (formData) => {
    if (!formData.nombre) {
      setNotificationModal({
        show: true,
        message: "El nombre es obligatorio.",
        type: 'error'
      });
      return;
    }

    try {
      if (modalState.type === 'add') {
        await apiRequest('/facultades', {
          method: 'POST',
          body: JSON.stringify({ nombre: formData.nombre, descripcion: formData.descripcion })
        });
        setNotificationModal({
          show: true,
          message: "Facultad creada exitosamente",
          type: 'success'
        });
      } else {
        await apiRequest(`/facultades/actualizar/${formData.id_facultad}`, {
          method: 'PUT',
          body: JSON.stringify({ nombre: formData.nombre, descripcion: formData.descripcion })
        });
        setNotificationModal({
          show: true,
          message: "Facultad actualizada exitosamente",
          type: 'success'
        });
      }
      await fetchFacultades();
      closeModal();
    } catch (error) {
      setNotificationModal({
        show: true,
        message: error.message,
        type: 'error'
      });
    }
  };

  const columns = useMemo(() => [
    { header: 'Nombre Facultad', accessor: 'nombre' },
    { header: 'Descripción', accessor: 'descripcion' },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_facultad, row.activo)}
          title={row.activo ? "Clic para dar de baja" : "Inactiva"}
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [toggleStatus]);

  const filteredFacultades = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return facultades.filter(f => 
      f.nombre?.toLowerCase().includes(lower) || 
      f.descripcion?.toLowerCase().includes(lower)
    );
  }, [facultades, searchTerm]);

  const openAddModal = () => {
    setModalState({ 
      isOpen: true, type: 'add', 
      data: { nombre: '', descripcion: '', activo: true } 
    });
  };

  const openEditModal = (item) => {
    setModalState({ isOpen: true, type: 'edit', data: { ...item } });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    facultades: filteredFacultades,
    columns,
    searchTerm, setSearchTerm,
    modalState,
    openAddModal, openEditModal, closeModal,
    handleSaveFacultad,
    handleInputChange,
    loading,
    notification,
    setNotification,
    notificationModal,
    setNotificationModal
  };
};