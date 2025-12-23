'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MoreVertical, Search, FileText, Terminal, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toBadgeVariant } from '@/lib/utils';
import PodListLoadingSkeleton from './PodListLoadingSkeleton';
import PodDetailSheet from './PodDetailSheet';
import { formatDistanceToNow } from 'date-fns';
import { PodSummary } from '@/types/k8s';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

const MotionTableRow = motion(TableRow);

export default function PodList({ namespace }: { namespace?: string }) {
  const [filter, setFilter] = useState('');
  const [selectedPod, setSelectedPod] = useState<PodSummary | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [podToDelete, setPodToDelete] = useState<PodSummary | null>(null);

  const queryClient = useQueryClient();

  const openPodDetails = (pod: PodSummary) => {
    setSelectedPod(pod);
    setIsSheetOpen(true);
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pods', namespace],
    queryFn: async () => {
      const url = namespace ? `/api/pods?namespace=${namespace}` : '/api/pods';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: { pods: PodSummary[] } = await res.json();
      return data;
    },
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (pod: PodSummary) => {
      const res = await fetch(`/api/pods/${pod.namespace}/${pod.name}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast.success(`Pod ${variables.name} deleted`);
      setPodToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['pods'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete pod');
    },
  });

  const filteredPods =
    data?.pods.filter((pod: PodSummary) => pod.name.toLowerCase().includes(filter.toLowerCase())) ??
    [];

  if (isLoading) return <PodListLoadingSkeleton />;
  if (isError) return <div className="text-destructive">Error: {(error as Error).message}</div>;

  return (
    <div className="space-y-4">
      {/* Toolbar Section */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter pods by name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        {/* TODO: Add a "Refresh" button manually here? */}
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Pod Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Restarts</TableHead>
              <TableHead>Node</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="w-12.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredPods.map((pod: PodSummary) => (
                <MotionTableRow
                  key={pod.uid}
                  layout // Das hier ist Magie: Es animiert die Position der ANDEREN Zeilen, wenn diese gelöscht wird
                  initial={{ opacity: 0, y: 10 }} // Start: Unsichtbar & leicht unten
                  animate={{ opacity: 1, y: 0 }} // Ziel: Sichtbar & oben
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: { duration: 0.2 },
                  }} // Ende: Fade out & leicht verkleinern
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openPodDetails(pod)}
                >
                  <TableCell className="font-mono text-xs font-bold">{pod.name}</TableCell>
                  <TableCell>
                    <Badge variant={toBadgeVariant(pod.status)}>{pod.status}</Badge>
                  </TableCell>
                  <TableCell>{pod.restarts}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{pod.node}</TableCell>
                  <TableCell className="text-xs italic">
                    {formatDistanceToNow(new Date(pod.creationTimestamp), { addSuffix: true })}
                  </TableCell>
                  {/* Actions Menu */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => toast('Logs feature is coming soon.')}>
                          <FileText className="mr-2 h-4 w-4" /> Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast('Shell feature is coming soon.')}>
                          <Terminal className="mr-2 h-4 w-4" /> Shell
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setPodToDelete(pod)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </MotionTableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <PodDetailSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} pod={selectedPod} />

      <AlertDialog open={!!podToDelete} onOpenChange={(open) => !open && setPodToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the pod{' '}
              <span className="font-bold text-foreground">&quot;{podToDelete?.name}&quot;</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Prevent auto-close to handle async state
                if (podToDelete) deleteMutation.mutate(podToDelete);
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
