import { useState, useMemo } from 'react';

const initialDocentes = [
    { id_docente: "d-001", nombres: "Juan Carlos", apellidos: "Pérez", tipo: "Tiempo Completo", carga_maxima: 40, activo: true },
    { id_docente: "d-002", nombres: "Maria", apellidos: "Rodriguez", tipo: "Hora Clase", carga_maxima: 20, activo: true },
    { id_docente: "d-003", nombres: "Carlos", apellidos: "Gómez", tipo: "Hora Clase", carga_maxima: 12, activo: false },
];

export const useDocentes = () => {
    const [docentes, setDocentes] = useState(initialDocentes);
    const [searchTerm, setSearchTerm] = useState("");

    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'add',
        data: null
    });

    const filteredDocentes = useMemo(() => {
        if (!searchTerm) return docentes;
        const lowerSearch = searchTerm.toLowerCase();

        return docentes.filter(docente =>
            docente.nombres.toLowerCase().includes(lowerSearch) ||
            docente.apellidos.toLowerCase().includes(lowerSearch) ||
            docente.tipo.toLowerCase().includes(lowerSearch)
        );
    }, [docentes, searchTerm]);

    const validateDocente = (formData) => {
        if (!formData.nombres || formData.nombres.trim() === "") return "El nombre es obligatorio.";
        if (!formData.apellidos || formData.apellidos.trim() === "") return "El apellido es obligatorio.";
        if (formData.carga_maxima <= 0) return "La carga máxima debe ser mayor a 0.";
        return null;
    };

    const openAddModal = () => {
        setModalState({
            isOpen: true,
            type: 'add',
            data: { nombres: '', apellidos: '', tipo: 'Tiempo Completo', carga_maxima: 40, activo: true }
        });
    };

    const openEditModal = (docente) => {
        setModalState({ isOpen: true, type: 'edit', data: { ...docente } });
    };

    const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

    const handleSaveDocente = (formData) => {
        const error = validateDocente(formData);
        if (error) {
            alert(error);
            return;
        }

        if (modalState.type === 'add') {
            const newDocente = {
                ...formData,
                id_docente: crypto.randomUUID(),
                activo: true
            };
            setDocentes([...docentes, newDocente]);
        } else {
            setDocentes(docentes.map(d => d.id_docente === formData.id_docente ? formData : d));
        }
        closeModal();
    };

    const toggleStatus = (id_docente) => {
        setDocentes(docentes.map(d =>
            d.id_docente === id_docente ? { ...d, activo: !d.activo } : d
        ));
    };

    const deleteDocente = (id_docente) => {
        if (window.confirm("¿Estás seguro de eliminar este docente?")) {
            setDocentes(docentes.filter(d => d.id_docente !== id_docente));
        }
    };

    return {
        docentes: filteredDocentes,
        searchTerm,
        setSearchTerm,
        modalState,
        openAddModal,
        openEditModal,
        closeModal,
        handleSaveDocente,
        deleteDocente,
        toggleStatus
    };
};