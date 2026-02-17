import React, { useState, useMemo } from 'react';


const mockCarreras = [
  { id_carrera: 1, nombre: 'Ingeniería en Desarrollo de Software' },
  { id_carrera: 2, nombre: 'Doctorado en Medicina' },
  { id_carrera: 3, nombre: 'Licenciatura en Idiomas' }
];


const initialPlanes = [
  { 
    id_plan: 1, 
    id_carrera: 1, 
    nombre: 'Plan de Formación 2022', 
    version: '1.0',
    fecha_inicio: 2022, 
    fecha_fin: 2027,  
    activo: true 
  },
  { 
    id_plan: 2, 
    id_carrera: 2, 
    nombre: 'Currícula Médica Reformada', 
    version: '2.0',
    fecha_inicio: 2018,
    fecha_fin: 2023,
    activo: false 
  }
];

export const usePlanEstudio = () => {
  const [planes, setPlanes] = useState(initialPlanes);
  const [carreras] = useState(mockCarreras);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: null
  });


  const toggleStatus = (id) => {
    setPlanes(planes.map(p => 
      p.id_plan === id ? { ...p, activo: !p.activo } : p
    ));
  };


  const columns = useMemo(() => [
    { header: 'Nombre del Plan', accessor: 'nombre' },
    { header: 'Versión', accessor: 'version' },
    { 
      header: 'Carrera', 
      accessor: 'id_carrera',
      render: (row) => {
        const carrera = carreras.find(c => c.id_carrera === parseInt(row.id_carrera));
        return carrera ? carrera.nombre : '---';
      }
    },
    { header: 'Año Inicio', accessor: 'fecha_inicio' }, // Etiqueta visual "Año", variable "fecha"
    { header: 'Año Fin', accessor: 'fecha_fin' },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_plan)}
          title="Clic para Activar/Desactivar"
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [planes, carreras]);


  const filteredPlanes = useMemo(() => {
    if (!searchTerm) return planes;
    const lower = searchTerm.toLowerCase();
    
    return planes.filter(p => {
      const nombreCarrera = carreras.find(c => c.id_carrera === parseInt(p.id_carrera))?.nombre.toLowerCase() || '';
      return (
        p.nombre.toLowerCase().includes(lower) || 
        p.version.toLowerCase().includes(lower) ||
        p.fecha_inicio.toString().includes(lower) || // Convertimos a string para buscar "2022"
        nombreCarrera.includes(lower)
      );
    });
  }, [planes, carreras, searchTerm]);


  const handleSavePlan = (formData) => {
      if (!formData.nombre || !formData.id_carrera || !formData.version || !formData.fecha_inicio || !formData.fecha_fin) {
      return alert("Todos los campos son obligatorios.");
    }


    const inicio = parseInt(formData.fecha_inicio);
    const fin = parseInt(formData.fecha_fin);

    if (fin < inicio) {
      return alert("El año de fin no puede ser menor al año de inicio.");
    }

    const dataToSave = {
      ...formData,
      id_carrera: parseInt(formData.id_carrera),
      fecha_inicio: inicio,
      fecha_fin: fin
    };

    if (modalState.type === 'add') {
      const maxId = planes.length > 0 ? Math.max(...planes.map(p => p.id_plan)) : 0;
      const newPlan = { 
        ...dataToSave, 
        id_plan: maxId + 1, 
        activo: true 
      };
      setPlanes([...planes, newPlan]);
    } else {
      setPlanes(planes.map(p => p.id_plan === dataToSave.id_plan ? dataToSave : p));
    }
    closeModal();
  };

  const openAddModal = () => {
    setModalState({ 
      isOpen: true, 
      type: 'add', 
      data: { 
        nombre: '', 
        version: '', 
        id_carrera: '', 
        fecha_inicio: new Date().getFullYear(), 
        fecha_fin: new Date().getFullYear() + 5, 
        activo: true 
      } 
    });
  };

  const openEditModal = (item) => setModalState({ isOpen: true, type: 'edit', data: { ...item } });
  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    planes, carreras, columns,
    searchTerm, setSearchTerm,
    modalState,
    openAddModal, openEditModal, closeModal,
    handleSavePlan
  };
};