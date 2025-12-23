'use client';

import CreateNamespaceDialog from '@/components/k8s/CreateNamespaceDialog';
import NamespaceList from '@/components/k8s/NamespaceList';

export default function NamespacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Namespaces</h1>
          <p className="text-muted-foreground">Logical partitions for cluster resources.</p>
        </div>
        <CreateNamespaceDialog />
      </div>

      <NamespaceList />
    </div>
  );
}
