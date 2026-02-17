import React, { useState, useMemo } from 'react';

const mockTiposAula = [
  { id_tipo: 1, nombre: 'Aula Teórica' },
  { id_tipo: 2, nombre: 'Laboratorio de Cómputo' },
  { id_tipo: 3, nombre: 'Laboratorio de Ciencias' },
  { id_tipo: 4, nombre: 'Taller de Arquitectura' }
];

const initialMaterias = [
  { 
    id_materia: 1, 
    codigo: 'MAT101', 
    nombre: 'Matemática I', 
    horas_teoricas: 3,
    horas_practicas: 2,
    id_tipo_aula: 1,
    activo: true 
  },
  { 
    id_materia: 2, 
    codigo: 'PROG1', 
    nombre: 'Programación Orientada a Objetos', 
    horas_teoricas: 2,
    horas_practicas: 4,
    id_tipo_aula: 2, 
    activo: true 
  }
];

export const useMaterias = () => {
  const [materias, setMaterias] = useState(initialMaterias);
  const [tiposAula] = useState(mockTiposAula);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: null
  });

  const toggleStatus = (id) => {
    setMaterias(materias.map(m => 
      m.id_materia === id ? { ...m, activo: !m.activo } : m
    ));
  };

  // --- COLUMNAS ---
  const columns = useMemo(() => [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Asignatura', accessor: 'nombre' },
    { 
      header: 'Req. Aula', 
      accessor: 'id_tipo_aula',
      render: (row) => {
        const tipo = tiposAula.find(t => t.id_tipo === parseInt(row.id_tipo_aula));
        return tipo ? tipo.nombre : '---';
      }
    },
    { header: 'H. Teóricas', accessor: 'horas_teoricas' },
    { header: 'H. Prácticas', accessor: 'horas_practicas' },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_materia)}
          title="Clic para Activar/Desactivar"
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [materias, tiposAula]);

  // --- FILTRADO ---
  const filteredMaterias = useMemo(() => {
    if (!searchTerm) return materias;
    const lower = searchTerm.toLowerCase();
    
    return materias.filter(m => {
      const nombreTipo = tiposAula.find(t => t.id_tipo === parseInt(m.id_tipo_aula))?.nombre.toLowerCase() || '';
      return (
        m.nombre.toLowerCase().includes(lower) || 
        m.codigo.toLowerCase().includes(lower) ||
        nombreTipo.includes(lower)
      );
    });
  }, [materias, tiposAula, searchTerm]);

  const handleSaveMateria = (formData) => {
    // Validaciones
    if (!formData.nombre || !formData.codigo || !formData.id_tipo_aula) {
      return alert("Complete los campos obligatorios.");
    }
    
    if (formData.horas_teoricas < 0 || formData.horas_practicas < 0) {
      return alert("Las horas no pueden ser negativas.");
    }

    const dataToSave = {
      ...formData,
      id_tipo_aula: parseInt(formData.id_tipo_aula),
      horas_teoricas: parseInt(formData.horas_teoricas) || 0,
      horas_practicas: parseInt(formData.horas_practicas) || 0
    };

    if (modalState.type === 'add') {
      const maxId = materias.length > 0 ? Math.max(...materias.map(m => m.id_materia)) : 0;
      
      const newMateria = { 
        ...dataToSave, 
        id_materia: maxId + 1,
        activo: true 
      };
      setMaterias([...materias, newMateria]);
    } else {
      setMaterias(materias.map(m => m.id_materia === dataToSave.id_materia ? dataToSave : m));
    }
    closeModal();
  };

  // --- GESTIÓN MODAL ---
  const openAddModal = () => {
    setModalState({ 
      isOpen: true, 
      type: 'add', 
      data: { 
        codigo: '', 
        nombre: '', 
        id_tipo_aula: '', 
        horas_teoricas: 0, 
        horas_practicas: 0, 
        activo: true 
      } 
    });
  };

  const openEditModal = (item) => setModalState({ isOpen: true, type: 'edit', data: { ...item } });
  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    materias, tiposAula, columns,
    searchTerm, setSearchTerm,
    modalState,
    openAddModal, openEditModal, closeModal,
    handleSaveMateria
  };
};