import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Guitarra' })
  @IsString({ message: 'El nombre del producto debe ser una cadena de texto' })
  @Length(3, 50, {
    message: 'El nombre del producto debe tener entre 3 y 50 caracteres',
  })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  nombre: string;

  @ApiProperty({ description: 'Precio del producto', example: 1499.99 })
  @IsNumber({}, { message: 'El precio del producto debe ser un número' })
  @IsPositive({ message: 'El precio del producto debe ser un número positivo' })
  @IsNotEmpty({ message: 'El precio del producto es obligatorio' })
  precio: number;

  @ApiPropertyOptional({
    description: 'URL de la imagen del producto',
    example: 'https://images.com/product.jpg',
  })
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una URL válida' })
  imagen?: string;

  //Llave foranea relacionar con categoria, es opcional porque un producto puede no tener categoria
  @ApiPropertyOptional({
    description: 'Id de la categoría asociada',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El id de la categoría debe ser un número' })
  @IsPositive({ message: 'El id de la categoría debe ser un número positivo' })
  categoriaId?: number;

  @ApiProperty({ description: 'Stock inicial del producto', example: 10 })
  @IsOptional()
  @IsNumber({}, { message: 'El stock debe ser un número' })
  stock?: number;
}
