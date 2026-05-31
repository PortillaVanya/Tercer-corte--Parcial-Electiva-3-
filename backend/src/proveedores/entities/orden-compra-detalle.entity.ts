import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrdenCompraEntity } from './orden-compra.entity';
import { ProductoEntity } from '../../productos/entities/producto.entity';

@Entity({ name: 'ordenes_compra_detalles' })
export class OrdenCompraDetalleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => OrdenCompraEntity, (orden) => orden.detalles)
  ordenCompra: OrdenCompraEntity;

  @Column({ name: 'orden_compra_id' })
  ordenCompraId: number;

  @ManyToOne(() => ProductoEntity)
  producto: ProductoEntity;

  @Column({ name: 'producto_id' })
  productoId: number;
}
