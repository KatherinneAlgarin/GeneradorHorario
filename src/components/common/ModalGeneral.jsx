import React from 'react';
import '../../styles/AdminDashboard.css';

const ModalGeneral = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-header">{title}</h3>
        <div className="modal-body">
          {children}
        </div>

        {footer && (
          <div className="modal-actions">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalGeneral;