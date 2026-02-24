import React, { useState } from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral'; 
import { useMaterias } from '../../hooks/useMaterias';
import '../../styles/AdminDashboard.css';

const GestorMaterias = () => {
  const { 
    materias, tiposAula, planes, columns, 
    searchTerm, setSearchTerm, 
    modalState, loading,
    openAddModal, openEditModal, closeModal, 
    handleSaveMateria 
  } = useMaterias();

  const [formData, setFormData] = useState(null);

  const handleOpenAdd = () => setFormData(openAddModal());
  const handleOpenEdit = (row) => setFormData(openEditModal(row));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderActions = (row) => (
    <div className="action-buttons">
      <button 
        className="btn-text-edit" 
        onClick={() => handleOpenEdit(row)} 
        title="Editar Materia"
      >
        Editar
      </button>
    </div>
  );

  return (
    <div className="tab-view-container">
      <div className="page-header">
        <h3 className="text-muted">Catálogo de Materias</h3>
        <button className="btn-primary" onClick={handleOpenAdd}>+ Nueva Materia</button>
      </div>

      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar por código, nombre o tipo de aula..." 
        />
      </div>

      {loading ? (
        <div className="loading-container">Cargando catálogo...</div>
      ) : (
        <Table columns={columns} data={materias} actions={renderActions} />
      )}

      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'add' ? 'Registrar Materia' : 'Editar Materia'}
        footer={
          <>
            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="btn-save" onClick={() => handleSaveMateria(formData)}>Guardar</button>
          </>
        }
      >
        <div key={formData?.id_asignatura || 'nueva-materia'}>
          {formData && (
            <>
              <div className="form-row">
                <div className="form-group-modal">
                  <label>Código</label>
                  <input name="codigo" value={formData.codigo || ''} onChange={handleChange} placeholder="Ej. MAT101" />
                </div>
                <div className="form-group-modal">
                  <label>Nombre de la Materia</label>
                  <input name="nombre" value={formData.nombre || ''} onChange={handleChange} placeholder="Ej. Matemática I" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modal">
                  <label>Plan de Estudios {modalState.type === 'edit' && <small>(No editable)</small>}</label>
                  <select 
                    name="id_plan_estudio" 
                    value={formData.id_plan_estudio || ''} 
                    onChange={handleChange} 
                    className="form-select" 
                    disabled={modalState.type === 'edit'}
                  >
                    <option value="">-- Seleccione Plan --</option>
                    {planes.map(p => (
                      <option key={p.id_plan_estudio} value={p.id_plan_estudio}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-modal">
                  <label>Ciclo {modalState.type === 'edit' && <small>(No editable)</small>}</label>
                  <input 
                    type="number" 
                    name="ciclo_recomendado" 
                    value={formData.ciclo_recomendado || ''} 
                    onChange={handleChange} 
                    disabled={modalState.type === 'edit'} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modal full-width">
                  <label>Tipo de Aula Requerida</label>
                  <select name="requiere_tipo_aula" value={formData.requiere_tipo_aula || ''} onChange={handleChange} className="form-select">
                    <option value="">-- Seleccione Tipo de Aula --</option>
                    {tiposAula.map(tipo => (
                      <option key={tipo.id_tipo_aula} value={tipo.id_tipo_aula}>{tipo.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modal">
                  <label>Horas Teóricas</label>
                  <input type="number" name="horas_teoricas" value={formData.horas_teoricas || 0} onChange={handleChange} min="0" />
                </div>
                <div className="form-group-modal">
                  <label>Horas Prácticas</label>
                  <input type="number" name="horas_practicas" value={formData.horas_practicas || 0} onChange={handleChange} min="0" />
                </div>
              </div>
            </>
          )}
        </div>
      </ModalGeneral>
    </div>
  );
};

export default GestorMaterias;