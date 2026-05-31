import { create } from 'zustand';
import api from '../api/axios';
import toast from 'react-hot-toast';

export interface Notification {
  id: number;
  tipo: 'EMAIL' | 'SLACK' | 'WHATSAPP' | 'IN_APP';
  titulo: string;
  mensaje: string;
  leida: boolean;
  estado: 'PENDIENTE' | 'ENVIADA' | 'FALLIDA';
  createdAt: string;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  showNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/notificaciones/usuario/${userId}`);
      const unread = data.filter((n: Notification) => !n.leida).length;
      set({ notifications: data, unreadCount: unread, isLoading: false });
    } catch (error) {
      console.error('Error fetching notifications', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: number) => {
    try {
      await api.patch(`/notificaciones/${id}/leer`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, leida: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
  },

  showNotification: (notification: Notification) => {
    // Agregar notificación a la lista si no existe
    set((state) => {
      const exists = state.notifications.some((n) => n.id === notification.id);
      if (!exists) {
        return {
          notifications: [notification, ...state.notifications],
          unreadCount: notification.leida ? state.unreadCount : state.unreadCount + 1,
        };
      }
      return state;
    });

    // Mostrar toast basado en el tipo
    switch (notification.tipo) {
      case 'IN_APP':
        toast(notification.titulo, {
          duration: 5000,
        });
        break;
      case 'EMAIL':
        toast.success(`📧 ${notification.titulo}`, {
          duration: 4000,
        });
        break;
      case 'SLACK':
        toast(`💬 ${notification.titulo}`, {
          duration: 4000,
        });
        break;
      default:
        toast(notification.titulo, {
          duration: 4000,
        });
    }
  },
}));
