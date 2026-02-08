import { useState, useEffect } from 'react';

// datos iniciales simulando db para apruebas del frontedn
const initialStats = {
  docentes: { asignados: 120, sin_asignar: 15 },
  materias: { total: 85, por_facultad: { 1: 30, 2: 25, 3: 30 } },
  aulas: { asignadas: 45, sin_asignar: 10 }
};

export const useInfo = (selectedFacultyId) => {
  const [stats, setStats] = useState(initialStats);

  // Simulación: Si seleccionan facultad, recalculamos materias
  // Aquí ira lógica de backend real
  const materiasMostradas = selectedFacultyId 
    ? (stats.materias.por_facultad[selectedFacultyId] || 0) 
    : stats.materias.total;

  return {
    stats,
    materiasMostradas
  };
};