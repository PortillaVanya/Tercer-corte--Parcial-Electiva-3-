import { Controller, Get, UseGuards } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('inventario')
@Controller('inventario')
@UseGuards(JwtAuthGuard)
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @ApiOperation({ summary: 'Obtener logs de movimientos de inventario' })
  @Get('logs')
  async getLogs() {
    return await this.inventarioService.getLogs();
  }
}
