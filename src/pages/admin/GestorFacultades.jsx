import React from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import Notification from '../../components/common/Notification';
import { useFacultades } from '../../hooks/useFacultades';
import '../../styles/AdminDashboard.css';

const GestorFacultades = () => {
  const { 
    facultades, columns, searchTerm, setSearchTerm, 
    modalState, openAddModal, openEditModal, closeModal, 
    handleSaveFacultad, handleInputChange, loading,
    notification, setNotification,
    notificationModal, setNotificationModal
  } = useFacultades();

  const formData = modalState.data;

  const renderActions = (row) => (
    <div className="action-buttons">
      <button 
        className="btn-text-edit" 
        onClick={() => openEditModal(row)} 
        title="Editar Facultad"
      >
        Editar
      </button>
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

      {notification.show && (
        <Notification 
          show={notification.show}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      {loading ? (
        <p>Cargando facultades...</p>
      ) : (
        <Table columns={columns} data={facultades} actions={renderActions} />
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
        {modalState.isOpen && notificationModal.show && (
          <Notification 
            show={notificationModal.show}
            message={notificationModal.message}
            type={notificationModal.type}
            onClose={() => setNotificationModal({ ...notificationModal, show: false })}
          />
        )}
        {formData && (
          <>
            <div className="form-row">
              <div className="form-group-modal full-width">
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