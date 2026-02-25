import React from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import Notification from '../../components/common/Notification';
import { useAulas } from '../../hooks/useAulas';
import '../../styles/AdminDashboard.css';

const GestorAulas = () => {
  const { 
    aulas, 
    tipos, 
    columns, 
    searchTerm, setSearchTerm, 
    modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSaveAula,
    handleInputChange,
    loading,
    notificationModal, setNotificationModal,
    notification, setNotification
  } = useAulas();

  const formData = modalState.data;

  const renderActions = (row) => (
    <div className="action-buttons">
      <button 
        className="btn-text-edit" 
        onClick={() => openEditModal(row)} 
        title="Editar Aula"
      >
        Editar
      </button>
    </div>
  );

  return (
    <div className="tab-view-container">
      <div className="page-header">
        <h3 className="text-muted">Gestión de Aulas</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nueva Aula</button>
      </div>

      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar por nombre, edificio o tipo..." 
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
        <div className="loading-container">Cargando aulas...</div>
      ) : (
        <Table 
          columns={columns} 
          data={aulas} 
          actions={renderActions} 
        />
      )}

      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'add' ? 'Registrar Aula' : 'Editar Aula'}
        footer={
          <>
            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="btn-save" onClick={() => handleSaveAula(formData)}>Guardar</button>
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
              <div className="form-group-modal">
                <label>Nombre / Número</label>
                <input 
                  name="nombre" 
                  value={formData.nombre || ''} 
                  onChange={handleInputChange} 
                  placeholder="Ej. A-201" 
                />
              </div>
              <div className="form-group-modal">
                <label>Edificio</label>
                <input 
                  name="edificio" 
                  value={formData.edificio || ''} 
                  onChange={handleInputChange} 
                  placeholder="Ej. Edificio B" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal">
                <label>Ubicación</label>
                <select 
                  name="ubicacion" 
                  value={formData.ubicacion || ''} 
                  onChange={handleInputChange} 
                  className="form-select"
                >
                  <option value="Campus">Campus</option>
                  <option value="Fuera de Campus">Fuera de Campus</option>
                </select>
              </div>
              <div className="form-group-modal">
                <label>Capacidad</label>
                <input 
                  type="number" 
                  name="capacidad" 
                  value={formData.capacidad || ''} 
                  onChange={handleInputChange} 
                  min="1" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Tipo de Aula</label>
                <select 
                  name="id_tipo_aula" 
                  value={formData.id_tipo_aula || ''} 
                  onChange={handleInputChange} 
                  className="form-select"
                >
                  <option value="">-- Seleccione Tipo --</option>
                  {tipos.map(t => (
                    <option key={t.id_tipo_aula} value={t.id_tipo_aula}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorAulas;