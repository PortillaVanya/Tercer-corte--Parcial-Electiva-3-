import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('productos')
@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @ApiOperation({ summary: 'Obtener métricas de salud del inventario' })
  @Get('health')
  async getHealthMetrics() {
    return await this.productosService.getHealthMetrics();
  }

  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiOkResponse({ type: Object })
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productosService.create(createProductDto);
  }

  @Get('pagination')
  async findWithPagination(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.productosService.findWithPagination(+page, +limit);
  }

  @Get('search')
  async searchByName(@Query('name') name: string) {
    return await this.productosService.searchByName(name);
  }

  @ApiOperation({ summary: 'Actualizar un producto' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: Partial<CreateProductDto>,
  ) {
    return await this.productosService.update(id, updateProductDto);
  }

  @ApiOperation({ summary: 'Eliminar un producto' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productosService.remove(id);
  }
}
