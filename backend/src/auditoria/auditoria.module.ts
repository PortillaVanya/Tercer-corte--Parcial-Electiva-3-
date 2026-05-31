import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaLogEntity } from './entities/auditoria-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaLogEntity])],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
