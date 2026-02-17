import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import { useCarreras } from '../../hooks/useCarreras';
import '../../styles/AdminDashboard.css';

const GestorCarreras = () => {
  // 1. Obtenemos todo desde el Hook
  const { 
    carreras, 
    facultades, 
    columns, 
    searchTerm, setSearchTerm, 
    modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSaveCarrera 
  } = useCarreras();

  // 2. Estado local para inputs
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (modalState.isOpen) setFormData(modalState.data);
  }, [modalState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Acciones (Editar)
  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar Carrera">✏️</button>
    </div>
  );

  return (
    <div className="tab-view-container">
      {/* HEADER */}
      <div className="page-header">
        <h3 className="text-muted">Carreras Universitarias</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nueva Carrera</button>
      </div>

      {/* FILTROS */}
      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar por código, nombre o facultad..." 
        />
      </div>

      {/* TABLA */}
      <Table 
        columns={columns} 
        data={carreras} 
        actions={renderActions} 
      />

      {/* MODAL (Usando el nombre correcto: ModalGeneral) */}
      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'add' ? 'Registrar Carrera' : 'Editar Carrera'}
        footer={
          <>
            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="btn-save" onClick={() => handleSaveCarrera(formData)}>Guardar</button>
          </>
        }
      >
        {formData && (
          <>
            {/* Campo 1: Facultad (Select) */}
            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Facultad a la que pertenece</label>
                <select 
                  name="id_facultad" 
                  value={formData.id_facultad} 
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Seleccione una Facultad --</option>
                  {facultades.map(fac => (
                    <option key={fac.id_facultad} value={fac.id_facultad}>
                      {fac.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 2: Código y Nombre */}
            <div className="form-row">
              <div className="form-group-modal">
                <label>Código Carrera</label>
                <input 
                  name="codigo" 
                  value={formData.codigo} 
                  onChange={handleChange} 
                  placeholder="Ej. ICC" 
                />
              </div>
              <div className="form-group-modal">
                <label>Nombre Oficial</label>
                <input 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange} 
                  placeholder="Ej. Ingeniería en Sistemas" 
                />
              </div>
            </div>
          </>
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorCarreras;