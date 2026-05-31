import { Module } from '@nestjs/common';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { RoleEntity } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolSemillaService } from './rol-semilla.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  providers: [RolService, RolSemillaService],
  controllers: [RolController],
  exports: [TypeOrmModule],
})
export class RolModule {}
