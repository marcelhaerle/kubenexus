import { NextResponse } from 'next/server';
import { getCoreApi } from '@/lib/k8s-client';
import { NamespaceSummary } from '@/types/k8s';

export async function GET() {
  try {
    const k8sApi = getCoreApi();
    const response = await k8sApi.listNamespace();

    const summaryItems: NamespaceSummary[] = response.items.map((ns) => ({
      uid: ns.metadata?.uid || 'unknown',
      name: ns.metadata?.name || 'unknown',
      status: ns.status?.phase || 'unknown',
      phase: ns.status?.phase || 'unknown',
      age: new Date(ns.metadata?.creationTimestamp || '').toISOString(),
    }));

    return NextResponse.json({
      items: summaryItems,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch namespaces' },
      { status: 500 },
    );
  }
}
