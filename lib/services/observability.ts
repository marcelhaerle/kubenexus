import { log, getCoreApi } from '@/lib/k8s-client';
import { PassThrough } from 'stream';

export async function getPodLogStream(
  namespace: string,
  podName: string,
  containerName: string | undefined,
): Promise<ReadableStream> {
  // We use a PassThrough stream as a "pipe"
  const logStream = new PassThrough();

  const coreApi = getCoreApi();

  try {
    if (!containerName) {
      // Fetch pod details to get the first container name
      const podResp = await coreApi.readNamespacedPod({
        name: podName,
        namespace: namespace,
      });
      const containers = podResp.spec?.containers;
      if (!containers || containers.length === 0) {
        throw new Error('No containers found in pod');
      }
      containerName = containers[0].name;
    }

    // The Kubernetes library has a special 'log' class for streaming
    // log.log(...) returns a request object that we can abort
    const req = await log.log(namespace, podName, containerName, logStream, {
      follow: true,
      tailLines: 50,
      timestamps: true,
      pretty: false,
    });

    // If client closes connection, we must also abort the K8s connection to avoid resource leaks
    logStream.on('close', () => {
      console.log(`Log stream closed by client for ${podName}`);
      req.abort();
    });

    logStream.on('error', (err) => {
      console.error(`Log stream error for ${podName}:`, err);
      req.abort();
    });

    return new ReadableStream({
      start(controller) {
        logStream.on('data', (chunk) => controller.enqueue(chunk));
        logStream.on('end', () => controller.close());
        logStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        req.abort();
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Failed to init log stream:', error);
    throw new Error(`Could not stream logs: ${message}`);
  }
}
