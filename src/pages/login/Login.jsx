import React, { useState } from 'react';
import '../../styles/Login.css';

import { supabase } from '../../services/supabaseClient';
import { getUserRole } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }

    const userRole = await getUserRole();

    if (!userRole) {
      setIsLoading(false);
      setError("El usuario no está asociado a ningún rol.");
      return;
    }

    setIsLoading(false);

    if (userRole.rol === "docente") {
      navigate("/docente");
    }

    if (userRole.rol === "decano") {
      navigate("/decano");
    }

    if (userRole.rol === "admin_general") {
      navigate("/admin");
    }
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
            {error && <div className="error-message">{error}</div>}
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