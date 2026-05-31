import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../usuarios/entities/usuario.entity';
import { VentaDetalleEntity } from './venta-detalle.entity';

@Entity({ name: 'ventas' })
export class VentaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  numeroFactura: string;

  @Column({ type: 'date' })
  fechaVenta: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  impuesto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'varchar', length: 50, default: 'COMPLETADA' })
  estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'DEVOLUCION';

  @Column({ type: 'varchar', length: 20, default: 'EFECTIVO' })
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO';

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  vendedor: UserEntity;

  @Column({ name: 'vendedor_id' })
  vendedorId: number;

  @OneToMany(() => VentaDetalleEntity, (detalle) => detalle.venta)
  detalles: VentaDetalleEntity[];
}
