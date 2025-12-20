'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, LayoutGrid, ListTree, Code2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import yaml from 'js-yaml';
import { toast } from 'sonner';

export default function NamespaceDetailPage() {
  const { name } = useParams();
  const router = useRouter();

  const {
    data: ns,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['namespace', name],
    queryFn: async () => {
      const res = await fetch(`/api/namespaces/${name}`);
      if (!res.ok) throw new Error('Namespace not found');
      return res.json();
    },
  });

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success('YAML copied to clipboard');
    } catch (err) {
      console.log('Clipboard copy failed', err);
      toast.error('Failed to copy YAML');
    }
  };

  if (isLoading) return <div className="p-8">Loading Namespace Context...</div>;

  if (isError)
    return (
      <div className="p-8 text-red-500">Error: {error?.message || 'Failed to load namespace'}</div>
    );

  if (!ns) return <div className="p-8 text-muted-foreground">No namespace data available</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs / Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/namespaces')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <Badge variant={ns?.status?.phase === 'Active' ? 'success' : 'destructive'}>
              {ns?.status?.phase}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-2">UID: {ns?.metadata?.uid}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutGrid className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <ListTree className="h-4 w-4" /> Resources
          </TabsTrigger>
          <TabsTrigger value="yaml" className="gap-2">
            <Code2 className="h-4 w-4" /> YAML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Labels Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {ns?.metadata?.labels ? (
                  Object.entries(ns.metadata.labels).map(([k, v]) => (
                    <Badge key={k} variant="outline" className="font-mono text-[10px]">
                      {k}: {String(v)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm italic">No labels defined</span>
                )}
              </div>
            </div>

            {/* Annotations Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Annotations</h3>
              <div className="space-y-2">
                {ns?.metadata?.annotations ? (
                  Object.entries(ns.metadata.annotations).map(([k, v]) => (
                    <div key={k} className="text-xs bg-muted/30 p-2 rounded border truncate">
                      <span className="font-bold">{k}:</span> {String(v)}
                    </div>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm italic">No annotations</span>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground">
            <p>
              Resource explorer for <span className="font-bold">{name}</span> coming soon.
            </p>
            <p className="text-xs">
              This will show Pods, Services, and Deployments filtered by this namespace.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="yaml" className="mt-6">
          <div className="rounded-xl border bg-slate-950 p-6 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-400 font-mono">manifest.yaml</h3>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                onClick={() => copyToClipboard(yaml.dump(ns))}
              >
                Copy YAML
              </Button>
            </div>
            <pre className="text-xs md:text-sm text-slate-300 font-mono overflow-auto max-h-screen leading-relaxed">
              {ns ? yaml.dump(ns) : 'No data available'}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
