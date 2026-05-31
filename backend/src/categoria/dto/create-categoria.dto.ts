import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoriaDto {
  @IsString({
    message: 'El nombre de la categoría debe ser una cadena de texto',
  })
  @Length(3, 50, {
    message: 'El nombre de la categoría debe tener entre 3 y 50 caracteres',
  })
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  nombre: string;
}
