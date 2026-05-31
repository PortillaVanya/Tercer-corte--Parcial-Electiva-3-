import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  categoriaId?: number;
  categoriaNombre?: string;
}

interface ProductState {
  productos: Producto[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchProductos: (page?: number, limit?: number) => Promise<void>;
  createProducto: (producto: Partial<Producto>) => Promise<void>;
  updateProducto: (id: string, producto: Partial<Producto>) => Promise<void>;
  deleteProducto: (id: string) => Promise<void>;
  healthMetrics: HealthMetrics | null;
  fetchHealthMetrics: () => Promise<void>;
}

interface HealthMetrics {
  kpis: {
    stockCritico: number;
    agotados: number;
    valorTotal: number;
    categoriasActivas: number;
  };
  alertList: Array<{
    id: number;
    nombre: string;
    stock: number;
    minimo: number;
    estado: string;
  }>;
  distribution: Array<{ name: string; value: number }>;
  locationStatus: Array<{ name: string; stock: number }>;
  recentLogs: Array<{
    id: number;
    tipo: string;
    cantidad: number;
    motivo: string;
    fecha: string;
    producto: string;
  }>;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      productos: [],
      total: 0,
      isLoading: false,
      error: null,
      healthMetrics: null,

      fetchHealthMetrics: async () => {
        try {
          const { data } = await api.get('/productos/health');
          set({ healthMetrics: data });
        } catch (error) {
          console.error('Error fetching health metrics', error);
        }
      },

      fetchProductos: async (page = 1, limit = 1000) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get(`/productos/pagination?page=${page}&limit=${limit}`);
          const mapped = data.data.map((p: { 
            id: number; 
            nombre: string; 
            categorias?: { nombre: string }; 
            precio: string | number; 
            inventario?: { stock: number }; 
            imagen?: string; 
            categoriaId?: number; 
          }) => ({
            id: p.id.toString(),
            nombre: p.nombre,
            descripcion: p.categorias?.nombre || 'Sin categoría',
            precio: Number(p.precio),
            stock: p.inventario?.stock || 0,
            imagen: p.imagen || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
            categoriaId: p.categoriaId,
            categoriaNombre: p.categorias?.nombre
          }));
          set({ productos: mapped, total: data.total, isLoading: false });
        } catch {
          set({ error: 'Error al cargar productos', isLoading: false });
        }
      },

      createProducto: async (producto) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/productos', producto);
          await get().fetchProductos();
        } catch (error: unknown) {
          set({ error: 'Error al crear producto', isLoading: false });
          throw error;
        }
      },

      updateProducto: async (id, producto) => {
        set({ isLoading: true, error: null });
        try {
          await api.patch(`/productos/${id}`, producto);
          await get().fetchProductos();
        } catch (error: unknown) {
          set({ error: 'Error al actualizar producto', isLoading: false });
          throw error;
        }
      },

      deleteProducto: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/productos/${id}`);
          await get().fetchProductos();
        } catch (error: unknown) {
          set({ error: 'Error al eliminar producto', isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'product-storage',
    }
  )
);
