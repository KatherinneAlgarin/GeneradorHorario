import React, { useState } from 'react';
import '../../styles/Login.css';

import { supabase } from '../../services/supabaseClient';
import { getUserRole } from '../../services/authService';
import { apiRequest } from '../../services/api'; 
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null); 

  const redirectByRole = (rol) => {
    if (rol === "docente") navigate("/docente");
    if (rol === "decano") navigate("/decano");
    if (rol === "admin_general") navigate("/admin");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setIsLoading(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }

    const userRole = await getUserRole();

    if (!userRole) {
      setIsLoading(false);
      setError("El usuario no está asociado a ningún rol.");
      await supabase.auth.signOut();
      return;
    }

    if (!userRole.activo) {
      setIsLoading(false);
      setError("El usuario se encuentra inactivo. Contacte al administrador.");
      await supabase.auth.signOut();
      return;
    }

    const needsPasswordChange = data.user?.user_metadata?.needs_password_change;

    if (needsPasswordChange) {
      setIsLoading(false);
      setPendingUser({ id: data.user.id, rol: userRole.rol });
      setCurrentView('force-password-change'); 
      return;
    }

    setIsLoading(false);
    redirectByRole(userRole.rol);
  };

  const handleForcePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    //validaciones para no tener que estar esperando la respuesta del backend
    if (newPassword.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (!/[A-Z]/.test(newPassword)) return setError("La contraseña debe contener al menos una letra mayúscula.");
    if (!/[a-z]/.test(newPassword)) return setError("La contraseña debe contener al menos una letra minúscula.");
    if (!/\d/.test(newPassword)) return setError("La contraseña debe contener al menos un número.");
    if (!/[^a-zA-Z0-9]/.test(newPassword)) return setError("La contraseña debe contener al menos un carácter especial (ej: !@#$%^&*).");
    if (newPassword !== confirmPassword) return setError("Las contraseñas no coinciden.");

    setIsLoading(true);

    try {
      await apiRequest('/auth/cambiar-password', {
        method: 'POST',
        body: JSON.stringify({
          id_auth_user: pendingUser.id,
          nueva_password: newPassword
        })
      });

      setSuccessMessage("¡Contraseña actualizada con éxito! Redirigiendo...");
      setIsLoading(false);
      
      // Redirigir después de un breve momento para mostrar el mensaje
      setTimeout(() => {
        redirectByRole(pendingUser.rol);
      }, 1500);
      
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Error al actualizar la contraseña");
    }
  };

  const handleCancelUpdate = async () => {
    await supabase.auth.signOut();
    setPendingUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setCurrentView('login');
  };

  return (
    <div className="login-card">
      {currentView === 'login' ? (
        <>
          <h1 className="login-title">Gestor de Horarios</h1>
          <form onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Correo electrónico</label>
              <input 
                type="email" 
                placeholder="correo@catolica.edu.sv" 
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
      ) : (
        <>
          <h1 className="login-title">Actualización Obligatoria</h1>
          <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', marginBottom: '15px' }}>
            Por tu seguridad, debes cambiar la contraseña temporal antes de acceder al sistema.
          </p>

          {error && <div className="error-message">{error}</div>}
          
          {successMessage && (
            <div style={{ 
              background: '#dcfce7', 
              color: '#166534', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '15px',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              ✓ {successMessage}
            </div>
          )}

          <form onSubmit={handleForcePasswordUpdate}>
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

            <ul style={{ fontSize: '0.75rem', color: '#777', marginBottom: '20px', paddingLeft: '20px', lineHeight: '1.4' }}>
              <li>Al menos 8 caracteres</li>
              <li>Una letra mayúscula y una minúscula</li>
              <li>Al menos un número (0-9)</li>
              <li>Un carácter especial (!@#$%^&*)</li>
            </ul>
            
            <button type="submit" className="btn-login" disabled={isLoading || successMessage} style={{ marginBottom: '10px' }}>
              {isLoading ? 'Guardando...' : successMessage ? '¡Listo!' : 'Confirmar y Entrar'}
            </button>

            {!isLoading && (
              <button 
                type="button" 
                onClick={handleCancelUpdate} 
                style={{ 
                  background: 'transparent', border: 'none', width: '100%', 
                  color: '#666', cursor: 'pointer', fontSize: '0.9rem', marginTop: '5px' 
                }}
              >
                Cancelar
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
}