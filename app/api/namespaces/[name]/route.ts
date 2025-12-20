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

export async function DELETE(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  try {
    const k8sApi = getCoreApi();
    // First, we need to get the namespace name by its UID
    const allNamespaces = await k8sApi.listNamespace();
    const namespace = allNamespaces.items.find((ns) => ns.metadata?.uid === uid);

    if (!namespace) {
      return NextResponse.json({ error: 'Namespace not found' }, { status: 404 });
    }

    const namespaceName = namespace.metadata!.name!;

    // Now we can delete the namespace by its name
    await k8sApi.deleteNamespace({
      name: namespaceName,
    });

    return NextResponse.json({ message: `Namespace ${namespaceName} deleted successfully` });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete namespace' },
      { status: 500 },
    );
  }
}
