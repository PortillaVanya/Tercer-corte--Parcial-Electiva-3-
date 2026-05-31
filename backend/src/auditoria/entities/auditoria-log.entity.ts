import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../usuarios/entities/usuario.entity';

@Entity({ name: 'auditoria_logs' })
export class AuditoriaLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  accion:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'EXPORT'
    | 'IMPORT';

  @Column({ type: 'varchar', length: 100 })
  entidad: string; // producto, venta, proveedor, etc.

  @Column({ type: 'int', nullable: true })
  entidadId: number | null;

  @Column({ type: 'text' })
  cambios: string; // JSON string de los cambios

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ type: 'boolean', default: false })
  inmutable: boolean; // Si es true, no puede ser modificado

  @Column({ type: 'varchar', length: 32, nullable: true })
  hash: string | null; // Hash de integridad

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  usuario: UserEntity;

  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuarioId: number | null;
}
