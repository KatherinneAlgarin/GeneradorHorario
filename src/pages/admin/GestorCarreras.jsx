import React from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import { useCarreras } from '../../hooks/useCarreras';
import '../../styles/AdminDashboard.css';

const GestorCarreras = () => {
  const { 
    carreras, facultades, columns, searchTerm, setSearchTerm, 
    modalState, openAddModal, openEditModal, closeModal, 
    handleSaveCarrera, handleInputChange, loading
  } = useCarreras();

  const formData = modalState.data;


  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar">✏️</button>
    </div>
  );

  return (
    <div className="tab-view-container">
      <div className="page-header">
        <h3 className="text-muted">Carreras Universitarias</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nueva Carrera</button>
      </div>

      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar..." 
        />
      </div>

      {loading ? (
        <p>Cargando información...</p>
      ) : (
        <Table columns={columns} data={carreras} actions={renderActions} />
      )}

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
            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Facultad a la que pertenece</label>
                <select 
                  name="id_facultad" 
                  value={formData.id_facultad} 
                  onChange={handleInputChange}
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

            <div className="form-row">
              <div className="form-group-modal">
                <label>Código Carrera</label>
                <input 
                  name="codigo" 
                  value={formData.codigo || ''} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group-modal">
                <label>Nombre Oficial</label>
                <input 
                  name="nombre" 
                  value={formData.nombre || ''} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Descripción</label>
                <textarea 
                  name="descripcion"
                  className="form-textarea"
                  value={formData.descripcion || ''} 
                  onChange={handleInputChange} 
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