export default function Loading() {
  return (
    <div>
      <div className="bg-brand-900">
        <div className="mx-auto max-w-6xl px-4 py-12 space-y-4">
          <div className="skeleton h-4 w-24 opacity-40" />
          <div className="skeleton h-9 w-2/3 opacity-40" />
          <div className="skeleton h-5 w-1/2 opacity-30" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-32 w-full mt-6" />
        </div>
        <div className="skeleton h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}
