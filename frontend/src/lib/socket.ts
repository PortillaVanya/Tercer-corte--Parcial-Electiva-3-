import { io } from 'socket.io-client';

// Crear instancia de socket con configuración robusta
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
  withCredentials: true,
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

// Eventos de conexión
socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully');
});

socket.on('connect_error', (error) => {
  console.warn('⚠️ WebSocket connection error:', error.message);
  // No loguear todo el error para mantener los logs limpios
});

socket.on('disconnect', (reason) => {
  console.log('🔌 WebSocket disconnected:', reason);
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
});

export default socket;
