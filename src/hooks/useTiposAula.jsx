import { useState, useMemo, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';

export const useTiposAula = () => {
  const [tipos, setTipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: { nombre: '', descripcion: '' }
  });

  const fetchTipos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/tipos-aula');
      setTipos(data);
    } catch (error) {
      console.error("Error al cargar tipos de aula:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value }
    }));
  };

  const columns = useMemo(() => [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Descripción', accessor: 'descripcion' }
  ], []);

  const filteredTipos = useMemo(() => {
    if (!searchTerm) return tipos;
    const lower = searchTerm.toLowerCase();
    return tipos.filter(t => 
      t.nombre?.toLowerCase().includes(lower) || 
      t.descripcion?.toLowerCase().includes(lower)
    );
  }, [tipos, searchTerm]);

  const handleSaveTipo = async (formData) => {
    if (!formData.nombre || formData.nombre.trim() === "") {
      return alert("El nombre es obligatorio.");
    }

    try {
      if (modalState.type === 'add') {
        await apiRequest('/tipos-aula', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      } else {
        await apiRequest(`/tipos-aula/actualizar/${formData.id_tipo_aula}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      }
      await fetchTipos();
      closeModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      const msg = error.message || "Error al procesar la solicitud";
      alert(msg);
    }
  };

  const deleteTipo = async (id) => {
    if (window.confirm("¿Confirma eliminar este tipo de aula?")) {
      try {
        await apiRequest(`/tipos-aula/eliminar/${id}`, { method: 'DELETE' });
        await fetchTipos();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const openAddModal = () => {
    setModalState({ 
      isOpen: true, 
      type: 'add', 
      data: { nombre: '', descripcion: '' } 
    });
  };

  const openEditModal = (item) => {
    setModalState({ isOpen: true, type: 'edit', data: { ...item } });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    tipos: filteredTipos,
    columns,
    searchTerm, setSearchTerm,
    modalState,
    openAddModal, openEditModal, closeModal,
    handleSaveTipo,
    handleInputChange,
    deleteTipo,
    loading
  };
};
