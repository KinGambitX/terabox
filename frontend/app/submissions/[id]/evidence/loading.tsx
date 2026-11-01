export default function EvidenceLoading() {
  return <main className="grid gap-6 p-5 sm:p-8" aria-label="Loading evidence" aria-busy="true">
    <div className="h-24 animate-pulse rounded-lg bg-workspace-soft motion-reduce:animate-none" />
    <div className="grid gap-3 md:grid-cols-2"><div className="h-32 animate-pulse rounded-lg bg-workspace-soft motion-reduce:animate-none" /><div className="h-32 animate-pulse rounded-lg bg-workspace-soft motion-reduce:animate-none" /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><div className="h-[420px] animate-pulse rounded-lg bg-workspace-soft motion-reduce:animate-none" /><div className="h-64 animate-pulse rounded-lg bg-workspace-soft motion-reduce:animate-none" /></div>
  </main>;
}
