import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandPredictionService } from './demand-prediction.service';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { MlController } from './ml.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioLogEntity, ProductoEntity])],
  controllers: [MlController],
  providers: [DemandPredictionService],
  exports: [DemandPredictionService],
})
export class MlModule {}
