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
    if (!formData.nombre || !formData.fecha_inicio || !formData.fecha_fin) {
      return alert("Todos los campos son obligatorios.");
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
      await fetchCiclos();
      closeModal();
    } catch (error) {
      const msg = error.message || "Error al guardar el ciclo";
      alert(msg);
    }
  };

  const handleActivarCiclo = async (id) => {
    if (window.confirm("¿Deseas establecer este ciclo como el único activo del sistema?")) {
      try {
        await apiRequest(`/ciclos/activar/${id}`, { method: 'PUT' });
        await fetchCiclos();
      } catch (error) {
        const msg = error.message || "Error al activar el ciclo";
        alert(msg);
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
    handleSaveCiclo, handleInputChange, handleActivarCiclo
  };
};