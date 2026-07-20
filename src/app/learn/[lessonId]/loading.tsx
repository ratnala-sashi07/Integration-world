export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] lg:grid lg:grid-cols-[320px_1fr] min-h-[calc(100vh-4rem)]">
      <aside className="hidden lg:block border-r p-4 space-y-3">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-2 w-full mt-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-full" />
        ))}
      </aside>
      <div className="mx-auto max-w-4xl w-full p-4 sm:p-8">
        <div className="skeleton aspect-video w-full rounded-xl" />
        <div className="skeleton h-7 w-1/2 mt-6" />
        <div className="skeleton h-4 w-full mt-4" />
        <div className="skeleton h-4 w-4/5 mt-2" />
      </div>
    </div>
  );
}
