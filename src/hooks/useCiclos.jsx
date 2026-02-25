import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const useCiclos = () => {
  const [ciclos, setCiclos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: { nombre: '', fecha_inicio: '', fecha_fin: '' }
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

  const fetchCiclos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/ciclos'); // Asegúrate que esta ruta coincida con tu backend
      setCiclos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar ciclos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCiclos();
  }, [fetchCiclos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value }
    }));
  };

  const handleSaveCiclo = async (formData) => {
    // Validar que los campos no estén vacíos
    if (!formData.nombre || !formData.fecha_inicio || !formData.fecha_fin) {
      setNotificationModal({
        show: true,
        message: "Nombre, fecha de inicio y fecha de fin son obligatorios",
        type: 'error'
      });
      return;
    }

    // Validar que fecha_inicio < fecha_fin
    const fechaInicio = new Date(formData.fecha_inicio);
    const fechaFin = new Date(formData.fecha_fin);
    
    if (fechaInicio >= fechaFin) {
      setNotificationModal({
        show: true,
        message: "La fecha de inicio debe ser anterior a la fecha de fin",
        type: 'error'
      });
      return;
    }

    try {
      if (modalState.type === 'add') {
        await apiRequest('/ciclos', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      } else {
        await apiRequest(`/ciclos/actualizar/${formData.id_ciclo_academico}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      }
      setNotificationModal({
        show: true,
        message: modalState.type === 'add' ? 'Ciclo creado correctamente' : 'Ciclo actualizado correctamente',
        type: 'success'
      });
      await fetchCiclos();
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      if (error.statusCode >= 500) {
        console.error("Error al guardar ciclo:", error);
      }
      setNotificationModal({
        show: true,
        message: error.message || "Error al guardar el ciclo",
        type: 'error'
      });
    }
  };

  const handleActivarCiclo = async (id) => {
    if (window.confirm("¿Deseas establecer este ciclo como el único activo del sistema?")) {
      try {
        await apiRequest(`/ciclos/activar/${id}`, { method: 'PUT' });
        setNotification({
          show: true,
          message: 'Ciclo activado correctamente',
          type: 'success'
        });
        await fetchCiclos();
      } catch (error) {
        if (error.statusCode >= 500) {
          console.error("Error al activar ciclo:", error);
        }
        setNotification({
          show: true,
          message: error.message || "Error al activar el ciclo",
          type: 'error'
        });
      }
    }
  };

  const columns = useMemo(() => [
    { header: 'Nombre del Ciclo', accessor: 'nombre' },
    { 
      header: 'Fecha Inicio', 
      accessor: 'fecha_inicio',
      render: (row) => new Date(row.fecha_inicio).toLocaleDateString()
    },
    { 
      header: 'Fecha Fin', 
      accessor: 'fecha_fin',
      render: (row) => new Date(row.fecha_fin).toLocaleDateString()
    },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'}`}>
          {row.activo ? 'Vigente' : 'Inactivo'}
        </span>
      )
    }
  ], []);

  const filteredCiclos = useMemo(() => {
    return ciclos.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ciclos, searchTerm]);

  const openAddModal = () => setModalState({ 
    isOpen: true, type: 'add', data: { nombre: '', fecha_inicio: '', fecha_fin: '' } 
  });

  const openEditModal = (item) => {
    const formattedItem = {
      ...item,
      fecha_inicio: item.fecha_inicio.split('T')[0],
      fecha_fin: item.fecha_fin.split('T')[0]
    };
    setModalState({ isOpen: true, type: 'edit', data: formattedItem });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    ciclos: filteredCiclos,
    columns,
    searchTerm, setSearchTerm,
    modalState,
    loading,
    openAddModal, openEditModal, closeModal,
    handleSaveCiclo, handleInputChange, handleActivarCiclo,
    notificationModal, setNotificationModal,
    notification, setNotification
  };
};