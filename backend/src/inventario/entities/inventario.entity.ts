import { ProductoEntity } from 'src/productos/entities/producto.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'inventarios' })
export class InventarioEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({
    type: 'varchar',
    default: 'Bodega A',
  })
  ubicacion: string;

  @Column({ type: 'int', default: 0 })
  stockMinimo: number;

  @OneToOne(() => ProductoEntity, (producto) => producto.inventario, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'producto_id' })
  producto: ProductoEntity;
}
