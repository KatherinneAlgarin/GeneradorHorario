import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral'; 
import { useAulas } from '../../hooks/useAulas';
import '../../styles/AdminDashboard.css';

const GestorAulas = () => {
  const { 
    aulas, 
    tipos = [],
    equipos = [],
    columns, 
    searchTerm, setSearchTerm, 
    modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSaveAula 
  } = useAulas();

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (modalState.isOpen) setFormData(modalState.data);
  }, [modalState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (id_equipamiento) => {
    const id = parseInt(id_equipamiento);
    setFormData(prev => {
      const currentIds = prev.equipamiento_ids || [];
      if (currentIds.includes(id)) {
        return { ...prev, equipamiento_ids: currentIds.filter(itemId => itemId !== id) };
      } else {
        return { ...prev, equipamiento_ids: [...currentIds, id] };
      }
    });
  };

  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar Aula">✏️</button>
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

      <Table 
        columns={columns} 
        data={aulas} 
        actions={renderActions} 
      />

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
        {formData && (
          <>
            <div className="form-row">
              <div className="form-group-modal">
                <label>Nombre / Número</label>
                <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. A-201" />
              </div>
              <div className="form-group-modal">
                <label>Edificio</label>
                <input name="edificio" value={formData.edificio} onChange={handleChange} placeholder="Ej. B" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal">
                <label>Ubicación Detallada</label>
                <input name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej. Planta Alta" />
              </div>
              <div className="form-group-modal">
                <label>Capacidad</label>
                <input type="number" name="capacidad" value={formData.capacidad} onChange={handleChange} min="1" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Tipo de Aula</label>
                <select name="id_tipo_aula" value={formData.id_tipo_aula} onChange={handleChange} className="form-select">
                  <option value="">-- Seleccione Tipo --</option>
                  {/* Validación extra: tipos && tipos.map... */}
                  {tipos && tipos.map(t => (
                    <option key={t.id_tipo_aula} value={t.id_tipo_aula}>{t.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-modal full-width">
                <label>Equipamiento Disponible</label>
                
                <div className="checkbox-grid">
                  {/* Aquí estaba el error. Con "equipos &&" aseguramos que exista antes del map */}
                  {equipos && equipos.length > 0 ? (
                    equipos.map(eq => (
                      <label key={eq.id_equipamiento} className="checkbox-label">
                        <input 
                          type="checkbox"
                          checked={formData.equipamiento_ids ? formData.equipamiento_ids.includes(eq.id_equipamiento) : false}
                          onChange={() => handleCheckboxChange(eq.id_equipamiento)}
                        />
                        {eq.nombre}
                      </label>
                    ))
                  ) : (
                    <span style={{color: '#999', fontSize: '0.9rem'}}>No hay equipos registrados en el catálogo.</span>
                  )}
                </div>
                
              </div>
            </div>
          </>
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorAulas;