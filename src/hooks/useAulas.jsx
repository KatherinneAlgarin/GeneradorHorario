import React, { useState, useMemo } from 'react';

const mockTipos = [
  { id_tipo_aula: 1, nombre: 'Aula Teórica Común' },
  { id_tipo_aula: 2, nombre: 'Laboratorio de Cómputo' },
  { id_tipo_aula: 3, nombre: 'Laboratorio de Ciencias' },
  { id_tipo: 4, nombre: 'Taller de Arquitectura' }
];

const mockEquipos = [
  { id_equipamiento: 1, nombre: 'Proyector Multimedia' },
  { id_equipamiento: 2, nombre: 'Aire Acondicionado' },
  { id_equipamiento: 3, nombre: 'Pizarra Inteligente' },
  { id_equipamiento: 4, nombre: 'Computadora Instructor' },
  { id_equipamiento: 5, nombre: 'Escritorio Docente' }
];

const initialAulas = [
  { 
    id_aula: 1, 
    nombre: 'A-201', 
    edificio: 'B', 
    ubicacion: 'Planta Alta',
    capacidad: 40, 
    id_tipo_aula: 1,
    equipamiento_ids: [1, 2, 5],
    activo: true 
  },
  { 
    id_aula: 2, 
    nombre: 'LAB-01', 
    edificio: 'C', 
    ubicacion: 'Planta Baja',
    capacidad: 25, 
    id_tipo_aula: 2,
    equipamiento_ids: [1, 2, 4, 5], 
    activo: true 
  }
];

export const useAulas = () => {
  const [aulas, setAulas] = useState(initialAulas);
  const [tipos] = useState(mockTipos);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'add',
    data: null
  });

  const toggleStatus = (id) => {
    setAulas(aulas.map(a => a.id_aula === id ? { ...a, activo: !a.activo } : a));
  };

  const columns = useMemo(() => [
    { header: 'Aula', accessor: 'nombre' },
    { header: 'Edificio', accessor: 'edificio' },
    { header: 'Capacidad', accessor: 'capacidad' },
    { 
      header: 'Tipo', 
      accessor: 'id_tipo_aula',
      render: (row) => {
        const tipo = tipos.find(t => t.id_tipo_aula === parseInt(row.id_tipo_aula));
        return tipo ? tipo.nombre : '---';
      }
    },
    { 
      header: 'Equipamiento', 
      accessor: 'equipamiento_ids',
      render: (row) => {
        const nombresEquipos = row.equipamiento_ids.map(id => 
          equipos.find(e => e.id_equipamiento === parseInt(id))?.nombre
        ).filter(Boolean);
        
        return (
          <small style={{ color: '#666', fontStyle: 'italic' }}>
            {nombresEquipos.length > 0 ? nombresEquipos.join(', ') : 'Sin equipamiento'}
          </small>
        );
      }
    },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'} cursor-pointer`}
          onClick={() => toggleStatus(row.id_aula)}
          title="Clic para Activar/Desactivar"
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], [aulas, tipos, equipos]);

  const filteredAulas = useMemo(() => {
    if (!searchTerm) return aulas;
    const lower = searchTerm.toLowerCase();
    
    return aulas.filter(a => {
      const nombreTipo = tipos.find(t => t.id_tipo_aula === parseInt(a.id_tipo_aula))?.nombre.toLowerCase() || '';
      return (
        a.nombre.toLowerCase().includes(lower) || 
        a.edificio.toLowerCase().includes(lower) ||
        nombreTipo.includes(lower)
      );
    });
  }, [aulas, tipos, searchTerm]);

  const handleSaveAula = (formData) => {
    if (!formData.nombre || !formData.edificio || !formData.id_tipo_aula || !formData.capacidad) {
      return alert("Complete los campos obligatorios.");
    }

    const dataToSave = {
      ...formData,
      id_tipo_aula: parseInt(formData.id_tipo_aula),
      capacidad: parseInt(formData.capacidad),
      equipamiento_ids: formData.equipamiento_ids.map(id => parseInt(id))
    };

    if (modalState.type === 'add') {
      const maxId = aulas.length > 0 ? Math.max(...aulas.map(a => a.id_aula)) : 0;
      const newAula = { 
        ...dataToSave, 
        id_aula: maxId + 1, 
        activo: true 
      };
      setAulas([...aulas, newAula]);
    } else {
      setAulas(aulas.map(a => a.id_aula === dataToSave.id_aula ? dataToSave : a));
    }
    closeModal();
  };

  const openAddModal = () => {
    setModalState({ 
      isOpen: true, 
      type: 'add', 
      data: { 
        nombre: '', 
        edificio: '', 
        ubicacion: '', 
        capacidad: 30, 
        id_tipo_aula: '', 
        equipamiento_ids: [], 
        activo: true 
      } 
    });
  };

  const openEditModal = (item) => setModalState({ isOpen: true, type: 'edit', data: { ...item } });
  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  return {
    aulas, tipos, equipos, columns,
    searchTerm, setSearchTerm,
    modalState,
    openAddModal, openEditModal, closeModal,
    handleSaveAula
  };
};