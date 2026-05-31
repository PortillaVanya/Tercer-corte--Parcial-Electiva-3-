import { create } from 'zustand';
import api from '../api/axios';

export interface Categoria {
  id: number;
  nombre: string;
  productos?: { id: number; nombre: string }[];
}

interface CategoryState {
  categories: Categoria[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (nombre: string) => Promise<void>;
  updateCategory: (id: number, nombre: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/categoria');
      set({ categories: data, isLoading: false });
    } catch {
      set({ error: 'Error al cargar categorías', isLoading: false });
    }
  },

  createCategory: async (nombre) => {
    await api.post('/categoria', { nombre });
    const { data } = await api.get('/categoria');
    set({ categories: data });
  },

  updateCategory: async (id, nombre) => {
    await api.patch(`/categoria/${id}`, { nombre });
    const { data } = await api.get('/categoria');
    set({ categories: data });
  },

  deleteCategory: async (id) => {
    await api.delete(`/categoria/${id}`);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },
}));
