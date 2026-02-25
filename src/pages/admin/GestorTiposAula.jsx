import React from 'react';
import Table from '../../components/common/Table'; 
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import Notification from '../../components/common/Notification';
import { useTiposAula } from '../../hooks/useTiposAula';
import '../../styles/AdminDashboard.css';

const GestorTiposAula = () => {
  const { 
    tipos, 
    columns, 
    searchTerm, setSearchTerm, 
    modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSaveTipo,
    handleInputChange,
    deleteTipo,
    loading,
    notificationModal, setNotificationModal,
    notification, setNotification
  } = useTiposAula();

  const formData = modalState.data;

  const renderActions = (row) => (
    <div className="action-buttons">
      <button 
        className="btn-text-edit" 
        onClick={() => openEditModal(row)} 
        title="Editar Tipo"
      >
        Editar
      </button>
      <button 
        className="btn-text-delete" 
        onClick={() => deleteTipo(row.id_tipo_aula)} 
        title="Eliminar Tipo"
      >
        Eliminar
      </button>
    </div>
  );

  return (
    <div className="tab-view-container">
      <div className="page-header">
        <h3 className="text-muted">Tipos de Aula</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nuevo Tipo</button>
      </div>

      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar tipo..." 
        />
      </div>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      {loading ? (
        <p>Cargando tipos de aula...</p>
      ) : (
        <Table 
          columns={columns} 
          data={tipos} 
          actions={renderActions} 
        />
      )}

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
        {notificationModal.show && modalState.isOpen && (
          <Notification
            message={notificationModal.message}
            type={notificationModal.type}
            onClose={() => setNotificationModal({ ...notificationModal, show: false })}
          />
        )}
        {formData && (
          <>
            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Nombre</label>
                <input 
                  name="nombre" 
                  value={formData.nombre || ''} 
                  onChange={handleInputChange} 
                  placeholder="Ej. Laboratorio de Química" 
                  autoFocus
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

export default GestorTiposAula;
