import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  IsEmail,
} from 'class-validator';

export class CreateNotificacionDto {
  @IsEnum(['EMAIL', 'SLACK', 'WHATSAPP', 'IN_APP'])
  @IsNotEmpty()
  tipo: 'EMAIL' | 'SLACK' | 'WHATSAPP' | 'IN_APP';

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @IsEmail()
  @IsOptional()
  destinatarioEmail?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  usuarioId?: number;
}
