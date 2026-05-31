import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { ProveedorEntity } from './entities/proveedor.entity';
import { OrdenCompraEntity } from './entities/orden-compra.entity';
import { OrdenCompraDetalleEntity } from './entities/orden-compra-detalle.entity';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { InventarioModule } from '../inventario/inventario.module';
import { ProductosModule } from '../productos/productos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProveedorEntity,
      OrdenCompraEntity,
      OrdenCompraDetalleEntity,
      InventarioLogEntity,
      ProductoEntity,
    ]),
    InventarioModule,
    ProductosModule,
    NotificacionesModule,
  ],
  controllers: [ProveedoresController],
  providers: [ProveedoresService],
  exports: [ProveedoresService],
})
export class ProveedoresModule {}
