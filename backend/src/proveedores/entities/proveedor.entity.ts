import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrdenCompraEntity } from './orden-compra.entity';

@Entity({ name: 'proveedores' })
export class ProveedorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contacto: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ciudad: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pais: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ruc: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => OrdenCompraEntity, (orden) => orden.proveedor)
  ordenesCompra: OrdenCompraEntity[];
}
