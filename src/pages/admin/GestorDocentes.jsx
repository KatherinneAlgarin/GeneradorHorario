import React, { useState, useEffect } from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import ModalGeneral from '../../components/common/ModalGeneral';
import { useDocentes } from '../../hooks/useDocentes';
import '../../styles/AdminDashboard.css'; 
import BotonImportar from '../../components/common/BotonImportar';

const GestorDocentes = () => {


  const { 
    docentes, searchTerm, setSearchTerm, 
    modalState, teachingHistory,
    openAddModal, openEditModal, openDetailsModal, closeModal,
    handleSaveDocente, deleteDocente, toggleStatus, handleImportDocentes
  } = useDocentes();

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (modalState.isOpen) setFormData(modalState.data);
  }, [modalState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => handleSaveDocente(formData);

  // --- COLUMNAS ---
  const columns = [
    { header: 'Nombres', accessor: 'nombres' },
    { header: 'Apellidos', accessor: 'apellidos' },
    { header: 'Tipo', accessor: 'tipo' },
    { header: 'Carga Máx', accessor: 'carga_maxima' },
    { 
      header: 'Estado', accessor: 'activo',
      render: (row) => (
        <span 
          className={`status-badge ${row.activo ? 'status-active' : 'status-inactive'}`}
          onClick={() => toggleStatus(row.id_docente)}
          style={{ cursor: 'pointer' }}
        >
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  // --- BOTONES DE ACCIÓN ---
  const renderActions = (row) => (
    <div className="action-buttons">
      {/* Botón Nuevo: Ver Detalles */}
      <button className="btn-icon view" onClick={() => openDetailsModal(row)} title="Ver Historial">Info</button>
      <button className="btn-icon edit" onClick={() => openEditModal(row)} title="Editar">✏️</button>
      <button className="btn-icon delete" onClick={() => deleteDocente(row.id_docente)} title="Eliminar">🗑️</button>
    </div>
  );

  // --- CONTENIDO DEL MODAL --Arreglar para usar el comoponente de modalgenreal
  const renderModalContent = () => {
    if (modalState.type === 'details' && formData) {
      return (
        <div className="details-view">
          {/* Tarjeta de Info General */}
          <div className="info-card-summary">
            <div className="info-row">
              <strong>Nombre Completo:</strong> <span>{formData.nombres} {formData.apellidos}</span>
            </div>
            <div className="info-row">
              <strong>Contrato:</strong> <span>{formData.tipo}</span>
            </div>
            <div className="info-row">
              <strong>Carga Máxima:</strong> <span>{formData.carga_maxima} Horas</span>
            </div>
            <div className="info-row">
              <strong>Estado Actual:</strong> 
              <span style={{ color: formData.activo ? 'green' : 'red', fontWeight: 'bold' }}>
                {formData.activo ? ' Activo' : ' Inactivo'}
              </span>
            </div>
          </div>

          <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#555' }}>Historial de Materias Impartidas</h4>
          
          {teachingHistory.length > 0 ? (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Asignatura</th>
                    <th>Ciclo</th>
                  </tr>
                </thead>
                <tbody>
                  {teachingHistory.map((hist, idx) => (
                    <tr key={idx}>
                      <td>{hist.codigo}</td>
                      <td>{hist.materia}</td>
                      <td><span className="cycle-badge">{hist.ciclo}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data-text">Este docente no tiene historial de clases registrado.</p>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="form-row">
          <div className="form-group-modal">
            <label>Nombres</label>
            <input name="nombres" value={formData?.nombres || ''} onChange={handleChange} />
          </div>
          <div className="form-group-modal">
            <label>Apellidos</label>
            <input name="apellidos" value={formData?.apellidos || ''} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group-modal">
            <label>Tipo Contrato</label>
            <select name="tipo" value={formData?.tipo || ''} onChange={handleChange}>
              <option value="Tiempo Completo">Tiempo Completo</option>
              <option value="Hora Clase">Hora Clase</option>
            </select>
          </div>
          <div className="form-group-modal">
            <label>Carga Máx (Hrs)</label>
            <input type="number" name="carga_maxima" value={formData?.carga_maxima || 0} onChange={handleChange} />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2 style={{ color: '#333' }}>Gestión de Docentes</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          
          {/* <BotonImportar onDataLoaded={handleImportDocentes} /> */}
          
          <button className="btn-primary" onClick={openAddModal}>
            + Nuevo Docente
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar docente..." />
      </div>

      <Table columns={columns} data={docentes} actions={renderActions} />

      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.type === 'add' ? 'Registrar Docente' : 
          modalState.type === 'edit' ? 'Editar Docente' : 'Expediente del Docente'
        }
        footer={
          modalState.type === 'details' ? (
            <button className="btn-cancel" onClick={closeModal}>Cerrar Expediente</button>
          ) : (
            <>
              <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
              <button className="btn-save" onClick={handleSubmit}>Guardar</button>
            </>
          )
        }
      >
        {renderModalContent()}
      </ModalGeneral>
    </div>
  );
};

export default GestorDocentes;