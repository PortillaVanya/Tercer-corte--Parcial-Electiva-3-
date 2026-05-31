import {
  IsInt,
  IsDateString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrdenCompraDetalleDto {
  @IsInt()
  productoId: number;

  @IsInt()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;
}

export class CreateOrdenCompraDto {
  @IsDateString()
  fechaOrden: string;

  @IsDateString()
  @IsOptional()
  fechaEntregaEsperada?: string;

  @IsInt()
  proveedorId: number;

  @IsEnum(['PENDIENTE', 'ENVIADO', 'RECIBIDO', 'CANCELADO'])
  @IsOptional()
  estado?: 'PENDIENTE' | 'ENVIADO' | 'RECIBIDO' | 'CANCELADO';

  @IsOptional()
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrdenCompraDetalleDto)
  detalles: OrdenCompraDetalleDto[];
}
