import { NextRequest, NextResponse } from 'next/server';
import { getCoreApi } from '@/lib/k8s-client';
import { isK8sError } from '@/lib/errors';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const k8sApi = getCoreApi();

    // Fetch the namespace metadata
    const response = await k8sApi.readNamespace({
      name,
    });

    return NextResponse.json({
      metadata: response.metadata,
      status: response.status,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch namespace' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  try {
    const k8sApi = getCoreApi();

    await k8sApi.deleteNamespace({
      name,
    });

    return NextResponse.json({ message: `Namespace ${name} deleted successfully` });
  } catch (error) {
    if (isK8sError(error)) {
      const statusCode = error.response.statusCode;
      if (statusCode === 404) {
        return NextResponse.json({ error: 'Namespace not found' }, { status: 404 });
      } else {
        return NextResponse.json({ error: 'Failed to delete namespace' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Failed to delete namespace' }, { status: 500 });
    }
  }
}
