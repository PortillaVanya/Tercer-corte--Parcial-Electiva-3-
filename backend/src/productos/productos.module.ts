import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from './entities/producto.entity';
import { InventarioEntity } from 'src/inventario/entities/inventario.entity';
import { InventarioLogEntity } from 'src/inventario/entities/inventario-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductoEntity,
      InventarioEntity,
      InventarioLogEntity,
    ]),
  ],
  providers: [ProductosService],
  controllers: [ProductosController],
  exports: [ProductosService],
})
export class ProductosModule {}
