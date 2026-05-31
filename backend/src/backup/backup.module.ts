import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { CategoriaEntity } from '../categoria/entities/categoria.entity';
import { InventarioEntity } from '../inventario/entities/inventario.entity';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import { UserEntity } from '../usuarios/entities/usuario.entity';
import { RoleEntity } from '../modules/rol/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductoEntity,
      CategoriaEntity,
      InventarioEntity,
      InventarioLogEntity,
      UserEntity,
      RoleEntity,
    ]),
  ],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}
