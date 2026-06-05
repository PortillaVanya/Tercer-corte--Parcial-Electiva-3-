import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE') || 'sqlite';

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USER'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
            autoLoadEntities: true,
            synchronize: configService.get<string>('NODE_ENV') !== 'production',
            logging: configService.get<string>('NODE_ENV') !== 'production',
          };
        }

        // Default to SQLite
        return {
          type: 'sqlite',
          database: 'tienda_virtual.db',
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
