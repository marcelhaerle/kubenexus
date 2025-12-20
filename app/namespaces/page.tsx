'use client';

import NamespaceList from '@/components/k8s/NamespaceList';

export default function NamespacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Namespaces</h1>
        <p className="text-muted-foreground">
          View and manage the logical partitions of your cluster.
        </p>
      </div>

      <NamespaceList />
    </div>
  );
}
