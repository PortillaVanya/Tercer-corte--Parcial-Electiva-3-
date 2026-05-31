import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';

@ApiTags('proveedores')
@Controller('proveedores')
@UseGuards(JwtAuthGuard)
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @ApiOperation({ summary: 'Crear proveedor' })
  @Post()
  async createProveedor(@Body() dto: CreateProveedorDto) {
    return await this.proveedoresService.createProveedor(dto);
  }

  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  @Get()
  async findAllProveedores() {
    return await this.proveedoresService.findAllProveedores();
  }

  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  @Get(':id')
  async findOneProveedor(@Param('id') id: string) {
    return await this.proveedoresService.findOneProveedor(+id);
  }

  @ApiOperation({ summary: 'Actualizar proveedor' })
  @Patch(':id')
  async updateProveedor(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProveedorDto>,
  ) {
    return await this.proveedoresService.updateProveedor(+id, dto);
  }

  @ApiOperation({ summary: 'Eliminar proveedor' })
  @Delete(':id')
  async removeProveedor(@Param('id') id: string) {
    return await this.proveedoresService.removeProveedor(+id);
  }

  @ApiOperation({ summary: 'Crear orden de compra' })
  @Post('ordenes')
  async createOrdenCompra(@Body() dto: CreateOrdenCompraDto) {
    return await this.proveedoresService.createOrdenCompra(dto);
  }

  @ApiOperation({ summary: 'Obtener todas las órdenes de compra' })
  @Get('ordenes/lista')
  async findAllOrdenesCompra() {
    return await this.proveedoresService.findAllOrdenesCompra();
  }

  @ApiOperation({ summary: 'Obtener orden de compra por ID' })
  @Get('ordenes/:id')
  async findOneOrdenCompra(@Param('id') id: string) {
    return await this.proveedoresService.findOneOrdenCompra(+id);
  }

  @ApiOperation({ summary: 'Recibir orden de compra (actualizar stock)' })
  @Patch('ordenes/:id/recibir')
  async recibirOrdenCompra(@Param('id') id: string) {
    return await this.proveedoresService.recibirOrdenCompra(+id);
  }

  @ApiOperation({ summary: 'Actualizar estado de orden de compra' })
  @Patch('ordenes/:id/estado')
  async updateOrdenCompraEstado(
    @Param('id') id: string,
    @Body('estado') estado: 'PENDIENTE' | 'ENVIADO' | 'RECIBIDO' | 'CANCELADO',
  ) {
    return await this.proveedoresService.updateOrdenCompraEstado(+id, estado);
  }

  @ApiOperation({ summary: 'Actualizar orden de compra' })
  @Patch('ordenes/:id')
  async updateOrdenCompra(
    @Param('id') id: string,
    @Body() dto: CreateOrdenCompraDto,
  ) {
    return await this.proveedoresService.updateOrdenCompra(+id, dto);
  }

  @ApiOperation({ summary: 'Eliminar orden de compra' })
  @Delete('ordenes/:id')
  async deleteOrdenCompra(@Param('id') id: string) {
    return await this.proveedoresService.deleteOrdenCompra(+id);
  }

  @ApiOperation({ summary: 'Obtener historial de precios por proveedor' })
  @Get(':proveedorId/historial-precios')
  async getHistorialPrecios(@Param('proveedorId') proveedorId: string) {
    return await this.proveedoresService.getHistorialPreciosPorProveedor(
      +proveedorId,
    );
  }
}
