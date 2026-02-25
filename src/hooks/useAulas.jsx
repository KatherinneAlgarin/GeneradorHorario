import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const useAulas = () => {
  const [aulas, setAulas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: { nombre: '', edificio: '', ubicacion: 'Campus', capacidad: 30, id_tipo_aula: '', activo: true }
  });

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

  const fetchAulas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/aulas');
      setAulas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar aulas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTipos = useCallback(async () => {
    try {
      const data = await apiRequest('/tipos-aula');
      setTipos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar tipos de aula:", error);
    }
  }, []);

  useEffect(() => {
    fetchAulas();
    fetchTipos();
  }, [fetchAulas, fetchTipos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value }
    }));
  };


  const toggleStatus = useCallback(async (id, currentStatus) => {
    if (!currentStatus) return;

    if (window.confirm("¿Confirma dar de baja esta aula?")) {
      try {
        await apiRequest(`/aulas/desactivar/${id}`, { method: 'PUT' });
        setNotification({
          show: true,
          message: 'Aula desactivada correctamente',
          type: 'success'
        });
        await fetchAulas();
      } catch (error) {
        if (error.statusCode >= 500) {
          console.error("Error al cambiar estado:", error);
        }
        setNotification({
          show: true,
          message: error.message || "No se pudo cambiar el estado del aula",
          type: 'error'
        });
      }
    }
  }, [fetchAulas]);


  const columns = useMemo(() => [
    { header: 'Aula', accessor: 'nombre' },
    { header: 'Edificio', accessor: 'edificio' },
    { header: 'Ubicación', accessor: 'ubicacion' },
    { header: 'Capacidad', accessor: 'capacidad' },
    { 
      header: 'Tipo', 
      accessor: 'tipo_aula',
      render: (row) => row.tipo_aula?.nombre || '---'
    },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_aula, row.activo)}
          title={row.activo ? "Clic para dar de baja" : "Aula Inactiva"}
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [toggleStatus]);

  const filteredAulas = useMemo(() => {
    if (!searchTerm) return aulas;
    const lower = searchTerm.toLowerCase();
    
    return aulas.filter(a => 
      a.nombre?.toLowerCase().includes(lower) || 
      a.edificio?.toLowerCase().includes(lower) ||
      a.tipo_aula?.nombre?.toLowerCase().includes(lower)
    );
  }, [aulas, searchTerm]);

  const handleSaveAula = async (formData) => {
    if (!formData.nombre || !formData.edificio || !formData.id_tipo_aula || !formData.capacidad) {
      setNotificationModal({
        show: true,
        message: "Complete los campos obligatorios.",
        type: 'error'
      });
      return;
    }

    const dataToSave = {
      nombre: formData.nombre,
      edificio: formData.edificio,
      ubicacion: formData.ubicacion,
      capacidad: parseInt(formData.capacidad),
      id_tipo_aula: formData.id_tipo_aula
    };

    try {
      if (modalState.type === 'add') {
        await apiRequest('/aulas', {
          method: 'POST',
          body: JSON.stringify(dataToSave)
        });
      } else {
        await apiRequest(`/aulas/actualizar/${formData.id_aula}`, {
          method: 'PUT',
          body: JSON.stringify(dataToSave)
        });
      }
      setNotificationModal({
        show: true,
        message: modalState.type === 'add' ? 'Aula creada correctamente' : 'Aula actualizada correctamente',
        type: 'success'
      });
      await fetchAulas();
      setTimeout(() => closeModal(), 1500);
      } catch (error) {
        if (error.statusCode >= 500) {
          console.error("Error al guardar aula:", error);
        }
        setNotificationModal({
          show: true,
          message: error.message || "Error al procesar la solicitud",
          type: 'error'
        });
      }
  };

  const openAddModal = () => {
    setModalState({ 
      isOpen: true, 
      type: 'add', 
      data: { nombre: '', edificio: '', ubicacion: 'Campus', capacidad: 30, id_tipo_aula: '', activo: true } 
    });
  };

  const openEditModal = (item) => {
    setModalState({ 
      isOpen: true, 
      type: 'edit', 
      data: { ...item } 
    });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    aulas: filteredAulas, 
    tipos,
    columns,
    searchTerm, setSearchTerm,
    modalState,
    openAddModal, openEditModal, closeModal,
    handleSaveAula,
    handleInputChange,
    loading,
    notificationModal, setNotificationModal,
    notification, setNotification
  };
};