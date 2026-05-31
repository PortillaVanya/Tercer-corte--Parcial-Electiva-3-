import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaLogEntity } from './entities/auditoria-log.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(AuditoriaLogEntity)
    private readonly auditoriaRepository: Repository<AuditoriaLogEntity>,
  ) {}

  async logAction(data: {
    accion:
      | 'CREATE'
      | 'UPDATE'
      | 'DELETE'
      | 'LOGIN'
      | 'LOGOUT'
      | 'EXPORT'
      | 'IMPORT';
    entidad: string;
    entidadId?: number;
    cambios: Record<string, any>;
    usuarioId?: number;
    ip?: string;
    userAgent?: string;
  }) {
    const cambiosStr = JSON.stringify(data.cambios);
    const hash = crypto.createHash('sha256').update(cambiosStr).digest('hex');

    const log = this.auditoriaRepository.create({
      accion: data.accion,
      entidad: data.entidad,
      entidadId: data.entidadId || null,
      cambios: cambiosStr,
      usuarioId: data.usuarioId || null,
      ip: data.ip || null,
      userAgent: data.userAgent || null,
      inmutable: true, // Los logs de auditoría son inmutables por defecto
      hash,
    });

    return await this.auditoriaRepository.save(log);
  }

  async getAuditLogs(filters?: {
    usuarioId?: number;
    entidad?: string;
    accion?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
  }) {
    const query = this.auditoriaRepository.createQueryBuilder('log');

    if (filters?.usuarioId) {
      query.andWhere('log.usuarioId = :usuarioId', {
        usuarioId: filters.usuarioId,
      });
    }

    if (filters?.entidad) {
      query.andWhere('log.entidad = :entidad', { entidad: filters.entidad });
    }

    if (filters?.accion) {
      query.andWhere('log.accion = :accion', { accion: filters.accion });
    }

    if (filters?.fechaInicio && filters?.fechaFin) {
      query.andWhere('log.createdAt BETWEEN :inicio AND :fin', {
        inicio: filters.fechaInicio,
        fin: filters.fechaFin,
      });
    }

    return await query
      .leftJoinAndSelect('log.usuario', 'usuario')
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }

  async verifyIntegrity(logId: number): Promise<boolean> {
    const log = await this.auditoriaRepository.findOne({
      where: { id: logId },
    });
    if (!log) return false;

    const hash = crypto.createHash('sha256').update(log.cambios).digest('hex');
    return hash === log.hash;
  }

  async getAuditReport(fechaInicio: Date, fechaFin: Date) {
    const logs = await this.getAuditLogs({ fechaInicio, fechaFin });

    const reporte = {
      periodo: { inicio: fechaInicio, fin: fechaFin },
      totalAcciones: logs.length,
      porAccion: {} as Record<string, number>,
      porEntidad: {} as Record<string, number>,
      porUsuario: {} as Record<string, number>,
      accionesPorDia: {} as Record<string, number>,
    };

    logs.forEach((log) => {
      // Por acción
      reporte.porAccion[log.accion] = (reporte.porAccion[log.accion] || 0) + 1;

      // Por entidad
      reporte.porEntidad[log.entidad] =
        (reporte.porEntidad[log.entidad] || 0) + 1;

      // Por usuario
      if (log.usuario) {
        reporte.porUsuario[log.usuario.username] =
          (reporte.porUsuario[log.usuario.username] || 0) + 1;
      }

      // Por día
      const dia = log.createdAt.toISOString().substring(0, 10);
      reporte.accionesPorDia[dia] = (reporte.accionesPorDia[dia] || 0) + 1;
    });

    return reporte;
  }
}
