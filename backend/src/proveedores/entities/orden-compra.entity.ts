import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProveedorEntity } from './proveedor.entity';
import { OrdenCompraDetalleEntity } from './orden-compra-detalle.entity';

@Entity({ name: 'ordenes_compra' })
export class OrdenCompraEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  numeroOrden: string;

  @Column({ type: 'date' })
  fechaOrden: Date;

  @Column({ type: 'date', nullable: true })
  fechaEntregaEsperada: Date | null;

  @Column({ type: 'date', nullable: true })
  fechaEntregaReal: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'varchar', length: 50, default: 'PENDIENTE' })
  estado: 'PENDIENTE' | 'ENVIADO' | 'RECIBIDO' | 'CANCELADO';

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => ProveedorEntity, (proveedor) => proveedor.ordenesCompra)
  proveedor: ProveedorEntity;

  @Column({ name: 'proveedor_id' })
  proveedorId: number;

  @OneToMany(() => OrdenCompraDetalleEntity, (detalle) => detalle.ordenCompra)
  detalles: OrdenCompraDetalleEntity[];
}
