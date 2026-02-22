import React from 'react';
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
    handleSaveFacultad,
    handleInputChange,
    deleteFacultad,
    loading
  } = useFacultades();

  // Obtenemos los datos directamente del estado del modal en el hook
  const formData = modalState.data;

  // Acciones de la tabla
  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar">✏️</button>
      <button className="btn-icon delete" onClick={() => deleteFacultad(row.id_facultad)} title="Eliminar">🗑️</button>
    </div>
  );

  return (
    <div className="tab-view-container">
      <div className="page-header">
        <h3 className="text-muted">Facultades</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nueva Facultad</button>
      </div>

      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar facultad..." 
        />
      </div>

      {loading ? (
        <p>Cargando facultades...</p>
      ) : (
        <Table 
          columns={columns} 
          data={facultades} 
          actions={renderActions} 
        />
      )}

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
                  value={formData.codigo || ''} 
                  onChange={handleInputChange} 
                  placeholder="Ej. ING" 
                />
              </div>
              <div className="form-group-modal">
                <label>Nombre de Facultad</label>
                <input 
                  name="nombre"
                  value={formData.nombre || ''} 
                  onChange={handleInputChange} 
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
                  value={formData.descripcion || ''} 
                  onChange={handleInputChange} 
                  placeholder="Breve descripción..."
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