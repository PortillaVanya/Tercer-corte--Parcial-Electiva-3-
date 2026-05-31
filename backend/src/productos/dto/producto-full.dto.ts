import { ApiProperty } from '@nestjs/swagger';
import { CategoriaEntity } from 'src/categoria/entities/categoria.entity';
import { InventarioEntity } from 'src/inventario/entities/inventario.entity';

export class ProductoDetalleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ type: Number })
  precio: number;

  @ApiProperty({ required: false })
  imagen?: string;

  @ApiProperty({ required: false, type: () => CategoriaEntity })
  categoria?: CategoriaEntity;

  @ApiProperty({ required: false, type: () => InventarioEntity })
  inventario?: InventarioEntity;

  @ApiProperty({
    description: 'Valor total en inventario calculado como precio x stock',
  })
  valorTotalInventario: number;

  @ApiProperty({ description: 'Si el producto tiene stock disponible' })
  tieneStock: boolean;

  @ApiProperty({
    description: 'Etatdo del nivel de stock: AGOTADO, BAJO, NORMAL',
  })
  estadoStock: string;
}

export class ProductoFullResponseDto {
  @ApiProperty({ description: 'Total de productos consultados' })
  totalProductos: number;

  @ApiProperty({ description: 'Suma del stock de todos los productos' })
  totalStock: number;

  @ApiProperty({ description: 'Suma del valor total de inventario' })
  totalValorInventario: number;

  @ApiProperty({ type: [ProductoDetalleDto] })
  productos: ProductoDetalleDto[];
}
