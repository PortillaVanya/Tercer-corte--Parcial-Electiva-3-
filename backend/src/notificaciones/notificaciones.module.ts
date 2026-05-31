import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionEntity } from './entities/notificacion.entity';
import { AlertaConfigEntity } from './entities/alerta-config.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificacionEntity, AlertaConfigEntity]),
    ScheduleModule.forRoot(),
    WebsocketsModule,
  ],
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
