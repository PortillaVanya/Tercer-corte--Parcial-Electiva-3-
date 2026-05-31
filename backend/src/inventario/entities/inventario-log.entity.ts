import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductoEntity } from 'src/productos/entities/producto.entity';

@Entity({ name: 'inventario_logs' })
export class InventarioLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'PRECIO';

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'varchar', length: 255 })
  motivo: string;

  @CreateDateColumn({ type: 'datetime' })
  fecha: Date;

  @ManyToOne(() => ProductoEntity)
  @JoinColumn({ name: 'producto_id' })
  producto: ProductoEntity;

  @Column({ name: 'producto_id' })
  productoId: number;
}
