import React from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import { usePlanEstudio } from '../../hooks/usePlanEstudio';
import '../../styles/AdminDashboard.css';

const GestorPlanes = () => {
  const {
    planes,
    carreras,
    columns,
    searchTerm, setSearchTerm,
    modalState, loading,
    openAddModal, openEditModal, closeModal,
    handleSavePlan, handleInputChange
  } = usePlanEstudio();

  const formData = modalState.data;

  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar Plan">✏️</button>
    </div>
  );

  return (
    <div className="tab-view-container">
      <div className="page-header">
        <h3 className="text-muted">Planes de Estudio</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nuevo Plan</button>
      </div>

      <div className="filters-bar">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre, año o carrera..."
        />
      </div>

      {loading ? (
        <div className="loading-container">Cargando información...</div>
      ) : (
        <Table columns={columns} data={planes} actions={renderActions} />
      )}

      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'add' ? 'Registrar Plan de Estudio' : 'Editar Plan'}
        footer={
          <>
            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="btn-save" onClick={() => handleSavePlan(formData)}>Guardar</button>
          </>
        }
      >
        {formData && (
          <>
            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Carrera Asociada</label>
                <select
                  name="id_carrera"
                  value={formData.id_carrera || ''}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">-- Seleccione una Carrera --</option>
                  {carreras.length > 0 ? (
                    carreras.map(car => (
                      <option key={car.id_carrera} value={car.id_carrera}>
                        {car.nombre}
                      </option>
                    ))
                  ) : (
                    <option disabled>No hay carreras activas disponibles</option>
                  )}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Nombre del Plan</label>
                <input
                  name="nombre"
                  value={formData.nombre || ''}
                  onChange={handleInputChange}
                  placeholder="Ej. Plan de Formación 2024"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Descripción (Opcional)</label>
                <textarea
                  name="descripcion"
                  className="form-textarea"
                  value={formData.descripcion || ''}
                  onChange={handleInputChange}
                  placeholder="Breve descripción del plan..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal">
                <label>Año de Inicio</label>
                <input
                  type="number"
                  name="fecha_inicio"
                  value={formData.fecha_inicio || ''}
                  onChange={handleInputChange}
                  placeholder="Ej. 2024"
                  min="2000"
                  max="2100"
                />
              </div>
              <div className="form-group-modal">
                <label>Año de Fin</label>
                <input
                  type="number"
                  name="fecha_fin"
                  value={formData.fecha_fin || ''}
                  onChange={handleInputChange}
                  placeholder="Ej. 2029"
                  min="2000"
                  max="2100"
                />
              </div>
            </div>
          </>
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorPlanes;