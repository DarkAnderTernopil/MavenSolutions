import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PodService } from './pod.service';
import { CreatePodDto } from './dto/createPod.dto';
import { Pod } from './entities/pod.entity';

@Controller('pods')
export class PodController {
  constructor(private readonly podService: PodService) {}

  @Get()
  async findAllPodsInK8s(): Promise<Pod[]> {
    return await this.podService.findAllPodsInK8s();
  }

  @Get(':name')
  async findOnePodInK8s(@Param('name') name: string): Promise<Pod> {
    return this.podService.findOnePodInK8s(name);
  }

  @Post()
  async createPodInK8s(
    @Body()
    createPodDto: CreatePodDto,
  ): Promise<Pod> {
    return await this.podService.createPodInK8s(
      createPodDto.name,
      createPodDto.spec,
    );
  }

  @Delete(':name')
  async deletePodInK8s(@Param('name') name: string): Promise<void> {
    await this.podService.deletePodInK8s(name);
  }
}
