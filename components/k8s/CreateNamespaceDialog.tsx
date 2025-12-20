'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function CreateNamespaceDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<null | string>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (nsName: string) => {
      const res = await fetch('/api/namespaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nsName }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['namespaces'] });
      setOpen(false);
      setName('');
      setError(null);
    },
    onError: (error) => {
      setError(error.message || 'Failed to create namespace');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Namespace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Namespace</DialogTitle>
        </DialogHeader>
        {error && <div className="text-destructive mb-2">{error}</div>}
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Namespace Name</label>
            <Input
              placeholder="e.g. dev-environment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name) {
                  mutation.mutate(name);
                }
              }}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate(name)}
            disabled={mutation.isPending || !name}
          >
            {mutation.isPending ? 'Creating...' : 'Confirm Creation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
