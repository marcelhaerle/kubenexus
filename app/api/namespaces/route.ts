import { NextRequest, NextResponse } from 'next/server';
import { getCoreApi } from '@/lib/k8s-client';
import { NamespaceSummary } from '@/types/k8s';
import { isK8sError } from '@/lib/errors';

export async function GET() {
  try {
    const k8sApi = getCoreApi();
    const response = await k8sApi.listNamespace();

    const summaryItems: NamespaceSummary[] = response.items.map((ns) => ({
      uid: ns.metadata?.uid || 'unknown',
      name: ns.metadata?.name || 'unknown',
      phase: ns.status?.phase || 'unknown',
      age: new Date(ns.metadata?.creationTimestamp || '').toISOString(),
    }));

    return NextResponse.json({
      items: summaryItems,
    });
  } catch (error: unknown) {
    if (isK8sError(error)) {
      return NextResponse.json({ error: error.body.reason }, { status: error.response.statusCode });
    } else {
      return NextResponse.json({ error: 'Failed to fetch namespaces' }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Namespace name is required' }, { status: 400 });
    }

    // Comprehensive sanitization for DNS-1123 subdomain
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-') // Replace invalid chars with '-'
      .replace(/^-+|-+$/g, '') // Remove leading/trailing '-'
      .replace(/-+/g, '-'); // Collapse multiple '-'

    // Validate: Must match DNS-1123 pattern and be <= 253 chars
    const dns1123Regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    if (!dns1123Regex.test(sanitized) || sanitized.length > 253 || sanitized.length === 0) {
      return NextResponse.json(
        {
          error:
            'Invalid namespace name: must be a valid DNS-1123 subdomain (lowercase alphanumeric, -, ., start/end with alphanumeric, max 253 chars)',
        },
        { status: 400 },
      );
    }

    const k8sApi = getCoreApi();
    const namespace = {
      metadata: { name: sanitized },
    };

    const response = await k8sApi.createNamespace({
      body: namespace,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    if (isK8sError(error)) {
      return NextResponse.json({ error: error.body.reason }, { status: error.response.statusCode });
    } else {
      return NextResponse.json({ error: 'Failed to create namespace' }, { status: 500 });
    }
  }
}
