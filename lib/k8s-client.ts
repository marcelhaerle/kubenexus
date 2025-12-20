import * as k8s from '@kubernetes/client-node';

let kc: k8s.KubeConfig | null = null;

export function getKubeConfig(): k8s.KubeConfig {
  if (kc) return kc;

  kc = new k8s.KubeConfig();

  try {
    // This handles both local ~/.kube/config AND In-Cluster ServiceAccounts automatically
    kc.loadFromDefault();
  } catch (error) {
    console.error('Failed to load Kubernetes configuration:', error);
  }

  return kc;
}

// Helper to get specific API clients
export const getCoreApi = () => getKubeConfig().makeApiClient(k8s.CoreV1Api);
export const getAppsApi = () => getKubeConfig().makeApiClient(k8s.AppsV1Api);
