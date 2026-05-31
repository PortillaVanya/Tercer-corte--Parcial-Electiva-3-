import { CategoriaEntity } from 'src/categoria/entities/categoria.entity';
import { InventarioEntity } from 'src/inventario/entities/inventario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'productos' })
export class ProductoEntity {
  @PrimaryGeneratedColumn({ name: 'id_producto' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagen: string;

  @CreateDateColumn({ type: 'datetime', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @Column({ name: 'categoria_id', nullable: true })
  categoriaId: number;

  @ManyToOne(() => CategoriaEntity, (categoria) => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categorias: CategoriaEntity;

  @OneToOne(() => InventarioEntity, (inventario) => inventario.producto, {
    cascade: true,
  })
  inventario: InventarioEntity;
}
