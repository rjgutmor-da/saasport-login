import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { redirigirSegunRol } from '../utils/router';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    // Verificar si ya hay una sesión activa al cargar
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await redirigirSegunRol(redirectParam);
      } else {
        setVerificandoSesion(false);
      }
    };
    
    checkSession();
  }, [redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // El login fue exitoso, el portero decide a dónde va
      await redirigirSegunRol(redirectParam);
      
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Invalid login credentials') {
        setError('Credenciales inválidas');
      } else if (err.message === 'Email not confirmed') {
        setError('Por favor confirma tu correo electrónico');
      } else {
        setError('Ocurrió un error al intentar iniciar sesión');
      }
      setLoading(false);
    }
  };

  if (verificandoSesion) {
    return (
      <div className="login-container">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-text-secondary">Verificando sesión centralizada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo.png" alt="SaaSport Logo" className="w-20 h-20 mb-2" />
          <h1 className="login-titulo">SaaSport SSO</h1>
          <p className="text-text-secondary text-sm text-center">
            Portal de Autenticación Centralizado
          </p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

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

          <div className="login-input-group">
            <label className="login-label" htmlFor="password">Contraseña</label>
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
            <div className="flex justify-end mt-1">
              <Link 
                to="/forgot-password" 
                className="text-xs text-text-secondary hover:text-primary transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn flex justify-center items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Autenticando...</span>
              </>
            ) : (
              <span>Ingresar</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
