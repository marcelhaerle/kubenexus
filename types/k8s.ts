export interface NamespaceSummary {
  uid: string;
  name: string;
  phase: string;
  age: string;
}

export interface PodSummary {
  uid: string;
  name: string;
  namespace: string;
  status: string;
  restarts: number;
  node: string;
  creationTimestamp: string;
}

export interface Pod {
  apiVersion?: string;
  kind?: string;
  metadata: {
    uid?: string;
    name?: string;
    namespace?: string;
    generateName?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    resourceVersion?: string;
    creationTimestamp?: string;
    deletionTimestamp?: string | null;
    ownerReferences?: Array<{
      apiVersion?: string;
      kind?: string;
      name?: string;
      uid?: string;
      controller?: boolean;
      blockOwnerDeletion?: boolean;
    }>;
  };
  spec?: {
    nodeName?: string;
    restartPolicy?: 'Always' | 'OnFailure' | 'Never' | string;
    serviceAccountName?: string;
    dnsPolicy?: string;
    hostNetwork?: boolean;
    containers: Array<{
      name: string;
      image: string;
      command?: string[];
      args?: string[];
      imagePullPolicy?: string;
      ports?: Array<{
        name?: string;
        containerPort: number;
        hostPort?: number;
        protocol?: 'TCP' | 'UDP' | string;
      }>;
      env?: Array<{ name: string; value?: string; valueFrom?: unknown }>;
      resources?: {
        limits?: Record<string, string>;
        requests?: Record<string, string>;
      };
      volumeMounts?: Array<{
        name: string;
        mountPath: string;
        readOnly?: boolean;
        subPath?: string;
      }>;
    }>;
    initContainers?: Array<Record<string, unknown>>;
    volumes?: Array<Record<string, unknown>>;
    tolerations?: Array<Record<string, unknown>>;
    affinity?: Record<string, unknown>;
    securityContext?: Record<string, unknown>;
    imagePullSecrets?: Array<{ name?: string }>;
  };
  status?: {
    phase?: string;
    conditions?: Array<{
      type: string;
      status: string;
      lastProbeTime?: string | null;
      lastTransitionTime?: string | null;
      reason?: string;
      message?: string;
    }>;
    hostIP?: string;
    podIP?: string;
    podIPs?: Array<{ ip: string }>;
    startTime?: string;
    containerStatuses?: Array<{
      name: string;
      state: {
        waiting?: { reason?: string; message?: string };
        running?: { startedAt?: string };
        terminated?: {
          exitCode?: number;
          reason?: string;
          message?: string;
          startedAt?: string;
          finishedAt?: string;
          containerID?: string;
          signal?: number;
        };
      };
      lastState?: Record<string, unknown>;
      ready?: boolean;
      restartCount?: number;
      image?: string;
      imageID?: string;
      containerID?: string;
    }>;
    initContainerStatuses?: Array<Record<string, unknown>>;
    qosClass?: string;
    reason?: string;
    message?: string;
  };
}
