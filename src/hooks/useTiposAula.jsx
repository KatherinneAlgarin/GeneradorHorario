import React, { useState, useMemo } from 'react';

const initialTipos = [
  { id_tipo_aula: 1, nombre: 'Aula Teórica Común', activo: true },
  { id_tipo_aula: 2, nombre: 'Laboratorio de Cómputo', activo: true },
  { id_tipo_aula: 3, nombre: 'Laboratorio de Ciencias', activo: true },
  { id_tipo_aula: 4, nombre: 'Taller de Arquitectura', activo: true },
  { id_tipo_aula: 5, nombre: 'Auditorio', activo: true },
];

export const useTiposAula = () => {
  const [tipos, setTipos] = useState(initialTipos);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: null
  });

  const toggleStatus = (id) => {
    setTipos(tipos.map(t => 
      t.id_tipo_aula === id ? { ...t, activo: !t.activo } : t
    ));
  };

  const columns = useMemo(() => [
    { header: 'Nombre del Tipo', accessor: 'nombre' },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_tipo_aula)}
          title="Clic para Activar/Desactivar"
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [tipos]);

  const filteredTipos = useMemo(() => {
    if (!searchTerm) return tipos;
    const lower = searchTerm.toLowerCase();
    return tipos.filter(t => t.nombre.toLowerCase().includes(lower));
  }, [tipos, searchTerm]);

  const handleSaveTipo = (formData) => {
    if (!formData.nombre || formData.nombre.trim() === "") {
      return alert("El nombre del tipo de aula es obligatorio.");
    }

    if (modalState.type === 'add') {
      const maxId = tipos.length > 0 ? Math.max(...tipos.map(t => parseInt(t.id_tipo_aula))) : 0;
      
      const newTipo = { 
        ...formData, 
        id_tipo_aula: maxId + 1, 
        activo: true 
      };
      setTipos([...tipos, newTipo]);
    } else {
      // Editar
      setTipos(tipos.map(t => t.id_tipo_aula === formData.id_tipo_aula ? formData : t));
    }
    closeModal();
  };

  // --- GESTIÓN MODAL ---
  const openAddModal = () => {
    setModalState({ 
      isOpen: true, 
      type: 'add', 
      data: { nombre: '', activo: true } 
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
    handleSaveTipo
  };
};