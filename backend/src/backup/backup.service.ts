import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { CategoriaEntity } from '../categoria/entities/categoria.entity';
import { InventarioEntity } from '../inventario/entities/inventario.entity';
import { InventarioLogEntity } from '../inventario/entities/inventario-log.entity';
import { UserEntity } from '../usuarios/entities/usuario.entity';
import { RoleEntity } from '../modules/rol/entities/role.entity';

export interface BackupData {
  roles: RoleEntity[];
  usuarios: Partial<UserEntity>[];
  categorias: CategoriaEntity[];
  productos: ProductoEntity[];
  inventario: InventarioEntity[];
  inventarioLogs: InventarioLogEntity[];
}

export interface Backup {
  timestamp: string;
  version: string;
  data: BackupData;
}

@Injectable()
export class BackupService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly productoRepository: Repository<ProductoEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoriaRepository: Repository<CategoriaEntity>,
    @InjectRepository(InventarioEntity)
    private readonly inventarioRepository: Repository<InventarioEntity>,
    @InjectRepository(InventarioLogEntity)
    private readonly inventarioLogRepository: Repository<InventarioLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async createBackup() {
    const [productos, categorias, inventario, inventarioLogs, usuarios, roles] =
      await Promise.all([
        this.productoRepository.find(),
        this.categoriaRepository.find(),
        this.inventarioRepository.find(),
        this.inventarioLogRepository.find(),
        this.userRepository.find({ relations: ['role'] }),
        this.roleRepository.find(),
      ]);

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        roles,
        usuarios: usuarios.map((u) => ({
          ...u,
          password: undefined, // No incluir contraseñas en el backup
        })),
        categorias,
        productos,
        inventario,
        inventarioLogs,
      },
    };

    return backup;
  }

  async restoreBackup(backup: Backup) {
    const { data } = backup;

    // Restaurar roles
    if (data.roles && data.roles.length > 0) {
      await this.roleRepository.save(data.roles);
    }

    // Restaurar usuarios (sin contraseñas)
    if (data.usuarios && data.usuarios.length > 0) {
      for (const usuario of data.usuarios) {
        if (usuario.password) {
          delete usuario.password;
        }
      }
      await this.userRepository.save(data.usuarios);
    }

    // Restaurar categorías
    if (data.categorias && data.categorias.length > 0) {
      await this.categoriaRepository.save(data.categorias);
    }

    // Restaurar productos
    if (data.productos && data.productos.length > 0) {
      await this.productoRepository.save(data.productos);
    }

    // Restaurar inventario
    if (data.inventario && data.inventario.length > 0) {
      await this.inventarioRepository.save(data.inventario);
    }

    // Restaurar logs de inventario
    if (data.inventarioLogs && data.inventarioLogs.length > 0) {
      await this.inventarioLogRepository.save(data.inventarioLogs);
    }

    return { message: 'Backup restaurado exitosamente' };
  }

  async exportBackupAsJSON() {
    const backup = await this.createBackup();
    return JSON.stringify(backup, null, 2);
  }
}
