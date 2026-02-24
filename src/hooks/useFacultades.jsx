import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const useFacultades = () => {
  const [facultades, setFacultades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
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

    if (window.confirm("¿Confirma dar de baja esta facultad? No se podrá desactivar si tiene carreras asociadas.")) {
      try {
        await apiRequest(`/facultades/desactivar/${id}`, { method: 'PUT' });
        await fetchFacultades();
      } catch (error) {
        alert(error.message || "Error al intentar dar de baja");
      }
    }
  }, [fetchFacultades]);

  const handleSaveFacultad = async (formData) => {
    if (!formData.nombre) return alert("El nombre es obligatorio.");

    try {
      if (modalState.type === 'add') {
        await apiRequest('/facultades', {
          method: 'POST',
          body: JSON.stringify({ nombre: formData.nombre, descripcion: formData.descripcion })
        });
      } else {
        await apiRequest(`/facultades/${formData.id_facultad}`, {
          method: 'PUT',
          body: JSON.stringify({ nombre: formData.nombre, descripcion: formData.descripcion })
        });
      }
      await fetchFacultades();
      closeModal();
    } catch (error) {
      alert(error.message || "Error al procesar la solicitud");
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
    loading
  };
};