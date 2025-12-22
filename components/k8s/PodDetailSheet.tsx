'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, FileText } from 'lucide-react';
import { Pod, PodSummary } from '@/types/k8s';
import { toBadgeVariant } from '@/lib/utils';
import { dump } from 'js-yaml';

interface PodDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pod: PodSummary | null;
}

export default function PodDetailSheet({ open, onOpenChange, pod }: PodDetailSheetProps) {
  const { data: fullPod, isLoading } = useQuery({
    queryKey: ['pod', pod?.namespace, pod?.name],
    queryFn: async (): Promise<Pod> => {
      const res = await fetch(`/api/pods/${pod?.namespace}/${pod?.name}`);
      const { pod: fullPod } = await res.json();
      return fullPod;
    },
    enabled: open && !!pod, // Only fetch when sheet is open
  });

  // Guard clause: If no pod is selected, don't render content logic
  if (!pod) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-200 sm:max-w-2xl overflow-y-auto pl-4 pr-4 pb-4">
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl font-mono">{pod.name}</SheetTitle>
            <Badge variant={toBadgeVariant(pod.status)}>{pod.status}</Badge>
          </div>
          <SheetDescription>
            Namespace: <span className="font-mono text-foreground">{pod.namespace}</span>
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="yaml">YAML</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* TAB: OVERVIEW */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Conditions
              </h3>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading details...</div>
              ) : (
                <div className="text-sm">
                  {fullPod?.status?.conditions && fullPod.status.conditions.length > 0 ? (
                    <div className="space-y-3">
                      {fullPod.status.conditions.map((cond) => (
                        <div key={cond.type} className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{cond.type}</span>
                              <Badge
                                variant={
                                  cond.status === 'True'
                                    ? 'success'
                                    : cond.status === 'False'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {cond.status}
                              </Badge>
                            </div>

                            {cond.reason && (
                              <div className="text-xs text-muted-foreground">
                                Reason: {cond.reason}
                              </div>
                            )}
                            {cond.message && (
                              <div className="text-xs text-muted-foreground">{cond.message}</div>
                            )}
                          </div>

                          {cond.lastTransitionTime && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {new Date(cond.lastTransitionTime).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No detailed conditions available yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: YAML */}
          <TabsContent value="yaml" className="mt-4">
            <div className="rounded-md bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-auto max-h-[60vh]">
              <pre>{isLoading ? 'Loading YAML...' : dump(fullPod)}</pre>
            </div>
          </TabsContent>

          {/* TAB: LOGS */}
          <TabsContent value="logs" className="mt-4">
            <div className="rounded-md bg-black p-4 font-mono text-xs text-green-400 h-[60vh] overflow-auto">
              {/* TODO: Connect to WebSocket or Log Stream API */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Log streaming not connected.</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
