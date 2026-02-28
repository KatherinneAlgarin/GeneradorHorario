import { useState, useMemo, useCallback, useEffect } from 'react';
import { apiRequest } from '../services/api'; 

export const useDocentes = () => {
  const [docentes, setDocentes] = useState([]); 
  const [facultades, setFacultades] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState(""); 
  const [filterEstado, setFilterEstado] = useState("");

  const [modalState, setModalState] = useState({
    isOpen: false, type: 'view', data: null
  });

  const [notificationModal, setNotificationModal] = useState({
    show: false, message: '', type: 'error'
  });

  const [notification, setNotification] = useState({
    show: false, message: '', type: 'error'
  });

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [docentesData, facultadesData] = await Promise.all([
        apiRequest('/docentes'),
        apiRequest('/facultades')
      ]);
      setDocentes(Array.isArray(docentesData) ? docentesData : []);
      setFacultades(Array.isArray(facultadesData) ? facultadesData : []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setNotification({ show: true, message: "Error de conexión al cargar datos.", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDatos(); }, [fetchDatos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value }
    }));
  };

  const handleCheckboxChange = (id_facultad) => {
    setModalState(prev => {
      const actuales = prev.data.facultades || [];
      const nuevas = actuales.includes(id_facultad)
        ? actuales.filter(id => id !== id_facultad) 
        : [...actuales, id_facultad]; 
      
      return { ...prev, data: { ...prev.data, facultades: nuevas } };
    });
  };

  const filteredDocentes = useMemo(() => {
    return docentes.filter(docente => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        docente.nombres?.toLowerCase().includes(lowerSearch) ||
        docente.apellidos?.toLowerCase().includes(lowerSearch) ||
        docente.correo?.toLowerCase().includes(lowerSearch);

      const matchesTipo = !filterTipo || docente.tipo === filterTipo;
      
      let matchesEstado = true;
      if (filterEstado === "activos") matchesEstado = docente.activo !== false; 
      if (filterEstado === "inactivos") matchesEstado = docente.activo === false;

      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [docentes, searchTerm, filterTipo, filterEstado]);

  const confirmChangeStatus = useCallback((docente, action) => {
    setNotificationModal({ show: false, message: '', type: 'error' });
    setModalState({
      isOpen: true,
      type: 'confirmStatusChange',
      data: { id_docente: docente.id_docente, nombre: `${docente.nombres} ${docente.apellidos}`, action }
    });
  }, []);

  const executeStatusChange = async () => {
    if (isSaving) return;
    const { id_docente, action } = modalState.data;
    
    setIsSaving(true);
    try {
      const endpoint = action === 'desactivar' ? `/docentes/desactivar/${id_docente}` : `/docentes/activar/${id_docente}`;
      await apiRequest(endpoint, { method: 'PUT' });
      
      setNotification({
        show: true,
        message: action === 'desactivar' ? 'Docente eliminado (Inactivo)' : 'Docente reactivado',
        type: 'success'
      });
      await fetchDatos();
      closeModal();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      setNotificationModal({ show: true, message: error.message || "Error al cambiar el estado del docente", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = useMemo(() => [
    { header: 'Docente', render: (row) => `${row.nombres} ${row.apellidos}` },
    { header: 'Correo', accessor: 'correo' },
    { header: 'Contrato', accessor: 'tipo' },
    { header: 'Carga (Min-Máx)', render: (row) => `${row.carga_minima ?? 0}h - ${row.carga_maxima ?? 0}h` },
    { 
      header: 'Estado', accessor: 'activo',
      render: (row) => (
        <span className={`status-badge ${row.activo !== false ? 'status-active' : 'status-inactive'}`}>
          {row.activo !== false ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], []);

  const openAddModal = () => {
    setNotificationModal({ show: false, message: '', type: 'error' });
    setModalState({ 
      isOpen: true, type: 'add',
      data: { 
        nombres: '', apellidos: '', email: '',
        tipo: 'Tiempo Completo', carga_minima: '', carga_maxima: '', 
        facultades: []
      } 
    });
  };

  const openEditModal = (docente) => {
    setNotificationModal({ show: false, message: '', type: 'error' });
    setModalState({ 
      isOpen: true, type: 'edit', 
      data: { 
        ...docente,
        email: docente.correo,
        carga_minima: docente.carga_minima === 0 || docente.carga_minima === null ? '' : docente.carga_minima,
        carga_maxima: docente.carga_maxima === 0 || docente.carga_maxima === null ? '' : docente.carga_maxima,
        facultades: docente.facultades ? docente.facultades.map(f => f.id_facultad) : []
      } 
    });
  };

  const closeModal = () => {
    setNotificationModal({ show: false, message: '', type: 'error' });
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveDocente = async (formData) => {
    if (isSaving) return;

    if (!formData.nombres || !formData.apellidos) {
      setNotificationModal({ show: true, message: "Complete los campos.", type: 'error' });
      return;
    }
    if (modalState.type === 'add' && !formData.email) {
      setNotificationModal({ show: true, message: "El correo es obligatorio para crear el usuario.", type: 'error' });
      return;
    }
    if (!formData.facultades || formData.facultades.length === 0) {
      setNotificationModal({ show: true, message: "Debe asignar al menos una facultad.", type: 'error' });
      return;
    }

    const minVal = formData.carga_minima !== "" && formData.carga_minima !== undefined ? Number(formData.carga_minima) : null;
    const maxVal = formData.carga_maxima !== "" && formData.carga_maxima !== undefined ? Number(formData.carga_maxima) : null;

    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      setNotificationModal({ show: true, message: "La carga mínima no puede ser mayor a la máxima.", type: 'error' });
      return;
    }

    const payload = {
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      tipo: formData.tipo,
      facultades: formData.facultades
    };

    if (minVal !== null) payload.carga_minima = minVal;
    if (maxVal !== null) payload.carga_maxima = maxVal;

    if (modalState.type === 'add') {
      payload.email = formData.email;
    }

    setIsSaving(true);

    try {
      const url = modalState.type === 'add' ? '/docentes' : `/docentes/actualizar/${formData.id_docente}`;
      const method = modalState.type === 'add' ? 'POST' : 'PUT';

      await apiRequest(url, { method, body: JSON.stringify(payload) });

      setNotificationModal({
        show: true, message: modalState.type === 'add' ? 'Docente registrado exitosamente' : 'Docente actualizado exitosamente', type: 'success'
      });
      
      await fetchDatos();
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      console.error("Error al guardar:", error);
      setNotificationModal({ show: true, message: error.message || "Error al procesar la solicitud", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    docentes: filteredDocentes, facultades, columns,
    searchTerm, setSearchTerm, filterTipo, setFilterTipo, filterEstado, setFilterEstado,   
    modalState, loading, isSaving, openAddModal, openEditModal, closeModal,
    handleSaveDocente, handleInputChange, handleCheckboxChange, confirmChangeStatus, executeStatusChange,
    notificationModal, setNotificationModal, notification, setNotification
  };
};