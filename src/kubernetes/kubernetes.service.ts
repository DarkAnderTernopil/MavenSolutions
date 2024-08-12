import { Injectable, Logger } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import {
  DescribeClusterCommand,
  DescribeClusterResponse,
  EKSClient,
} from '@aws-sdk/client-eks';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KubernetesService {
  private readonly logger = new Logger(KubernetesService.name);
  private NAMESPACE = this.config.get<string>('CLUSTER_NAMESPACE');

  private k8sApi: k8s.CoreV1Api;

  constructor(private config: ConfigService) {}
  async onModuleInit() {
    await this.connectToCluster(
      this.config.get<string>('CLUSTER_NAME'),
      this.config.get<string>('CLUSTER_REGION'),
    );
  }
  async connectToCluster(clusterName: string, region: string) {
    this.logger.log(
      `Connecting to EKS cluster: ${clusterName} in region: ${region}`,
    );

    const eks = new EKSClient({
      region,
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    const command = new DescribeClusterCommand({
      name: clusterName,
    });

    const response = (await eks.send(command)) as DescribeClusterResponse;

    if (!response.cluster) {
      throw new Error(`Cluster ${clusterName} not found`);
    }

    const cluster = response.cluster;

    const kc = new k8s.KubeConfig();
    kc.loadFromOptions({
      clusters: [
        {
          name: clusterName,
          server: cluster.endpoint,
          caData: cluster.certificateAuthority?.data,
        },
      ],
      users: [
        {
          name: 'aws',
          exec: {
            apiVersion: 'client.authentication.k8s.io/v1alpha1',
            command: 'aws',
            args: [
              'eks',
              'get-token',
              '--cluster-name',
              clusterName,
              '--region',
              region,
            ],
          },
        },
      ],
      contexts: [
        {
          name: clusterName,
          user: 'aws',
          cluster: clusterName,
        },
      ],
      currentContext: clusterName,
    });

    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    this.logger.log('Connected to EKS cluster successfully');
  }

  async listPods() {
    if (!this.k8sApi) {
      throw new Error('Kubernetes API client is not initialized');
    }
    const res = await this.k8sApi.listNamespacedPod(this.NAMESPACE);

    return res.body.items;
  }

  async getPod(podName: string) {
    if (!this.k8sApi) {
      throw new Error('Kubernetes API client is not initialized');
    }

    const res = await this.k8sApi.readNamespacedPod(podName, this.NAMESPACE);
    return res.body;
  }

  async createPod(podManifest: k8s.V1Pod) {
    if (!this.k8sApi) {
      throw new Error('Kubernetes API client is not initialized');
    }

    const res = await this.k8sApi.createNamespacedPod(
      this.NAMESPACE,
      podManifest,
    );
    return res.body;
  }

  async deletePod(podName: string) {
    if (!this.k8sApi) {
      throw new Error('Kubernetes API client is not initialized');
    }

    await this.k8sApi.deleteNamespacedPod(podName, this.NAMESPACE);
  }
}
