import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al intentar enviar el correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo.png" alt="SaaSport Logo" className="w-20 h-20 mb-2" />
          <h1 className="login-titulo">Recuperar Contraseña</h1>
          <p className="text-text-secondary text-sm text-center">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
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
              <p className="font-medium">¡Correo enviado con éxito!</p>
            </div>
            <p className="text-center text-text-secondary text-sm">
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
            <Link to="/" className="flex items-center gap-2 text-primary hover:underline font-medium">
              <ArrowLeft size={18} />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label className="login-label" htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar Enlace</span>
              )}
            </button>

            <div className="mt-6 text-center">
              <Link to="/" className="flex items-center justify-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm">
                <ArrowLeft size={16} />
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
