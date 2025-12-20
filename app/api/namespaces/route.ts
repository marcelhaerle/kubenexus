import { NextResponse } from 'next/server';
import { getCoreApi } from '@/lib/k8s-client';

export async function GET() {
  try {
    const k8sApi = getCoreApi();
    const response = await k8sApi.listNamespace();

    return NextResponse.json({
      items: response.items,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch namespaces' },
      { status: 500 },
    );
  }
}
