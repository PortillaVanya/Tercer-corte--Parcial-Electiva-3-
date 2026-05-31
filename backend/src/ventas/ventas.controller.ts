import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateVentaDto } from './dto/create-venta.dto';

@ApiTags('ventas')
@Controller('ventas')
@UseGuards(JwtAuthGuard)
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @ApiOperation({ summary: 'Crear venta' })
  @Post()
  async createVenta(@Body() dto: CreateVentaDto) {
    return await this.ventasService.createVenta(dto);
  }

  @ApiOperation({ summary: 'Obtener todas las ventas' })
  @Get()
  async findAllVentas() {
    return await this.ventasService.findAllVentas();
  }

  @ApiOperation({ summary: 'Obtener venta por ID' })
  @Get(':id')
  async findOneVenta(@Param('id') id: string) {
    return await this.ventasService.findOneVenta(+id);
  }

  @ApiOperation({ summary: 'Cancelar venta' })
  @Patch(':id/cancelar')
  async cancelarVenta(@Param('id') id: string) {
    return await this.ventasService.cancelarVenta(+id);
  }

  @ApiOperation({ summary: 'Obtener estadísticas de ventas' })
  @Get('estadisticas')
  async getEstadisticasVentas(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return await this.ventasService.getEstadisticasVentas(
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
    );
  }
}
