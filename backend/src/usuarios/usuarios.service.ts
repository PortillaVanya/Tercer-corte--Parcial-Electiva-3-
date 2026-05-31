import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { RoleEntity } from 'src/modules/rol/entities/role.entity';
import { RoleEnum } from 'src/common/enums/role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({ relations: ['role'] });
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  // Encontrar un usuario por email, sin incluir la contraseña
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .getOne();
  }

  private async findByEmailWithPassword(
    email: string,
  ): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
    roleName: RoleEnum;
  }): Promise<UserEntity> {
    const exists = await this.userRepository.exists({
      where: [{ email: data.email }, { username: data.username }],
    });

    if (exists) {
      throw new ConflictException(`El email o username ya están en uso`);
    }
    const role = await this.roleRepository.findOne({
      where: { name: data.roleName },
    });
    if (!role) {
      throw new NotFoundException(
        `Rol con nombre ${data.roleName} no encontrado`,
      );
    }
    const user = this.userRepository.create({
      username: data.username,
      email: data.email,
      password: data.passwordHash,
      roleId: role.id,
      role,
    });

    return this.userRepository.save(user);
  }

  async validateCredentials(
    email: string,
    passwordHash: string,
  ): Promise<UserEntity> {
    const user = await this.findByEmailWithPassword(email);
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    const ok = await bcrypt.compare(passwordHash, user.password);
    if (!ok) {
      throw new NotFoundException(`Contraseña incorrecta`);
    }
    return user;
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.userRepository.update(userId, {
      password: newPasswordHash,
    });
  }
}
