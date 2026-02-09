import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import { useDocentes } from '../../hooks/useDocentes';
import '../../styles/AdminDashboard.css'; 
// Nota: No importamos Table.css aquí porque ya lo importa el DataTable, 
// pero AdminDashboard sigue teniendo estilos de layout general.

const GestorDocentes = () => {
  const { 
    docentes, searchTerm, setSearchTerm, modalState, 
    openAddModal, openEditModal, closeModal, 
    handleSaveDocente, deleteDocente, toggleStatus 
  } = useDocentes();

  // Estado local SOLO para controlar los inputs del formulario mientras escribes
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (modalState.isOpen) {
      setFormData(modalState.data);
    }
  }, [modalState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = () => {
    handleSaveDocente(formData); 
  };

  const columns = [
    { header: 'Nombres', accessor: 'nombres' },
    { header: 'Apellidos', accessor: 'apellidos' },
    { header: 'Tipo', accessor: 'tipo' },
    { header: 'Carga Máx', accessor: 'carga_maxima' },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'}`}
          onClick={() => toggleStatus(row.id_docente)}
          style={{ cursor: 'pointer' }}
          title="Clic para alternar estado"
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="btn-icon edit" onClick={() => openEditModal(row)}>✏️</button>
      <button className="btn-icon delete" onClick={() => deleteDocente(row.id_docente)}>🗑️</button>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2 style={{ color: '#333' }}>Gestión de Docentes</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Nuevo Docente</button>
      </div>

      <div className="filters-bar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar docente..."
        />
      </div>

      <Table 
        columns={columns} 
        data={docentes} 
        actions={renderActions}
      />

      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.type === 'add' ? 'Registrar Docente' : 'Editar Docente'}
        footer={
          <>
            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
            <button className="btn-save" onClick={handleSubmit}>Guardar</button>
          </>
        }
      >
        {formData && (
          <>
            <div className="form-row">
              <div className="form-group-modal">
                <label>Nombres</label>
                <input name="nombres" value={formData.nombres} onChange={handleChange} />
              </div>
              <div className="form-group-modal">
                <label>Apellidos</label>
                <input name="apellidos" value={formData.apellidos} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group-modal">
                <label>Tipo Contrato</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="Tiempo Completo">Tiempo Completo</option>
                  <option value="Hora Clase">Hora Clase</option>
                  <option value="Medio Tiempo">Medio Tiempo</option>
                </select>
              </div>
              <div className="form-group-modal">
                <label>Carga Máx (Hrs)</label>
                <input type="number" name="carga_maxima" value={formData.carga_maxima} onChange={handleChange} />
              </div>
            </div>
          </>
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorDocentes;