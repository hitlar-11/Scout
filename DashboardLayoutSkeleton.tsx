export function DashboardLayoutSkeleton() {
  return (
    <div className="flex h-screen w-full">
      <div className="w-64 border-r bg-sidebar animate-pulse">
        <div className="h-16 border-b" />
        <div className="p-4 space-y-2">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
      <div className="flex-1 p-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}


