import { IsInt, IsBoolean, IsOptional, IsObject, Min } from 'class-validator';

export class CreateAlertaConfigDto {
  @IsInt()
  @Min(0)
  umbralMinimo: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  umbralMaximo?: number;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;

  @IsObject()
  @IsOptional()
  canales?: {
    email?: boolean;
    slack?: boolean;
    whatsapp?: boolean;
    inApp?: boolean;
  };

  @IsInt()
  productoId: number;
}
