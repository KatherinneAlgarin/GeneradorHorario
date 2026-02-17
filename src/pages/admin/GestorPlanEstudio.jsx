import React, { useState, useEffect } from 'react';
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
    modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSavePlan 
  } = usePlanEstudio();

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
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar Plan">✏️</button>
    </div>
  );

  return (
    <div className="tab-view-container">
      {/* HEADER */}
      <div className="page-header">
        <h3 className="text-muted">Planes de Estudio</h3>
        <button className="btn-primary" onClick={openAddModal}>+ Nuevo Plan</button>
      </div>

      {/* FILTROS */}
      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar por nombre, año o carrera..." 
        />
      </div>

      {/* TABLA */}
      <Table 
        columns={columns} 
        data={planes} 
        actions={renderActions} 
      />

      {/* MODAL */}
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
            {/* Campo 1: Carrera */}
            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Carrera Asociada</label>
                <select 
                  name="id_carrera" 
                  value={formData.id_carrera} 
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Seleccione una Carrera --</option>
                  {carreras.map(car => (
                    <option key={car.id_carrera} value={car.id_carrera}>
                      {car.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo 2 y 3: Nombre y Versión */}
            <div className="form-row">
              <div className="form-group-modal">
                <label>Nombre del Plan</label>
                <input 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange} 
                  placeholder="Ej. Plan 2023" 
                />
              </div>
              <div className="form-group-modal">
                <label>Versión</label>
                <input 
                  name="version" 
                  value={formData.version} 
                  onChange={handleChange} 
                  placeholder="Ej. 1.0" 
                />
              </div>
            </div>

            {/* Campo 4 y 5: AÑOS (Input Number) */}
            <div className="form-row">
              <div className="form-group-modal">
                <label>Año de Inicio</label>
                <input 
                  type="number" // <--- Solo número
                  name="fecha_inicio" 
                  value={formData.fecha_inicio} 
                  onChange={handleChange} 
                  placeholder="Ej. 2023"
                  min="2000"
                  max="2100"
                />
              </div>
              <div className="form-group-modal">
                <label>Año de Fin</label>
                <input 
                  type="number" // <--- Solo número
                  name="fecha_fin" 
                  value={formData.fecha_fin} 
                  onChange={handleChange} 
                  placeholder="Ej. 2028"
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