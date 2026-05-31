import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RoleEnum } from 'src/common/enums/role.enum';

@Injectable()
export class RolSemillaService implements OnModuleInit {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async onModuleInit() {
    // Verificar si ya existen roles en la base de datos
    const count = await this.roleRepository.count();
    // Si ya existen roles, no hacer nada
    if (count > 0) return;
    // Si no existen roles, crear los roles por defecto
    await this.roleRepository.save([
      { name: RoleEnum.ADMIN },
      { name: RoleEnum.USER },
    ]);
  }
}
