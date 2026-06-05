import { create } from 'zustand';
import api from '../api/axios';

export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  notas?: string;
  createdAt: string;
}

export interface OrdenCompra {
  id: number;
  numeroOrden: string;
  fechaOrden: string;
  fechaEntregaEsperada?: string;
  fechaEntregaReal?: string;
  proveedorId: number;
  estado: 'PENDIENTE' | 'ENVIADO' | 'RECIBIDO' | 'CANCELADO';
  total: number;
  notas?: string;
  proveedor?: Proveedor;
  detalles?: OrdenCompraDetalle[];
}

export interface OrdenCompraDetalle {
  id: number;
  ordenCompraId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: {
    id: number;
    nombre: string;
  };
}

interface ProveedorState {
  proveedores: Proveedor[];
  ordenesCompra: OrdenCompra[];
  isLoading: boolean;
  error: string | null;

  fetchProveedores: () => Promise<void>;
  createProveedor: (data: Partial<Proveedor>) => Promise<void>;
  updateProveedor: (id: number, data: Partial<Proveedor>) => Promise<void>;
  deleteProveedor: (id: number) => Promise<void>;

  fetchOrdenesCompra: () => Promise<void>;
  createOrdenCompra: (data: any) => Promise<void>;
  updateOrdenCompra: (id: number, data: any) => Promise<void>;
  deleteOrdenCompra: (id: number) => Promise<void>;
  updateOrdenEstado: (id: number, estado: string) => Promise<void>;
  recibirOrdenCompra: (id: number) => Promise<void>;
}

export const useProveedorStore = create<ProveedorState>((set) => ({
  proveedores: [],
  ordenesCompra: [],
  isLoading: false,
  error: null,

  fetchProveedores: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/proveedores');
      set({ proveedores: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar proveedores', isLoading: false });
    }
  },

  createProveedor: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: newProveedor } = await api.post('/proveedores', data);
      set((state) => ({
        proveedores: [...state.proveedores, newProveedor],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear proveedor', isLoading: false });
      throw error;
    }
  },

  updateProveedor: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updatedProveedor } = await api.patch(`/proveedores/${id}`, data);
      set((state) => ({
        proveedores: state.proveedores.map((p) => (p.id === id ? updatedProveedor : p)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar proveedor', isLoading: false });
      throw error;
    }
  },

  deleteProveedor: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/proveedores/${id}`);
      set((state) => ({
        proveedores: state.proveedores.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar proveedor', isLoading: false });
      throw error;
    }
  },

  fetchOrdenesCompra: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/proveedores/ordenes/lista');
      set({ ordenesCompra: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar órdenes de compra', isLoading: false });
    }
  },

  createOrdenCompra: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: newOrden } = await api.post('/proveedores/ordenes', data);
      set((state) => ({
        ordenesCompra: [newOrden, ...state.ordenesCompra],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear orden de compra', isLoading: false });
      throw error;
    }
  },

  updateOrdenEstado: async (id, estado) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updatedOrden } = await api.patch(`/proveedores/ordenes/${id}/estado`, { estado });
      set((state) => ({
        ordenesCompra: state.ordenesCompra.map((o) => (o.id === id ? updatedOrden : o)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar estado', isLoading: false });
      throw error;
    }
  },

  recibirOrdenCompra: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updatedOrden } = await api.patch(`/proveedores/ordenes/${id}/recibir`);
      set((state) => ({
        ordenesCompra: state.ordenesCompra.map((o) => (o.id === id ? updatedOrden : o)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al recibir orden', isLoading: false });
      throw error;
    }
  },

  updateOrdenCompra: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updatedOrden } = await api.patch(`/proveedores/ordenes/${id}`, data);
      set((state) => ({
        ordenesCompra: state.ordenesCompra.map((o) => (o.id === id ? updatedOrden : o)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar orden', isLoading: false });
      throw error;
    }
  },

  deleteOrdenCompra: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/proveedores/ordenes/${id}`);
      set((state) => ({
        ordenesCompra: state.ordenesCompra.filter((o) => o.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar orden', isLoading: false });
      throw error;
    }
  },
}));
