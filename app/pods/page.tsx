import PodList from '@/components/k8s/PodList';

export default function PodPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pods</h1>
          <p className="text-muted-foreground">List of all pods running in the cluster.</p>
        </div>
      </div>

      <PodList />
    </div>
  );
}
