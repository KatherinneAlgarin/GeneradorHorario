import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //estados de control
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const changeView = (view) => {
    setError('');
    setIsLoading(false); //apagar el loader al cambiar la vista
    setCurrentView(view);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    //esta es una simulacion de espera
    setTimeout(() => {
      setIsLoading(false);
      navigate('/admin');
    }, 1500);
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setError("Por favor ingresa tu correo.");
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      console.log("Enviando código a:", recoveryEmail);
      setIsLoading(false);
      changeView('forgot-code');
    }, 1500);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (recoveryCode.length < 4) {
      setError("El código parece incompleto.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      console.log("Verificando código:", recoveryCode);
      setIsLoading(false);
      changeView('forgot-reset');
    }, 1500);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      console.log("Contraseña cambiada exitosamente");
      alert("¡Contraseña actualizada! Inicia sesión.");

      setRecoveryEmail('');
      setRecoveryCode('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
      changeView('login');
    }, 1500);
  };

  let content;
  switch (currentView) {
    case 'login':
      content = (
        <>
          <h1 className="login-title">Gestor de Horarios</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input 
                type="email" 
                placeholder="correo@ejemplo.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
          
          {/* Ocultar el link si está cargando para evitar clics accidentales */}
          {!isLoading && (
            <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); changeView('forgot-email'); }}>
              ¿Olvidaste tu contraseña?
            </a>
          )}
        </>
      );
      break;

    case 'forgot-email':
      content = (
        <>
          <h1 className="login-title">Gestor de Horarios</h1>
          <p className="login-subtitle">Recuperación de contraseña</p>
          
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSendCode}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input 
                type="email" 
                placeholder="correo@ejemplo.com" 
                required 
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p className="help-text">Ingresa tu correo para recibir el código de verificación</p>
            
            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Recibir código'}
            </button>
          </form>
          
          {!isLoading && (
            <span className="back-to-login" onClick={() => changeView('login')}>
              Volver al inicio de sesión
            </span>
          )}
        </>
      );
      break;

    case 'forgot-code':
      content = (
        <>
          <h1 className="login-title">Gestor de Horarios</h1>
          <p className="login-subtitle">Verificación de código</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label>Ingresar código</label>
              <input 
                type="text" 
                placeholder="9999" 
                className="input-code" 
                maxLength="6" 
                required 
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                disabled={isLoading}
                inputMode="numeric"
              />
              <span className="help-text">Revisa tu correo y escribe el código de 6 dígitos</span>
            </div>
            
            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>
          
          {!isLoading && (
            <span className="back-to-login" onClick={() => changeView('login')}>
              Volver al inicio de sesión
            </span>
          )}
        </>
      );
      break;

    case 'forgot-reset':
      content = (
        <>
          <h1 className="login-title">Gestor de Horarios</h1>
          <p className="login-subtitle">Establecer nueva contraseña</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Nueva contraseña</label>
              <input 
                type="password" 
                placeholder="Mínimo 8 caracteres" 
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input 
                type="password" 
                placeholder="Repite la contraseña" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Confirmar'}
            </button>
          </form>
          
          {!isLoading && (
            <span className="back-to-login" onClick={() => changeView('login')}>
              Volver al inicio de sesión
            </span>
          )}
        </>
      );
      break;

    default:
      content = null;
  }

  return (
    <div className="login-card">
      {content}
    </div>
  );
}