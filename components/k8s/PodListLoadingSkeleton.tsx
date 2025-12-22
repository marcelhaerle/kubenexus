import { Skeleton } from '../ui/skeleton';

export default function PodListLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-72" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4">
          {/* Header skeleton */}
          <div className="grid grid-cols-[minmax(0,1fr)_120px_80px_140px_80px_48px] gap-4 items-center mb-4 h-8">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-8" />
          </div>

          {/* Rows skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1fr)_120px_80px_140px_80px_48px] gap-4 items-center mt-6 mb-6"
              >
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
