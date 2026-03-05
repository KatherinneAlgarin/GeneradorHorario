import React from 'react';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Filtro from '../../components/common/Filtro';
import ModalGeneral from '../../components/common/ModalGeneral';
import Notification from '../../components/common/Notification';
import { useDocentes } from '../../hooks/useDocentes';
import '../../styles/AdminDashboard.css';

const GestorDocentes = () => {
  const {
    docentes, facultades, columns,
    searchTerm, setSearchTerm,
    filterTipo, setFilterTipo,
    filterEstado, setFilterEstado,
    modalState, loading, isSaving,
    openAddModal, openEditModal, closeModal,
    handleSaveDocente, handleInputChange, handleCheckboxChange, confirmChangeStatus, executeStatusChange,
    notificationModal, setNotificationModal,
    notification, setNotification,
    confirmSaveWithWarning
  } = useDocentes();

  const formData = modalState.data;

  const renderActions = (row) => (
    <div className="action-buttons">
      <button className="btn-text-edit" onClick={() => openEditModal(row)} title="Editar Docente">Editar</button>

      {row.activo !== false ? (
        <button className="btn-text-delete" onClick={() => confirmChangeStatus(row, 'desactivar')} title="Eliminar Docente (Soft Delete)">
          Eliminar
        </button>
      ) : (
        <button
          className="btn-text-edit"
          style={{ color: '#2E7D32', borderColor: '#2E7D32', backgroundColor: '#E8F5E9' }}
          onClick={() => confirmChangeStatus(row, 'activar')}
          title="Reactivar Docente"
        >
          Reactivar
        </button>
      )}
    </div>
  );

  return (
    <div className="tab-view-container">
      <div className="filters-bar filters-bar-advanced">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar docente o correo..."
        />
        <Filtro
          value={filterTipo}
          onChange={setFilterTipo}
          defaultLabel="Todos los contratos"
          options={[
            { label: 'Tiempo Completo', value: 'Tiempo Completo' },
            { label: 'Hora Clase', value: 'Hora Clase' }
          ]}
        />
        <Filtro
          value={filterEstado}
          onChange={setFilterEstado}
          defaultLabel="Todos los estados"
          options={[
            { label: 'Activos', value: 'activos' },
            { label: 'Inactivos', value: 'inactivos' }
          ]}
        />
        <button className="btn-primary" onClick={openAddModal}>
          + Nuevo Docente
        </button>
      </div>

      {notification.show && (
        <Notification show={notification.show} message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />
      )}

      {loading ? (
        <div className="loading-container">Cargando docentes...</div>
      ) : (
        <Table columns={columns} data={docentes} actions={renderActions} />
      )}

      <ModalGeneral
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.type === 'add' ? 'Registrar Docente' :
            modalState.type === 'edit' ? 'Editar Docente' : 'Confirmar Acción'
        }
        footer={
          modalState.type === 'confirmStatusChange' ? (
            <>
              <button className="btn-cancel" onClick={closeModal} disabled={isSaving}>Cancelar</button>
              <button
                className={formData?.action === 'desactivar' ? "btn-text-delete" : "btn-save"}
                onClick={executeStatusChange}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.6 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
              >
                {formData?.action === 'desactivar' ? 'Eliminar' : 'Reactivar'}
              </button>
            </>
          ) : notificationModal.type === 'warning' && notificationModal.needsConfirmation ? (
            <>
              <button 
                className="btn-cancel" 
                onClick={() => setNotificationModal({ show: false, message: '', type: 'error' })}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                className="btn-save" 
                onClick={confirmSaveWithWarning}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.6 : 1, cursor: isSaving ? 'not-allowed' : 'pointer', background: '#f59e0b' }}
              >
                Sí, Crear Sin Carga
              </button>
            </>
          ) : (
            <>
              <button className="btn-cancel" onClick={closeModal} disabled={isSaving}>Cancelar</button>
              <button
                className="btn-save"
                onClick={() => handleSaveDocente(formData)}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.6 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
              >
                Guardar
              </button>
            </>
          )
        }
      >
        {notificationModal.show && modalState.isOpen && (
          <Notification show={notificationModal.show} message={notificationModal.message} type={notificationModal.type} onClose={() => setNotificationModal({ ...notificationModal, show: false })} />
        )}

        {modalState.type === 'confirmStatusChange' ? (
          <div className="confirm-text">
            <p>
              ¿Estás seguro de que deseas <strong>{formData?.action === 'desactivar' ? 'eliminar' : 'reactivar'}</strong> al docente <strong>{formData?.nombre}</strong>?
            </p>
            {formData?.action === 'desactivar' && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px' }}>
                Esto no borrará su historial, pero le impedirá iniciar sesión y no podrá ser asignado a nuevos horarios.
              </p>
            )}
          </div>
        ) : (
          formData && (
            <>
              <h4 className="modal-section-title">Información Personal</h4>
              <div className="form-row">
                <div className="form-group-modal">
                  <label>Nombres</label>
                  <input name="nombres" value={formData.nombres || ''} onChange={handleInputChange} placeholder="Ej. Juan Carlos" disabled={isSaving} />
                </div>
                <div className="form-group-modal">
                  <label>Apellidos</label>
                  <input name="apellidos" value={formData.apellidos || ''} onChange={handleInputChange} placeholder="Ej. Pérez" disabled={isSaving} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modal full-width">
                  <label>Correo Electrónico {modalState.type === 'edit' && '(No modificable)'}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    placeholder="correo@catolica.edu.sv"
                    disabled={modalState.type === 'edit' || isSaving}
                  />
                </div>
              </div>

              <h4 className="modal-section-title">Detalles Académicos</h4>
              <div className="form-row">
                <div className="form-group-modal">
                  <label>Tipo de Contratación</label>
                  <select
                    name="tipo"
                    value={formData.tipo || ''}
                    onChange={(e) => handleTipoChange(e.target.value)}
                    className="form-select"
                    disabled={isSaving}
                  >
                    <option value="Tiempo Completo">Tiempo Completo</option>
                    <option value="Hora Clase">Hora Clase</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modal">
                  <label>Carga Mínima (Hrs)</label>
                  <input
                    type="number" name="carga_minima" value={formData.carga_minima ?? ''} onChange={handleInputChange}
                    min="0" placeholder="Ej. 10" onKeyDown={(e) => ['e', 'E', '+', '-', '.', ','].includes(e.key) && e.preventDefault()}
                    disabled={isSaving}
                  />
                </div>
                <div className="form-group-modal">
                  <label>Carga Máxima (Hrs)</label>
                  <input
                    type="number" name="carga_maxima" value={formData.carga_maxima ?? ''} onChange={handleInputChange}
                    min="0" placeholder="Ej. 40" onKeyDown={(e) => ['e', 'E', '+', '-', '.', ','].includes(e.key) && e.preventDefault()}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modal full-width">
                  <label>Facultades Asignadas</label>

                  <div className="checkbox-list">
                    {facultades.length > 0 ? (
                      facultades
                        .filter(fac => fac.activo || (modalState.type === 'edit' && formData.facultades?.includes(fac.id_facultad)))
                        .map(fac => (
                          <label key={fac.id_facultad} className="checkbox-label" style={{ opacity: isSaving ? 0.6 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={formData.facultades?.includes(fac.id_facultad) || false}
                              onChange={() => { if (!isSaving) handleCheckboxChange(fac.id_facultad) }}
                              disabled={isSaving}
                            />
                            <span>
                              {fac.nombre} {!fac.activo && <em>(Inactiva)</em>}
                            </span>
                          </label>
                        ))
                    ) : (
                      <span className="no-data-text full-width">No hay facultades disponibles.</span>
                    )}
                  </div>

                </div>
              </div>
            </>
          )
        )}
      </ModalGeneral>
    </div>
  );
};

export default GestorDocentes;