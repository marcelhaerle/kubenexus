import { NextRequest, NextResponse } from 'next/server';
import { getCoreApi } from '@/lib/k8s-client';
import { isK8sError } from '@/lib/errors';
import { PodSummary } from '@/types/k8s';
import { formatDateISO } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get('namespace');
    const coreApi = getCoreApi();

    // Safety: If a namespace is provided, only fetch that context
    const response = namespace
      ? await coreApi.listNamespacedPod({ namespace })
      : await coreApi.listPodForAllNamespaces();

    // Data Projection: Map only what the UI needs to reduce payload size
    const pods: PodSummary[] = response.items.map((pod) => {
      // FIX: Check if deletionTimestamp is set
      const isTerminating = !!pod.metadata?.deletionTimestamp;

      return {
        uid: pod.metadata?.uid || '',
        name: pod.metadata?.name || '',
        namespace: pod.metadata?.namespace || '',
        // FIX: Override status if terminating
        status: isTerminating ? 'Terminating' : pod.status?.phase || 'Unknown',
        node: pod.spec?.nodeName || '',
        // Calculate restart count from all containers
        restarts: (pod.status?.containerStatuses || []).reduce(
          (acc, curr) => acc + curr.restartCount,
          0,
        ),
        creationTimestamp: formatDateISO(pod.metadata?.creationTimestamp || ''),
      };
    });

    return NextResponse.json({ pods: pods });
  } catch (error: unknown) {
    if (isK8sError(error)) {
      return NextResponse.json(
        { error: error.body.message || 'K8s API Error' },
        { status: error.response.statusCode },
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
