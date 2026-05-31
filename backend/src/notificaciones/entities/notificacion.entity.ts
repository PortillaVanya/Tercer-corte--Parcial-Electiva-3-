import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../usuarios/entities/usuario.entity';

@Entity({ name: 'notificaciones' })
export class NotificacionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  tipo: 'EMAIL' | 'SLACK' | 'WHATSAPP' | 'IN_APP';

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destinatarioEmail: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: 'PENDIENTE' | 'ENVIADA' | 'FALLIDA';

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  usuario: UserEntity;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: number;
}
