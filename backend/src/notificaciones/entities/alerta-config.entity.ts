import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductoEntity } from '../../productos/entities/producto.entity';

@Entity({ name: 'alerta_config' })
export class AlertaConfigEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  umbralMinimo: number;

  @Column({ type: 'int', default: 0 })
  umbralMaximo: number;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @Column({ type: 'json', nullable: true })
  canales: {
    email?: boolean;
    slack?: boolean;
    whatsapp?: boolean;
    inApp?: boolean;
  };

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => ProductoEntity)
  producto: ProductoEntity;

  @Column({ name: 'producto_id' })
  productoId: number;
}
