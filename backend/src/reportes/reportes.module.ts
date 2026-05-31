import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoEntity, InventarioLogEntity])],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
