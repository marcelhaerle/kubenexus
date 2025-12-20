import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Namespace name is required' }, { status: 400 });
    }

    const k8sApi = getCoreApi();
    const namespace = {
      metadata: { name: name.toLowerCase().replace(/\s+/g, '-') }, // Basic K8s name sanitization
    };

    const response = await k8sApi.createNamespace({
      body: namespace,
    });

    return NextResponse.json(response.spec, { status: 201 });
  } catch (error: unknown) {
    const message =
      (error as { body?: { message?: string } }).body?.message || 'Failed to create namespace';
    const status = (error as { response?: { statusCode?: number } }).response?.statusCode || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
