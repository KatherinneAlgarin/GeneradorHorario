import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const useCarreras = () => {
  const [carreras, setCarreras] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: { codigo: '', nombre: '', descripcion: '', id_facultad: '', activo: true }
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [carrerasData, facultadesData] = await Promise.all([
        apiRequest('/carreras'),
        apiRequest('/facultades')
      ]);
      
      setCarreras(Array.isArray(carrerasData) ? carrerasData : []);
      setFacultades(Array.isArray(facultadesData) ? facultadesData : []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: val }
    }));
  };


  const toggleStatus = useCallback(async (id, currentStatus) => {
    if (!currentStatus) return;

    if (window.confirm("¿Confirma dar de baja esta carrera?")) {
      try {
        await apiRequest(`/carreras/desactivar/${id}`, { method: 'PUT' });
        await fetchData();
        setNotification({
          show: true,
          message: "Carrera dada de baja exitosamente",
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
  }, [fetchData]);

  const handleSaveCarrera = async (formData) => {
    if (!formData.codigo || !formData.nombre || !formData.id_facultad) {
      setNotification({
        show: true,
        message: "Facultad, nombre y código son obligatorios.",
        type: 'error'
      });
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre,
        codigo: formData.codigo,
        descripcion: formData.descripcion || "",
        id_facultad: formData.id_facultad
      };

      if (modalState.type === 'add') {
        await apiRequest('/carreras', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setNotification({
          show: true,
          message: "Carrera creada exitosamente",
          type: 'success'
        });
      } else {
        await apiRequest(`/carreras/actualizar/${formData.id_carrera}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setNotification({
          show: true,
          message: "Carrera actualizada exitosamente",
          type: 'success'
        });
      }
      await fetchData();
      closeModal();
    } catch (error) {
      setNotification({
        show: true,
        message: error.message,
        type: 'error'
      });
    }
  };

  const columns = useMemo(() => [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre Carrera', accessor: 'nombre' },
    { 
      header: 'Facultad', 
      accessor: 'facultad', 
      render: (row) => row.facultad?.nombre || '---'
    },
    { 
      header: 'Descripción', 
      accessor: 'descripcion',
      render: (row) => (
        <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.descripcion}>
          {row.descripcion || '---'}
        </div>
      )
    },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_carrera, row.activo)}
          title={row.activo ? "Clic para dar de baja" : "Inactiva"}
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [toggleStatus]);

  const filteredCarreras = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return carreras.filter(c => 
      c.nombre?.toLowerCase().includes(lower) || 
      c.codigo?.toLowerCase().includes(lower) ||
      c.facultad?.nombre?.toLowerCase().includes(lower)
    );
  }, [carreras, searchTerm]);

  const openAddModal = () => {
    setModalState({ 
      isOpen: true, type: 'add', 
      data: { codigo: '', nombre: '', descripcion: '', id_facultad: '', activo: true } 
    });
  };

  const openEditModal = (item) => {
    setModalState({ isOpen: true, type: 'edit', data: { ...item } });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    carreras: filteredCarreras,
    facultades,
    columns,
    searchTerm, setSearchTerm,
    modalState,
    openAddModal, openEditModal, closeModal,
    handleSaveCarrera,
    handleInputChange,
    loading,
    notification,
    setNotification
  };
};