import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioEntity } from './entities/inventario.entity';
import { InventarioLogEntity } from './entities/inventario-log.entity';
import { WebsocketsModule } from '../websockets/websockets.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventarioEntity, InventarioLogEntity]),
    WebsocketsModule,
    NotificacionesModule,
  ],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
