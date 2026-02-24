import React, { useState } from 'react';
import Tabs from '../../components/common/Tabs'; // <--- REUTILIZAMOS TU COMPONENTE
import '../../styles/AdminDashboard.css';
import GestorAulas from './GestorAulas';
import GestorTiposAula from './GestorTiposAula';
import GestorEquipamiento from './GestorEquipamiento';

const GestorInfraestructura = () => {
  const [activeTab, setActiveTab] = useState('aulas');

  const infrastructureTabs = [
    { id: 'aulas', label: 'Gestión de Aulas' },
    { id: 'tipos', label: 'Tipos de Aula' },
    // { id: 'equipamiento', label: 'Catálogo de Equipamiento' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'aulas': return <GestorAulas />;
      case 'tipos': return <GestorTiposAula />;
      // case 'equipamiento': return <GestorEquipamiento />;
      default: return <GestorAulas />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Infraestructura</h2>
      </div>

      <Tabs 
        tabs={infrastructureTabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default GestorInfraestructura;