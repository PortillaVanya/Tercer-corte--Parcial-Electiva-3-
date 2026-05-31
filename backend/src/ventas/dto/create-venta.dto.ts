import {
  IsInt,
  IsDateString,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class VentaDetalleDto {
  @IsInt()
  productoId: number;

  @IsInt()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;

  @IsNumber()
  @IsOptional()
  descuento?: number;
}

export class CreateVentaDto {
  @IsDateString()
  fechaVenta: string;

  @IsInt()
  vendedorId: number;

  @IsEnum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CREDITO'])
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO';

  @IsNumber()
  @IsOptional()
  descuentoGlobal?: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VentaDetalleDto)
  detalles: VentaDetalleDto[];
}
