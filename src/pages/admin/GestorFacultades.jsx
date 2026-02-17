import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import { useFacultades } from '../../hooks/useFacultades';
import '../../styles/AdminDashboard.css';

const GestorFacultades = () => {
  const { 
    facultades, 
    columns,
    searchTerm, setSearchTerm, 
    modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSaveFacultad 
  } = useFacultades();

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (modalState.isOpen) setFormData(modalState.data);
  }, [modalState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Botón de acción (Editar)
  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar Información">✏️</button>
    </div>
  );

  return (
    <div className="tab-view-container">
      {/* HEADER */}
      <div className="page-header">
        <h3 className="text-muted">Facultades</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nueva Facultad</button>
      </div>

      {/* FILTROS */}
      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar facultad..." 
        />
      </div>

      {/* TABLA (Columnas vienen del Hook) */}
      <Table 
        columns={columns} 
        data={facultades} 
        actions={renderActions} 
      />

      {/* MODAL */}
      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'add' ? 'Registrar Facultad' : 'Editar Facultad'}
        footer={
          <>
            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="btn-save" onClick={() => handleSaveFacultad(formData)}>Guardar</button>
          </>
        }
      >
        {formData && (
          <>
            <div className="form-row">
              <div className="form-group-modal">
                <label>Código</label>
                <input 
                  name="codigo"
                  value={formData.codigo} 
                  onChange={handleChange} 
                  placeholder="Ej. ING" 
                />
              </div>
              <div className="form-group-modal">
                <label>Nombre de Facultad</label>
                <input 
                  name="nombre"
                  value={formData.nombre} 
                  onChange={handleChange} 
                  placeholder="Ej. Facultad de Ingeniería" 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Descripción</label>
                <textarea 
                  name="descripcion"
                  className="form-textarea"
                  value={formData.descripcion} 
                  onChange={handleChange} 
                  placeholder="Breve descripción de la facultad..."
                />
              </div>
            </div>
          </>
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorFacultades;