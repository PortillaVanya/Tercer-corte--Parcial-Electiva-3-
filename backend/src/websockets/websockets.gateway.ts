import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
    credentials: true,
  },
})
export class WebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    client.emit('joined-room', room);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    client.emit('left-room', room);
  }

  // Emitir actualización de inventario
  emitInventarioUpdate(data: any) {
    this.server.emit('inventario-update', data);
  }

  // Emitir nueva venta
  emitNuevaVenta(data: any) {
    this.server.emit('nueva-venta', data);
  }

  // Emitir alerta de stock
  emitAlertaStock(data: any) {
    this.server.emit('alerta-stock', data);
  }

  // Emitir notificación
  emitNotificacion(data: any) {
    this.server.emit('notificacion', data);
  }
}
