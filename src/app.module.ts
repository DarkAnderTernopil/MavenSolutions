import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodModule } from './pod/pod.module';
import { KubernetesModule } from './kubernetes/kubernetes.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

const config = new ConfigService();

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.get<string>('DATABASE_HOST'),
      port: config.get<number>('DATABASE_PORT'),
      username: config.get<string>('DATABASE_USER'),
      password: config.get<string>('DATABASE_PASSWORD'),
      database: config.get<string>('DATABASE_NAME'),
      autoLoadEntities: true,
      synchronize: true, // use only in development
    }),
    PodModule,
    KubernetesModule,
  ],
})
export class AppModule {}
