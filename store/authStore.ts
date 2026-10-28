// Reemplazo temporal de: store/authStore.ts (versión conectada a Firebase)
//
//> Simula sesión con un simple booleano en memoria en vez de
//> @react-native-firebase/auth. Login/register "funcionan" con
//> cualquier email/contraseña no vacíos, para poder probar el flujo
//> completo de navegación sin depender de Firebase todavía.
//>
//> Misma forma que el store real: mismos nombres de función, mismo
//> tipo AuthState. hiveStore, LoginScreen, RegisterScreen, etc. no
//> necesitan saber que esto es un mock.

import { create } from 'zustand';

export type AuthState =
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; uid: string }
  | { status: 'error'; message: string }
  | { status: 'loading' };

interface AuthStore {
  state: AuthState;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  changePassword: (newPass: string) => Promise<void>;
}

//> Pequeño delay artificial para que los ActivityIndicator de las
//> pantallas de login/registro se vean (igual de instantáneo que un
//> mock puro se sentiría "raro" comparado con una llamada de red real).
function fakeDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  //> Arranca en "unauthenticated" directo (no "loading"): no hay
  //> listener asíncrono de verdad que resolver, así que no hace falta
  //> el estado de espera inicial que sí necesita la versión con
  //> Firebase real.
  state: { status: 'unauthenticated' },

  login: async (email, pass) => {
    await fakeDelay();
    if (!email.trim() || !pass.trim()) {
      const message = 'Email y contraseña son obligatorios';
      set({ state: { status: 'error', message } });
      throw new Error(message);
    }
    set({ state: { status: 'authenticated', uid: `mock-${email}` } });
  },

  register: async (email, pass) => {
    await fakeDelay();
    if (!email.trim() || !pass.trim()) {
      const message = 'Email y contraseña son obligatorios';
      set({ state: { status: 'error', message } });
      throw new Error(message);
    }
    set({ state: { status: 'authenticated', uid: `mock-${email}` } });
  },

  logout: () => {
    set({ state: { status: 'unauthenticated' } });
  },

  changePassword: async () => {
    const current = get().state;
    if (current.status !== 'authenticated') throw new Error('No autenticado');
    await fakeDelay();
    // No hay nada real que actualizar en este mock.
  },
}));

//> Se mantiene la misma función para que app/_layout.tsx no necesite
//> ningún cambio: acá simplemente no hace nada (no hay listener real
//> que registrar), pero conserva la firma "() => función de limpieza".
export function initAuthListener(): () => void {
  return () => {};
}
