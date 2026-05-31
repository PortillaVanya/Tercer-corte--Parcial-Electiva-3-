import { create } from 'zustand';
import api from '../api/axios';

export interface InventarioLog {
  id: number;
  tipo: 'ENTRADA' | 'AJUSTE' | 'PRECIO';
  cantidad: number;
  motivo: string;
  fecha: string;
  producto: {
    nombre: string;
  };
}

interface InventoryState {
  logs: InventarioLog[];
  isLoading: boolean;
  fetchLogs: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  logs: [],
  isLoading: false,
  fetchLogs: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/inventario/logs');
      set({ logs: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching logs', error);
      set({ isLoading: false });
    }
  },
}));
