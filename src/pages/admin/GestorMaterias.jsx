import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral'; 
import { useMaterias } from '../../hooks/useMaterias';
import '../../styles/AdminDashboard.css';

const GestorMaterias = () => {
  const { 
    materias, 
    tiposAula, 
    columns, 
    searchTerm, setSearchTerm, 
    modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSaveMateria 
  } = useMaterias();

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (modalState.isOpen) setFormData(modalState.data);
  }, [modalState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar Materia">✏️</button>
    </div>
  );

  return (
    <div className="tab-view-container">
      {/* HEADER */}
      <div className="page-header">
        <h3 className="text-muted">Catálogo de Materias</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nueva Materia</button>
      </div>

      {/* FILTROS */}
      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar por código, nombre o tipo de aula..." 
        />
      </div>

      {/* TABLA */}
      <Table 
        columns={columns} 
        data={materias} 
        actions={renderActions} 
      />

      {/* MODAL */}
      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'add' ? 'Registrar Materia' : 'Editar Materia'}
        footer={
          <>
            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="btn-save" onClick={() => handleSaveMateria(formData)}>Guardar</button>
          </>
        }
      >
        {formData && (
          <>
            {/* Campo 1: Código y Nombre */}
            <div className="form-row">
              <div className="form-group-modal">
                <label>Código</label>
                <input 
                  name="codigo" 
                  value={formData.codigo} 
                  onChange={handleChange} 
                  placeholder="Ej. MAT101" 
                />
              </div>
              <div className="form-group-modal">
                <label>Nombre de la Materia</label>
                <input 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange} 
                  placeholder="Ej. Matemática I" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Infraestructura Requerida</label>
                <select 
                  name="id_tipo_aula" 
                  value={formData.id_tipo_aula} 
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Seleccione Tipo de Aula --</option>
                  {tiposAula.map(tipo => (
                    <option key={tipo.id_tipo} value={tipo.id_tipo}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo 3: Horas */}
            <div className="form-row">
              <div className="form-group-modal">
                <label>Horas Teóricas</label>
                <input 
                  type="number"
                  name="horas_teoricas" 
                  value={formData.horas_teoricas} 
                  onChange={handleChange} 
                  min="0"
                />
              </div>
              <div className="form-group-modal">
                <label>Horas Prácticas</label>
                <input 
                  type="number"
                  name="horas_practicas" 
                  value={formData.horas_practicas} 
                  onChange={handleChange} 
                  min="0"
                />
              </div>
            </div>
          </>
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorMaterias;