import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table'; // Ajusta la ruta según tu estructura
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import Notification from '../../components/common/Notification';
import { useEquipamiento } from '../../hooks/useEquipamiento';
import '../../styles/AdminDashboard.css';

const GestorEquipamiento = () => {
  const { 
    equipos, 
    columns, 
    searchTerm, setSearchTerm, 
    modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSaveEquipamiento,
    notificationModal, setNotificationModal,
    notification, setNotification
  } = useEquipamiento();

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
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar Equipo">✏️</button>
    </div>
  );

  return (
    <div className="tab-view-container">
      {/* HEADER */}
      <div className="page-header">
        <h3 className="text-muted">Catálogo de Equipamiento</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nuevo Equipo</button>
      </div>

      {/* FILTROS */}
      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar equipo (ej. Proyector)..." 
        />
      </div>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      {/* TABLA */}
      <Table 
        columns={columns} 
        data={equipos} 
        actions={renderActions} 
      />

      {/* MODAL */}
      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'add' ? 'Registrar Nuevo Equipo' : 'Editar Equipo'}
        footer={
          <>
            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="btn-save" onClick={() => handleSaveEquipamiento(formData)}>Guardar</button>
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
          <div className="form-row">
            <div className="form-group-modal full-width">
              <label>Nombre del Equipo / Mobiliario</label>
              <input 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                placeholder="Ej. Aire Acondicionado Split" 
                autoFocus
              />
            </div>
          </div>
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorEquipamiento;