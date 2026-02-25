import React, { useState, useMemo } from 'react';

const initialEquipos = [
  { id_equipamiento: 1, nombre: 'Proyector Multimedia', activo: true },
  { id_equipamiento: 2, nombre: 'Aire Acondicionado', activo: true },
  { id_equipamiento: '3', nombre: 'Pizarra Inteligente', activo: true },
  { id_equipamiento: '4', nombre: 'Computadora Instructor', activo: true },
  { id_equipamiento: '5', nombre: 'Escritorio Docente', activo: true },
];

export const useEquipamiento = () => {
  const [equipos, setEquipos] = useState(initialEquipos);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: null
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

  const toggleStatus = (id) => {
    setEquipos(equipos.map(e => 
      e.id_equipamiento === id ? { ...e, activo: !e.activo } : e
    ));
    setNotification({
      show: true,
      message: 'Estado del equipo actualizado',
      type: 'success'
    });
  };

  const columns = useMemo(() => [
    { header: 'Nombre del Equipo', accessor: 'nombre' },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_equipamiento)}
          title="Clic para Activar/Desactivar"
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [equipos]);

  const filteredEquipos = useMemo(() => {
    if (!searchTerm) return equipos;
    const lower = searchTerm.toLowerCase();
    return equipos.filter(e => e.nombre.toLowerCase().includes(lower));
  }, [equipos, searchTerm]);

  const handleSaveEquipamiento = (formData) => {
    if (!formData.nombre || formData.nombre.trim() === "") {
      setNotificationModal({
        show: true,
        message: "El nombre del equipo es obligatorio.",
        type: 'error'
      });
      return;
    }

    if (modalState.type === 'add') {
      const maxId = equipos.length > 0 ? Math.max(...equipos.map(e => parseInt(e.id_equipamiento))) : 0;
      
      const newEquipo = { 
        ...formData, 
        id_equipamiento: maxId + 1, 
        activo: true 
      };
      setEquipos([...equipos, newEquipo]);
      setNotificationModal({
        show: true,
        message: 'Equipo creado correctamente',
        type: 'success'
      });
    } else {
      setEquipos(equipos.map(e => e.id_equipamiento === formData.id_equipamiento ? formData : e));
      setNotificationModal({
        show: true,
        message: 'Equipo actualizado correctamente',
        type: 'success'
      });
    }
    setTimeout(() => closeModal(), 1500);
  };

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
    equipos: filteredEquipos,
    columns,
    searchTerm, setSearchTerm,
    modalState,
    openAddModal, openEditModal, closeModal,
    handleSaveEquipamiento,
    notificationModal, setNotificationModal,
    notification, setNotification
  };
};