import { Module } from '@nestjs/common';
import { PodService } from './pod.service';
import { PodController } from './pod.controller';
import { KubernetesModule } from '../kubernetes/kubernetes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pod } from './entities/pod.entity';

@Module({
  imports: [KubernetesModule, TypeOrmModule.forFeature([Pod])],
  providers: [PodService],
  controllers: [PodController],
})
export class PodModule {}
