import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { CreateAlertaConfigDto } from './dto/create-alerta-config.dto';

@ApiTags('notificaciones')
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @ApiOperation({ summary: 'Crear una notificación (sin auth para pruebas)' })
  @Post('test')
  async createTest(@Body() dto: CreateNotificacionDto) {
    return await this.notificacionesService.createNotificacion(dto);
  }

  @ApiOperation({ summary: 'Crear una notificación' })
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateNotificacionDto) {
    return await this.notificacionesService.createNotificacion(dto);
  }

  @ApiOperation({ summary: 'Obtener notificaciones del usuario' })
  @Get('usuario/:usuarioId')
  async getByUsuario(@Param('usuarioId') usuarioId: string) {
    return await this.notificacionesService.getNotificacionesByUsuario(
      +usuarioId,
    );
  }

  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @Patch(':id/leer')
  async marcarComoLeida(@Param('id') id: string) {
    return await this.notificacionesService.marcarComoLeida(+id);
  }

  @ApiOperation({ summary: 'Crear configuración de alerta' })
  @Post('alertas')
  @UseGuards(JwtAuthGuard)
  async createAlertaConfig(@Body() dto: CreateAlertaConfigDto) {
    return await this.notificacionesService.createAlertaConfig(dto);
  }

  @ApiOperation({ summary: 'Obtener configuración de alerta por producto' })
  @Get('alertas/producto/:productoId')
  async getAlertaConfig(@Param('productoId') productoId: string) {
    return await this.notificacionesService.getAlertaConfigByProducto(
      +productoId,
    );
  }

  @ApiOperation({ summary: 'Verificar y enviar alertas automáticas' })
  @Post('alertas/check')
  async checkAlertas() {
    return await this.notificacionesService.checkAndSendAlertas();
  }
}
