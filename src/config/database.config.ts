import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class DatabaseConfigFactory {
  static createTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: configService.get('POSTGRES_HOST', 'localhost'),
      port: configService.get('POSTGRES_PORT', 5432),
      database: configService.get('POSTGRES_DB', 'we_study'),
      username: configService.get('POSTGRES_USER', 'postgres'),
      password: configService.get('POSTGRES_PASSWORD'),
      autoLoadEntities: true,
      synchronize: configService.get('NODE_ENV') !== 'production',
      ssl: configService.get('NODE_ENV') === 'production',
      extra: {
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      },
    };
  }
}
