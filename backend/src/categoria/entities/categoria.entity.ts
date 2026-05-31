import { ProductoEntity } from 'src/productos/entities/producto.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'categorias' })
export class CategoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id_categoria' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => ProductoEntity, (producto) => producto.categorias)
  productos: ProductoEntity[];

  @DeleteDateColumn({ type: 'datetime', name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}
