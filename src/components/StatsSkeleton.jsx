export default function StatsSkeleton() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <header>
        <div className="h-3 w-16 rounded bg-bg-tertiary animate-pulse" />
        <div className="mt-2 h-9 w-40 rounded-lg bg-bg-tertiary animate-pulse" />
      </header>

      <div className="card space-y-4">
        <div className="flex justify-between">
          <div className="h-5 w-24 rounded bg-bg-tertiary animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded-full bg-bg-tertiary animate-pulse" />
            <div className="h-8 w-16 rounded-full bg-bg-tertiary animate-pulse" />
          </div>
        </div>
        <div className="h-48 rounded-xl bg-bg-tertiary animate-pulse" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="h-5 w-20 rounded bg-bg-tertiary animate-pulse mb-4" />
          <div className="h-40 rounded-xl bg-bg-tertiary animate-pulse" />
        </div>
        <div className="card">
          <div className="h-5 w-24 rounded bg-bg-tertiary animate-pulse mb-4" />
          <div className="h-40 rounded-xl bg-bg-tertiary animate-pulse" />
        </div>
      </div>

      <div className="card">
        <div className="h-5 w-28 rounded bg-bg-tertiary animate-pulse mb-4" />
        <div className="h-32 rounded-xl bg-bg-tertiary animate-pulse" />
      </div>

      <div className="card">
        <div className="h-5 w-20 rounded bg-bg-tertiary animate-pulse mb-4" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
