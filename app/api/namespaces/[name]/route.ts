import { NextRequest, NextResponse } from 'next/server';
import { getCoreApi } from '@/lib/k8s-client';

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

    const allNamespaces = await k8sApi.listNamespace();
    const namespace = allNamespaces.items.find((ns) => ns.metadata?.name === name);

    if (!namespace) {
      return NextResponse.json({ error: 'Namespace not found' }, { status: 404 });
    }

    await k8sApi.deleteNamespace({
      name,
    });

    return NextResponse.json({ message: `Namespace ${name} deleted successfully` });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete namespace' },
      { status: 500 },
    );
  }
}
