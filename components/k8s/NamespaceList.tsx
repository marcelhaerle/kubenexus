'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Layers, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NamespaceSummary } from '@/types/k8s';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function NamespaceList() {
  const queryClient = useQueryClient();

  const sanitizeNamespaceName = (name: string): string => {
    const trimmed = name.trim();
    // Kubernetes namespace names must conform to DNS label standards:
    // consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character.
    if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(trimmed)) {
      throw new Error('Invalid namespace name');
    }
    return encodeURIComponent(trimmed);
  };

  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      const safeName = sanitizeNamespaceName(name);
      const res = await fetch(`/api/namespaces/${safeName}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      // Refresh the list immediately
      queryClient.invalidateQueries({ queryKey: ['namespaces'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete namespace');
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['namespaces'],
    queryFn: async (): Promise<{ items: NamespaceSummary[] }> => {
      const res = await fetch('/api/namespaces');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });

  if (isLoading)
    return <div className="grid grid-cols-3 gap-4">{/* Skeleton Loaders could go here */}</div>;
  if (error) return <div className="text-destructive">Error: {(error as Error).message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.items.map((ns: NamespaceSummary) => (
        <Card
          key={ns.uid}
          className="group hover:shadow-md transition-all border-l-4 border-l-primary/20 hover:border-l-primary"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-bold truncate pr-2">{ns.name}</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <Badge variant={ns.phase === 'Active' ? 'success' : 'destructive'}>
                  {ns.phase}
                </Badge>
                <span className="text-muted-foreground italic">
                  Created {formatDistanceToNow(new Date(ns.age))} ago
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/namespaces/${ns.name}`}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the namespace{' '}
                        <span className="font-bold text-foreground">&quot;{ns.name}&quot;</span> and
                        all resources (Pods, Services, ConfigMaps) within it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(ns.name)}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive hover:bg-destructive/90 text-white"
                      >
                        Delete Namespace
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
