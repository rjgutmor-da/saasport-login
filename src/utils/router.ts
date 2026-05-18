import { supabase } from '../lib/supabaseClient';

export const DESTINOS_PERMITIDOS: Record<string, string> = {
  asisport: import.meta.env.VITE_URL_ASISPORT || '',
  finanzas: import.meta.env.VITE_URL_FINANZAS || '',
};

export const getDestinoDinamico = (destinoOriginal: string): string => {
  if (!destinoOriginal) return '';
  if (window.location.hostname !== 'login.saasport.pro') {
    if (destinoOriginal.includes('localhost') || destinoOriginal.includes('127.0.0.1') || /https?:\/\/\d+\.\d+\.\d+\.\d+/.test(destinoOriginal)) {
      const currentHostname = window.location.hostname;
      return destinoOriginal.replace(/(https?:\/\/)([^:/]+)(:\d+)?/, `$1${currentHostname}$3`);
    }
  }
  return destinoOriginal;
};

export const redirigirSegunRol = async (redirectParam: string | null) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('No hay sesión activa', sessionError);
      return;
    }

    // Obtener rol del usuario
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', session.user.id)
      .single();

    if (usuarioError || !usuario) {
      console.error('Error obteniendo perfil de usuario', usuarioError);
      return;
    }

    const rol = usuario.rol;
    
    // Fallback URL seguro basado en el rol si no hay redirectParam válido
    let destino = '';

    if (redirectParam && DESTINOS_PERMITIDOS[redirectParam]) {
      // Validar si el rol permite este destino
      if (redirectParam === 'finanzas' && !['Administrador', 'SuperAdministrador'].includes(rol)) {
        // Un entrenador intenta entrar a finanzas -> Forzar a asisport
        destino = DESTINOS_PERMITIDOS['asisport'];
      } else {
        destino = DESTINOS_PERMITIDOS[redirectParam];
      }
    } else {
      // Fallback si no hay parámetro o el parámetro es inválido (open redirect protection)
      if (['Administrador', 'SuperAdministrador'].includes(rol)) {
        destino = DESTINOS_PERMITIDOS['finanzas'];
      } else {
        destino = DESTINOS_PERMITIDOS['asisport'];
      }
    }

    if (destino) {
      const destinoDinamico = getDestinoDinamico(destino);
      window.location.href = destinoDinamico;
    } else {
      console.error('No se pudo determinar el destino de redirección', DESTINOS_PERMITIDOS);
    }

  } catch (error) {
    console.error('Error inesperado en redirección:', error);
  }
};
