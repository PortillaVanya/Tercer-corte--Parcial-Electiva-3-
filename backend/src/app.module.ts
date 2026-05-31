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
import { RoleEntity } from './modules/rol/entities/role.entity';
import { SeedService } from './seed.service';
import { CategoriaEntity } from './categoria/entities/categoria.entity';
import { InventarioEntity } from './inventario/entities/inventario.entity';
import { InventarioLogEntity } from './inventario/entities/inventario-log.entity';
import { BackupModule } from './backup/backup.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { NotificacionEntity } from './notificaciones/entities/notificacion.entity';
import { AlertaConfigEntity } from './notificaciones/entities/alerta-config.entity';
import { ReportesModule } from './reportes/reportes.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ProveedorEntity } from './proveedores/entities/proveedor.entity';
import { OrdenCompraEntity } from './proveedores/entities/orden-compra.entity';
import { OrdenCompraDetalleEntity } from './proveedores/entities/orden-compra-detalle.entity';
import { VentasModule } from './ventas/ventas.module';
import { VentaEntity } from './ventas/entities/venta.entity';
import { VentaDetalleEntity } from './ventas/entities/venta-detalle.entity';
import { RedisCacheModule } from './common/cache/cache.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { MlModule } from './ml/ml.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductoEntity,
      UserEntity,
      RoleEntity,
      CategoriaEntity,
      InventarioEntity,
      InventarioLogEntity,
      NotificacionEntity,
      AlertaConfigEntity,
      VentaEntity,
      VentaDetalleEntity,
      ProveedorEntity,
      OrdenCompraEntity,
      OrdenCompraDetalleEntity,
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ProductosModule,
    UsuariosModule,
    InventarioModule,
    DatabaseModule,
    CategoriaModule,
    UsuarioModule,
    RolModule,
    VentasModule,
    AuthModule,
    BackupModule,
    ReportesModule,
    NotificacionesModule,
    ProveedoresModule,
    RedisCacheModule,
    MlModule,
    WebsocketsModule,
    AuditoriaModule,
    QueuesModule,
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
