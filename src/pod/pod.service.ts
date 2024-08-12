import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Pod } from './entities/pod.entity';
import * as k8s from '@kubernetes/client-node';
import { KubernetesService } from '../kubernetes/kubernetes.service';

@Injectable()
export class PodService {
  constructor(
    @InjectRepository(Pod)
    private podRepository: Repository<Pod>,
    private kubernetesService: KubernetesService,
  ) {}

  async findAllPodsInK8s(): Promise<Pod[]> {
    const pods = await this.kubernetesService.listPods();

    await this.syncPodsWithDB(pods);

    return await this.podRepository.find({
      where: { name: In(pods.map((pod) => pod.metadata.name)) },
      select: ['name', 'status'],
    });
  }

  async findOnePodInK8s(name: string): Promise<Pod> {
    const pod = await this.kubernetesService.getPod(name);

    await this.syncPodsWithDB([pod]);

    return await this.podRepository.findOne({ where: { name } });
  }

  async createPodInK8s(name: string, spec: k8s.V1PodSpec): Promise<Pod> {
    const podManifest = {
      metadata: {
        name,
      },
      spec,
    };

    const pod = await this.kubernetesService.createPod(podManifest);

    await this.savePodsToDatabase([pod]);

    return await this.podRepository.findOne({ where: { name } });
  }

  async deletePodInK8s(name: string): Promise<void> {
    const deletedPod = await this.kubernetesService.deletePod(name);
    await this.podRepository.delete({ name });
    return deletedPod;
  }

  async savePodsToDatabase(pods: k8s.V1Pod[]): Promise<Pod[]> {
    const newPods = pods.map((pod) => {
      return this.podRepository.create({
        name: pod.metadata.name,
        namespace: pod.metadata.namespace,
        status: pod.status.phase,
        resourceVersion: pod.metadata.resourceVersion,
        uid: pod.metadata.uid,
      });
    });
    await this.podRepository.upsert(newPods, ['name']);
    return newPods;
  }

  async syncPodsWithDB(pods: k8s.V1Pod[]) {
    await this.podRepository.delete({
      name: Not(In(pods.map((pod) => pod.metadata.name))),
    });
    return await this.savePodsToDatabase(pods);
  }
}
