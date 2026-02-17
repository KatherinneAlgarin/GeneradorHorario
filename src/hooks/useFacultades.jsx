import React, { useState, useMemo } from 'react'; // Importamos React para poder usar JSX en las columnas


const initialFacultades = [
  { 
    id_facultad: 'f1', 
    codigo: 'ING', 
    nombre: 'Facultad de Ingeniería', 
    descripcion: 'Encargada de las carreras técnicas y tecnológicas.', 
    activo: true 
  },
  { 
    id_facultad: 'f2', 
    codigo: 'MED', 
    nombre: 'Facultad de Ciencias de la Salud', 
    descripcion: 'Formación de profesionales en medicina y enfermería.', 
    activo: true 
  }
];

export const useFacultades = () => {
  const [facultades, setFacultades] = useState(initialFacultades);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: null
  });

  // --- ACCIONES ---
  const toggleStatus = (id) => {
    setFacultades(facultades.map(f => 
      f.id_facultad === id ? { ...f, activo: !f.activo } : f
    ));
  };

  const deleteFacultad = (id) => {
    if(window.confirm("¿Confirma eliminar esta facultad?")) {
        setFacultades(facultades.filter(f => f.id_facultad !== id));
    }
  };

  const handleSaveFacultad = (formData) => {
    if (!formData.codigo || !formData.nombre || !formData.descripcion) {
      return alert("Todos los campos son obligatorios.");
    }

    if (modalState.type === 'add') {
      const newFacultad = { ...formData, id_facultad: crypto.randomUUID(), activo: true };
      setFacultades([...facultades, newFacultad]);
    } else {
      setFacultades(facultades.map(f => f.id_facultad === formData.id_facultad ? formData : f));
    }
    closeModal();
  };

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
          onClick={() => toggleStatus(row.id_facultad)}
          title="Clic para cambiar estado"
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [facultades]);

  // --- FILTRADO ---
  const filteredFacultades = useMemo(() => {
    if (!searchTerm) return facultades;
    const lower = searchTerm.toLowerCase();
    return facultades.filter(f => 
      f.nombre.toLowerCase().includes(lower) || 
      f.codigo.toLowerCase().includes(lower) ||
      f.descripcion.toLowerCase().includes(lower)
    );
  }, [facultades, searchTerm]);

  // --- MODALES ---
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
    deleteFacultad 
  };
};