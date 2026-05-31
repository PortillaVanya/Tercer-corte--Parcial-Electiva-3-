import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { VentaEntity } from './entities/venta.entity';
import { VentaDetalleEntity } from './entities/venta-detalle.entity';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { InventarioModule } from '../inventario/inventario.module';
import { ProductosModule } from '../productos/productos.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VentaEntity,
      VentaDetalleEntity,
      InventarioLogEntity,
      ProductoEntity,
    ]),
    InventarioModule,
    ProductosModule,
    WebsocketsModule,
    NotificacionesModule,
  ],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService],
})
export class VentasModule {}
