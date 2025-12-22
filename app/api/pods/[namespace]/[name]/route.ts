import { isK8sError } from '@/lib/errors';
import { getCoreApi } from '@/lib/k8s-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ namespace: string; name: string }> },
) {
  try {
    const { namespace, name } = await params;
    const coreApi = getCoreApi();

    // Fetch the specific Pod in the given namespace
    const response = await coreApi.readNamespacedPod({
      namespace,
      name,
    });
    const pod = response;

    return NextResponse.json({ pod: pod });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ namespace: string; name: string }> },
) {
  try {
    const { namespace, name } = await params;
    const coreApi = getCoreApi();

    await coreApi.deleteNamespacedPod({
      name,
      namespace,
    });

    return NextResponse.json({ message: `Pod ${name} deleted` });
  } catch (error: unknown) {
    if (isK8sError(error)) {
      if (error.response.statusCode === 404) {
        // If the pod is already deleted, consider it a success
        return NextResponse.json({ message: `Pod ${name} not found, considered deleted` });
      }
      return NextResponse.json(
        { error: error.body.message || 'K8s API Error' },
        { status: error.response.statusCode },
      );
    }
    return NextResponse.json({ error: 'Failed to delete pod' }, { status: 500 });
  }
}
