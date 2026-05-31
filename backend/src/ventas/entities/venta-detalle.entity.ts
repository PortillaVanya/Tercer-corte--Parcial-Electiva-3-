import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VentaEntity } from './venta.entity';
import { ProductoEntity } from '../../productos/entities/producto.entity';

@Entity({ name: 'ventas_detalles' })
export class VentaDetalleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuento: number;

  @ManyToOne(() => VentaEntity, (venta) => venta.detalles)
  venta: VentaEntity;

  @Column({ name: 'venta_id' })
  ventaId: number;

  @ManyToOne(() => ProductoEntity)
  producto: ProductoEntity;

  @Column({ name: 'producto_id' })
  productoId: number;
}
