import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventarioLogEntity } from './entities/inventario-log.entity';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(InventarioLogEntity)
    private readonly logRepository: Repository<InventarioLogEntity>,
    private readonly websocketsGateway: WebsocketsGateway,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async getLogs() {
    return await this.logRepository.find({
      relations: ['producto'],
      order: { fecha: 'DESC' },
    });
  }

  async createLog(data: {
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'PRECIO';
    cantidad: number;
    motivo: string;
    productoId: number;
  }) {
    const log = await this.logRepository.save(data);
    this.websocketsGateway.emitInventarioUpdate(log);

    // Create notification for significant inventory changes
    if (data.tipo === 'SALIDA' && data.cantidad > 10) {
      // IN_APP notification
      await this.notificacionesService.createNotificacion({
        tipo: 'IN_APP',
        titulo: `📦 Salida de Inventario: ${data.cantidad} unidades`,
        mensaje: `Salida registrada: ${data.motivo}`,
        metadata: { productoId: data.productoId, cantidad: data.cantidad },
      });

      // Email notification
      await this.notificacionesService.createNotificacion({
        tipo: 'EMAIL',
        titulo: `Salida de Inventario - ${data.cantidad} unidades`,
        mensaje: `Se ha registrado una salida de inventario:\n\nCantidad: ${data.cantidad}\nMotivo: ${data.motivo}\nProducto ID: ${data.productoId}\nFecha: ${new Date().toLocaleString()}`,
        metadata: {
          productoId: data.productoId,
          cantidad: data.cantidad,
          tipo: data.tipo,
        },
      });
    }

    return log;
  }
}
