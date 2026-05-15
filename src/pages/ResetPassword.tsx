import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay una sesión activa (Supabase la crea automáticamente al hacer click en el link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('El enlace de recuperación ha expirado o no es válido.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al intentar actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo.png" alt="SaaSport Logo" className="w-20 h-20 mb-2" />
          <h1 className="login-titulo">Nueva Contraseña</h1>
          <p className="text-text-secondary text-sm text-center">
            Ingresa tu nueva contraseña para acceder a tu cuenta.
          </p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle size={24} />
              <p className="font-medium">¡Contraseña actualizada!</p>
            </div>
            <p className="text-center text-text-secondary text-sm">
              Tu contraseña ha sido cambiada con éxito. Serás redirigido al inicio de sesión en unos segundos...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label className="login-label" htmlFor="password">Nueva Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="login-label" htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="login-btn flex justify-center items-center gap-2 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Cambiar Contraseña</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
