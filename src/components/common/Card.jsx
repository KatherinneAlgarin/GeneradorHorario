import React from 'react';
import '../../styles/AdminDashboard.css';

const Card = ({ title, icon, value, label, subValue, subLabel, subColor }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span>{title}</span>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div className="stat-numbers">
        <div className="stat-item">
          <h4>{value}</h4>
          <p>{label}</p>
        </div>
        
        {subValue !== undefined && (
          <div className="stat-item" style={subColor ? { color: subColor } : { opacity: 0.6 }}>
            <h4>{subValue}</h4>
            <p>{subLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;