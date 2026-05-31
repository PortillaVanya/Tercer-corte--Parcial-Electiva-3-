import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: unknown) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      setHydrated: () => set({ isHydrated: true }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data } = await api.post('/auth/login', credentials);
          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error de conexión con el servidor';
          set({ 
            error: message, 
            isLoading: false 
          });
          throw new Error(message);
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/register', data);
          set({ isLoading: false });
        } catch (error: unknown) {
          set({ 
            error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al registrarse', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        try {
          // We need a profile endpoint to check if cookie is valid
          const { data } = await api.get('/usuarios/profile');
          set({ user: data, isAuthenticated: true });
        } catch {
          set({ isAuthenticated: false, user: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: (state) => {
        return () => state?.setHydrated();
      },
    }
  )
);
