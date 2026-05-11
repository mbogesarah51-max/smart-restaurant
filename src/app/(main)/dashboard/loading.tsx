export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted/60 rounded-lg" />
        <div className="h-4 w-72 bg-muted/40 rounded" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-muted/50" />
              <div className="space-y-2">
                <div className="h-6 w-12 bg-muted/50 rounded" />
                <div className="h-3 w-28 bg-muted/40 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-xl border border-border/50 bg-white p-6 space-y-4">
        <div className="h-5 w-40 bg-muted/50 rounded" />
        <div className="h-3 w-56 bg-muted/40 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted/30 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
