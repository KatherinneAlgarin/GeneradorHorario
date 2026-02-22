import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const useFacultades = () => {
  const [facultades, setFacultades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: { codigo: '', nombre: '', descripcion: '', activo: true }
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


  const handleSaveFacultad = async (formData) => {
    if (!formData.codigo || !formData.nombre) {
      return alert("Código y Nombre son obligatorios.");
    }

    try {
      if (modalState.type === 'add') {
        await apiRequest('/facultades', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      } else {
        await apiRequest(`/facultades/${formData.id_facultad}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      }
      await fetchFacultades();
      closeModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al procesar la solicitud");
    }
  };

  const deleteFacultad = async (id) => {
    if (window.confirm("¿Confirma eliminar esta facultad?")) {
      try {
        await apiRequest(`/facultades/${id}`, { method: 'DELETE' });
        await fetchFacultades();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const toggleStatus = useCallback(async (id, currentStatus) => {
    try {
      await apiRequest(`/facultades/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ activo: !currentStatus })
      });
      await fetchFacultades();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  }, [fetchFacultades]);


  const columns = useMemo(() => [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre Facultad', accessor: 'nombre' },
    { header: 'Descripción', accessor: 'descripcion' },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_facultad, row.activo)}
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
      f.codigo?.toLowerCase().includes(lower) ||
      f.descripcion?.toLowerCase().includes(lower)
    );
  }, [facultades, searchTerm]);


  
  const openAddModal = () => {
    setModalState({ 
      isOpen: true, type: 'add', 
      data: { codigo: '', nombre: '', descripcion: '', activo: true } 
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
    deleteFacultad,
    handleInputChange,
    loading
  };
};