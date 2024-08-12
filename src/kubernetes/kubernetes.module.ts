import { Module } from '@nestjs/common';
import { KubernetesService } from './kubernetes.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [KubernetesService],
  exports: [KubernetesService],
})
export class KubernetesModule {}
