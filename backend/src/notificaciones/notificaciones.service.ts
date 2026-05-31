import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificacionEntity } from './entities/notificacion.entity';
import { AlertaConfigEntity } from './entities/alerta-config.entity';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { CreateAlertaConfigDto } from './dto/create-alerta-config.dto';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NotificacionesService {
  private emailTransporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(NotificacionEntity)
    private readonly notificacionRepository: Repository<NotificacionEntity>,
    @InjectRepository(AlertaConfigEntity)
    private readonly alertaConfigRepository: Repository<AlertaConfigEntity>,
    private readonly websocketsGateway: WebsocketsGateway,
  ) {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async createNotificacion(dto: CreateNotificacionDto) {
    // Asignar estado inicial PENDIENTE y usuarioId si no se proporciona
    const notificacion = this.notificacionRepository.create({
      ...dto,
      estado: 'PENDIENTE',
      leida: false,
      usuarioId: dto.usuarioId || 1, // Default to admin user (ID 1) if not provided
    });
    const saved = await this.notificacionRepository.save(notificacion);
    this.websocketsGateway.emitNotificacion(saved);

    // Enviar según el tipo (solo los que requieren envío externo)
    switch (dto.tipo) {
      case 'EMAIL':
        await this.sendEmail(saved);
        break;
      case 'SLACK':
        await this.sendSlack(saved);
        break;
      case 'WHATSAPP':
        await this.sendWhatsApp(saved);
        break;
      case 'IN_APP':
        // Para notificaciones internas, marcamos como enviadas directamente
        saved.estado = 'ENVIADA';
        await this.notificacionRepository.save(saved);
        break;
      default:
        // Tipo no reconocido: marcar como fallida
        saved.estado = 'FALLIDA';
        saved.error = `Tipo de notificación no soportado: ${dto.tipo}`;
        await this.notificacionRepository.save(saved);
    }

    return saved;
  }

  async sendEmail(notificacion: NotificacionEntity) {
    try {
      // Determinar destinatarios
      const recipients: string[] = [];

      // Agregar destinatario específico si existe
      if (notificacion.destinatarioEmail) {
        recipients.push(notificacion.destinatarioEmail);
      }

      // Siempre enviar al admin
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      if (!recipients.includes(adminEmail)) {
        recipients.push(adminEmail);
      }

      // Enviar correo
      if (recipients.length > 0) {
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@inventario.com',
          to: recipients.join(', '),
          subject: notificacion.titulo,
          text: notificacion.mensaje,
        });
      }

      notificacion.estado = 'ENVIADA';
      await this.notificacionRepository.save(notificacion);
    } catch (error) {
      notificacion.estado = 'FALLIDA';
      // CORRECCIÓN: manejo seguro del error
      notificacion.error =
        error instanceof Error ? error.message : String(error);
      await this.notificacionRepository.save(notificacion);
    }
  }

  async sendSlack(notificacion: NotificacionEntity) {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error('SLACK_WEBHOOK_URL no configurado');
      }

      await axios.post(webhookUrl, {
        text: notificacion.titulo,
        attachments: [
          {
            text: notificacion.mensaje,
            color: 'danger',
          },
        ],
      });

      notificacion.estado = 'ENVIADA';
      await this.notificacionRepository.save(notificacion);
    } catch (error) {
      notificacion.estado = 'FALLIDA';
      // CORRECCIÓN: manejo seguro del error
      notificacion.error =
        error instanceof Error ? error.message : String(error);
      await this.notificacionRepository.save(notificacion);
    }
  }

  async sendWhatsApp(notificacion: NotificacionEntity) {
    try {
      const apiUrl = process.env.WHATSAPP_API_URL;
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

      if (!apiUrl || !accessToken) {
        throw new Error('WhatsApp API no configurada');
      }

      await axios.post(
        apiUrl,
        {
          messaging_product: 'whatsapp',
          to:
            process.env.ADMIN_PHONE ||
            process.env.WHATSAPP_PHONE_NUMBER_ID ||
            '',
          type: 'text',
          text: { body: `${notificacion.titulo}\n\n${notificacion.mensaje}` },
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      notificacion.estado = 'ENVIADA';
      await this.notificacionRepository.save(notificacion);
    } catch (error) {
      notificacion.estado = 'FALLIDA';
      // CORRECCIÓN: manejo seguro del error
      notificacion.error =
        error instanceof Error ? error.message : String(error);
      await this.notificacionRepository.save(notificacion);
    }
  }

  async createAlertaConfig(dto: CreateAlertaConfigDto) {
    const config = this.alertaConfigRepository.create(dto);
    return await this.alertaConfigRepository.save(config);
  }

  async getAlertaConfigByProducto(productoId: number) {
    return await this.alertaConfigRepository.findOne({
      where: { productoId },
    });
  }

  @Cron('*/5 * * * *') // Ejecutar cada 5 minutos
  async checkAndSendAlertas() {
    // CORRECCIÓN: incluir relación 'inventario' para acceder al stock
    const configs = await this.alertaConfigRepository.find({
      where: { activa: true },
      relations: ['producto', 'producto.inventario'],
    });

    for (const config of configs) {
      // CORRECCIÓN: verificar que exista producto e inventario
      const stock = config.producto?.inventario?.stock ?? 0;

      if (stock <= config.umbralMinimo) {
        // Notificación interna (IN_APP)
        await this.createNotificacion({
          tipo: 'IN_APP',
          titulo: `⚠️ Stock Crítico: ${config.producto.nombre}`,
          mensaje: `El producto ${config.producto.nombre} tiene stock crítico: ${stock} unidades (mínimo: ${config.umbralMinimo})`,
          metadata: { productoId: config.productoId, stockActual: stock },
          usuarioId: 1, // Admin user
        });

        // Notificaciones por canales configurados
        if (config.canales?.email) {
          await this.createNotificacion({
            tipo: 'EMAIL',
            titulo: `Alerta de Stock Crítico - ${config.producto.nombre}`,
            mensaje: `El producto ${config.producto.nombre} tiene stock crítico: ${stock} unidades (mínimo: ${config.umbralMinimo})`,
            usuarioId: 1, // Admin user
          });
        }

        if (config.canales?.slack) {
          await this.createNotificacion({
            tipo: 'SLACK',
            titulo: `🚨 Stock Crítico: ${config.producto.nombre}`,
            mensaje: `Stock actual: ${stock} | Mínimo: ${config.umbralMinimo}`,
            usuarioId: 1, // Admin user
          });
        }
      }
    }
  }

  async getNotificacionesByUsuario(usuarioId: number) {
    return await this.notificacionRepository.find({
      where: { usuarioId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async marcarComoLeida(id: number) {
    const notificacion = await this.notificacionRepository.findOne({
      where: { id },
    });
    if (notificacion) {
      notificacion.leida = true;
      const updated = await this.notificacionRepository.save(notificacion);
      this.websocketsGateway.emitNotificacion(updated);
      return updated;
    }
    return null;
  }
}
