import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table'; 
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral'; 
import { useTiposAula } from '../../hooks/useTiposAula';
import '../../styles/AdminDashboard.css';

const GestorTiposAula = () => {
  const { 
    tipos, 
    columns, 
    searchTerm, setSearchTerm, 
    modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSaveTipo 
  } = useTiposAula();

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
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar Tipo">✏️</button>
    </div>
  );

  return (
    <div className="tab-view-container">
      {/* HEADER */}
      <div className="page-header">
        <h3 className="text-muted">Tipos de Aula</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nuevo Tipo</button>
      </div>

      {/* FILTROS */}
      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar tipo (ej. Laboratorio)..." 
        />
      </div>

      {/* TABLA */}
      <Table 
        columns={columns} 
        data={tipos} 
        actions={renderActions} 
      />

      {/* MODAL */}
      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'add' ? 'Registrar Tipo de Aula' : 'Editar Tipo'}
        footer={
          <>
            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="btn-save" onClick={() => handleSaveTipo(formData)}>Guardar</button>
          </>
        }
      >
        {formData && (
          <div className="form-row">
            <div className="form-group-modal full-width">
              <label>Descripción del Tipo</label>
              <input 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                placeholder="Ej. Laboratorio de Química" 
                autoFocus
              />
            </div>
          </div>
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorTiposAula;