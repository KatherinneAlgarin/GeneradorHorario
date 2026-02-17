import React, { useState, useMemo } from 'react';

const mockFacultades = [
  { id_facultad: 1, nombre: 'Facultad de Ingeniería' },
  { id_facultad: 2, nombre: 'Facultad de Ciencias de la Salud' },
  { id_facultad: 3, nombre: 'Facultad de Ciencias y Humanidades' }
];


const initialCarreras = [
  { 
    id_carrera: 1, 
    id_facultad: 1, 
    codigo: 'ICC', 
    nombre: 'Ingeniería en Desarrollo de Software', 
    activo: true 
  },
  { 
    id_carrera: 2, 
    id_facultad: 2, 
    codigo: 'MED', 
    nombre: 'Doctorado en Medicina', 
    activo: true 
  }
];

export const useCarreras = () => {
  const [carreras, setCarreras] = useState(initialCarreras);
  const [facultades] = useState(mockFacultades);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: null
  });

  const toggleStatus = (id) => {
    setCarreras(carreras.map(c => 
      c.id_carrera === id ? { ...c, activo: !c.activo } : c
    ));
  };


  const columns = useMemo(() => [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre Carrera', accessor: 'nombre' },
    { 
      header: 'Facultad', 
      accessor: 'id_facultad',
     
      render: (row) => {
        const fac = facultades.find(f => f.id_facultad === parseInt(row.id_facultad));
        return fac ? fac.nombre : '---';
      }
    },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_carrera)}
          title="Clic para Activar/Desactivar"
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [carreras, facultades]);


  const filteredCarreras = useMemo(() => {
    if (!searchTerm) return carreras;
    const lower = searchTerm.toLowerCase();
    
    return carreras.filter(c => {

      const nombreFacultad = facultades.find(f => f.id_facultad === parseInt(c.id_facultad))?.nombre.toLowerCase() || '';
      
      return (
        c.nombre.toLowerCase().includes(lower) || 
        c.codigo.toLowerCase().includes(lower) ||
        nombreFacultad.includes(lower)
      );
    });
  }, [carreras, facultades, searchTerm]);

 
  const handleSaveCarrera = (formData) => {
   
    if (!formData.codigo || !formData.nombre || !formData.id_facultad) {
      return alert("Todos los campos son obligatorios.");
    }

    const dataToSave = {
      ...formData,
      id_facultad: parseInt(formData.id_facultad)
    };

    if (modalState.type === 'add') {
      
      const maxId = carreras.length > 0 
        ? Math.max(...carreras.map(c => c.id_carrera)) 
        : 0;
        
      const newCarrera = { 
        ...dataToSave, 
        id_carrera: maxId + 1,
        activo: true 
      };
      setCarreras([...carreras, newCarrera]);
    } else {
      // Editar
      setCarreras(carreras.map(c => c.id_carrera === dataToSave.id_carrera ? dataToSave : c));
    }
    closeModal();
  };

  // --- GESTIÓN DE MODALES ---
  const openAddModal = () => {
    setModalState({ 
      isOpen: true, 
      type: 'add', 
      data: { codigo: '', nombre: '', id_facultad: '', activo: true } 
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
    handleSaveCarrera
  };
};