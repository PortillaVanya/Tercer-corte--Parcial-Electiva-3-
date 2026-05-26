import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductosService } from './productos/productos.service';
import { ProductosModule } from './productos/productos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { InventarioModule } from './inventario/inventario.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CategoriaModule } from './categoria/categoria.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from './productos/entities/producto.entity';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { RolModule } from './modules/rol/rol.module';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './usuarios/entities/usuario.entity';
import { RoleEntity } from './modules/rol/entities/role.entitity';
import { SeedService } from './seed.service';
import { CategoriaEntity } from './categoria/entities/categoria.entity';
import { InventarioEntity } from './inventario/entities/inventario.entity';
import { InventarioLogEntity } from './inventario/entities/inventario-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductoEntity,
      UserEntity,
      RoleEntity,
      CategoriaEntity,
      InventarioEntity,
      InventarioLogEntity,
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),
    ProductosModule,
    UsuariosModule,
    InventarioModule,
    DatabaseModule,
    CategoriaModule,
    UsuarioModule,
    RolModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ProductosService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
