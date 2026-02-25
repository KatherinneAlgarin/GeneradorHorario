import React, { useEffect } from 'react';
import '../../styles/Notification.css';

const Notification = ({ show, message, type = 'error', onClose, autoClose = 5000 }) => {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onClose]);

  if (!show) return null;

  return (
    <div className={`notification-inline notification-inline-${type}`}>
      <p className="notification-inline-message">{message}</p>
      <button 
        className="notification-inline-close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;
