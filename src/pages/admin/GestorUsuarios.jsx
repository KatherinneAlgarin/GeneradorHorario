import React, { useState } from 'react';
import Tabs from '../../components/common/Tabs';
import '../../styles/AdminDashboard.css';
import GestorDocentes from './GestorDocentes';
import GestorDecanos from './GestorDecanos'; 

const GestorUsuariosTabs = () => {
  const [activeTab, setActiveTab] = useState('docentes');

  const tabOptions = [
    { id: 'docentes', label: 'Docentes' },
    // { id: 'decanos', label: 'Decanos' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'docentes': return <GestorDocentes />;
      // case 'decanos': return <GestorDecanos />;
      default: return <GestorDocentes />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Gestión de Usuarios</h2>
      </div>

      <Tabs 
        tabs={tabOptions} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default GestorUsuariosTabs;