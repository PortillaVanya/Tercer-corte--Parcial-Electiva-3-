import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LayoutDashboard, ShoppingBag, LogOut, User, FolderTree, History, Bell, BrainCircuit, X, PackageSearch } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import socket from '../lib/socket';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Productos', icon: ShoppingBag, path: '/products' },
  { label: 'Categorías', icon: FolderTree, path: '/categories' },
  { label: 'Proveedores', icon: PackageSearch, path: '/suppliers' },
  { label: 'Historial', icon: History, path: '/history' },
  { label: 'Predicción', icon: BrainCircuit, path: '/predictions' },
];

// Tipo para las notificaciones recibidas por socket
interface SocketNotification {
  id: number;
  tipo: 'EMAIL' | 'SLACK' | 'WHATSAPP' | 'IN_APP';
  titulo: string;
  mensaje: string;
  leida: boolean;
  estado: 'PENDIENTE' | 'ENVIADA' | 'FALLIDA';
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const { 
    fetchNotifications, 
    unreadCount, 
    showNotification, 
    notifications, 
    markAsRead 
  } = useNotificationStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Obtener userId como string de forma estable
  const userId = user?.id ? String(user.id) : null;

  // Efecto para cargar notificaciones periódicamente
  useEffect(() => {
    if (!userId) return;

    fetchNotifications(userId);
    const interval = setInterval(() => {
      fetchNotifications(userId);
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, fetchNotifications]);

  // Manejadores de eventos de socket memorizados
  const handleNotification = useCallback((payload: SocketNotification) => {
    showNotification(payload);
    if (userId) fetchNotifications(userId);
  }, [userId, showNotification, fetchNotifications]);

  const handleInventoryUpdate = useCallback(() => {
    if (userId) fetchNotifications(userId);
  }, [userId, fetchNotifications]);

  const handleNewSale = useCallback(() => {
    if (userId) fetchNotifications(userId);
  }, [userId, fetchNotifications]);

  const handleStockAlert = useCallback(() => {
    if (userId) fetchNotifications(userId);
  }, [userId, fetchNotifications]);

  // Efecto para suscribirse a eventos de socket
  useEffect(() => {
    if (!userId) return;

    socket.on('notificacion', handleNotification);
    socket.on('inventario-update', handleInventoryUpdate);
    socket.on('nueva-venta', handleNewSale);
    socket.on('alerta-stock', handleStockAlert);

    return () => {
      socket.off('notificacion', handleNotification);
      socket.off('inventario-update', handleInventoryUpdate);
      socket.off('nueva-venta', handleNewSale);
      socket.off('alerta-stock', handleStockAlert);
    };
  }, [userId, handleNotification, handleInventoryUpdate, handleNewSale, handleStockAlert]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(() => {
    notifications.forEach((notification) => {
      if (!notification.leida) {
        markAsRead(notification.id);
      }
    });
  }, [notifications, markAsRead]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-card lg:block">
        <div className="flex h-full flex-col p-6">
          <Link to="/" className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg premium-gradient" />
            <span className="text-xl font-bold">Gestión de Inventario</span>
          </Link>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={pathname === item.path ? 'secondary' : 'ghost'} 
                  className={`w-full justify-start gap-3 ${pathname === item.path ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : ''}`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t">
            <Link to="/profile" className="flex items-center gap-3 mb-4 px-2 hover:bg-white/5 p-2 rounded-xl transition-colors group">
              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.username || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </Link>
            <Button variant="destructive" className="w-full justify-start gap-3" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
          <Link to="/" className="lg:hidden">
            <h1 className="text-lg font-semibold">Gestión de Inventario</h1>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* 
              Si necesitas un componente de búsqueda global, impleméntalo aquí.
              Por ahora se ha eliminado porque no estaba definido.
              Ejemplo: <GlobalSearch /> 
            */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && userId) {
                    fetchNotifications(userId);
                  }
                }}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5 text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Panel de notificaciones */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-card border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold">Notificaciones</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-72">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No hay notificaciones
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-white/5 cursor-pointer ${
                            !notification.leida ? 'bg-blue-500/5' : ''
                          }`}
                          onClick={() => {
                            if (!notification.leida) {
                              markAsRead(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{notification.titulo}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.mensaje}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.leida && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t">
                      <button
                        onClick={markAllAsRead}
                        className="w-full text-sm text-blue-500 hover:text-blue-600"
                      >
                        Marcar todas como leídas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};